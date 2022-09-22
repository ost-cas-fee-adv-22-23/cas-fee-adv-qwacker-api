import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedPost } from 'src/entities';
import { Repository } from 'typeorm';

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(AggregatedPost)
    private readonly aggregatedPosts: Repository<AggregatedPost>,
  ) {}

  /**
   * Fetch a list of aggregated posts.
   *
   * @param offset The offset to start from
   * @param limit The maximum number of posts to return (max: 1000)
   * @returns An object that contains the posts and the total number of posts
   */
  async list(offset: number, limit: number) {
    limit = clamp(limit, 1, 1000);
    const [posts, count] = await this.aggregatedPosts.findAndCount({
      skip: offset,
      take: limit,
      order: {
        id: 'desc',
      },
    });
    return { posts, count };
  }
}
