import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedPost, Like, Post } from 'src/entities';
import { Brackets, IsNull, MoreThan, Repository } from 'typeorm';
import { CreateParams, SearchParams } from './data.models';
import { MediaService } from './media.service';

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(AggregatedPost)
    private readonly aggregatedPosts: Repository<AggregatedPost>,
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    @InjectRepository(Like)
    private readonly likes: Repository<Like>,
    private readonly media: MediaService,
  ) {}

  /**
   * Fetch a list of aggregated posts (not replies).
   * Also returns deleted posts.
   */
  async list(offset: number, limit: number, newerThan?: string) {
    limit = clamp(limit, 1, 1000);
    const [posts, count] = await this.aggregatedPosts.findAndCount({
      skip: offset,
      take: limit,
      order: {
        id: 'desc',
      },
      where: {
        parentId: IsNull(),
        id: newerThan ? MoreThan(newerThan) : undefined,
      },
    });
    return { posts, count };
  }

  /**
   * Search for posts and replies according to the provided search params.
   * Results are paginated. Does not find deleted posts.
   */
  async search(
    { isReply, text, mentions, tags }: SearchParams,
    offset: number,
    limit: number,
  ) {
    limit = clamp(limit, 1, 1000);

    let query = this.aggregatedPosts
      .createQueryBuilder('p')
      .skip(offset)
      .take(limit)
      .orderBy('p.id', 'DESC')
      .where('p.deleted = false');

    if (isReply !== undefined) {
      query = query.andWhere(`p.parentId IS ${isReply ? 'NOT' : ''} NULL`);
    }

    if (text !== undefined) {
      query = query.andWhere(`p.text LIKE :text`, { text: `%${text}%` });
    }

    if (mentions !== undefined && mentions.length > 0) {
      query = query.andWhere(
        new Brackets((qb) => {
          for (const m of mentions) {
            qb.orWhere(`p.text LIKE :mention`, { mention: `%@${m}%` });
          }
        }),
      );
    }

    if (tags !== undefined && tags.length > 0) {
      query = query.andWhere(
        new Brackets((qb) => {
          for (const t of tags) {
            qb.orWhere(`p.text LIKE :mention`, { mention: `%#${t}%` });
          }
        }),
      );
    }

    const [posts, count] = await query.getManyAndCount();
    return { posts, count };
  }

  /**
   * Create a new post and return the inserted post.
   */
  async create({
    text,
    userId,
    parentId,
    mediaBuffer,
    mediaType,
  }: CreateParams) {
    const newPost = this.posts.create({ text, creator: userId, parentId });

    if (mediaBuffer !== undefined && mediaType !== undefined) {
      newPost.mediaType = mediaType;
      newPost.mediaUrl = await this.media.upload(mediaBuffer, mediaType);
    }

    const post = await this.posts.save(newPost);

    return await this.aggregatedPosts.findOneOrFail({ where: { id: post.id } });
  }

  async getPostWithReplies(id: string) {
    const post = await this.aggregatedPosts.findOneOrFail({
      where: { id },
    });
    const replies = await this.aggregatedPosts.find({
      where: { parentId: id },
      order: { id: 'desc' },
    });

    return { post, replies };
  }

  async get(id: string) {
    const post = await this.aggregatedPosts.findOneOrFail({
      where: { id },
    });

    return post;
  }

  /**
   * Set a post to "deleted" if it exists.
   */
  async delete(id: string, userId: string) {
    await this.posts
      .createQueryBuilder()
      .update()
      .set({ deleted: true })
      .where({ id, creator: userId })
      .execute();
  }

  /**
   * Create a like on the given post.
   */
  async like(id: string, userId: string) {
    await this.likes
      .createQueryBuilder()
      .insert()
      .into(Like)
      .values({ postId: id, userId })
      .orIgnore()
      .execute();
  }

  /**
   * Remove a like of the given user on the given post.
   */
  async unlike(id: string, userId: string) {
    await this.likes.delete({ postId: id, userId });
  }
}
