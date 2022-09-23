import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import { AggregatedPost } from 'src/entities';
import { GqlUser, OptionalZitadelGraphqlAuthGuard } from './graphql.guard';
import {
  ListResult,
  Post,
  PostResult,
  SearchPostResult,
} from './graphql.models';

const mapPostResult =
  (user: User) =>
  (post: AggregatedPost): typeof PostResult =>
    post.deleted
      ? {
          id: post.id,
          creator: post.creator,
        }
      : post.parentId
      ? {
          id: post.id,
          creator: post.creator,
          text: post.text,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          likeCount: post.likers.length,
          likedByUser: post.likers.includes(user?.sub ?? ''),
          parentId: post.parentId,
        }
      : {
          id: post.id,
          creator: post.creator,
          text: post.text,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          likeCount: post.likers.length,
          likedByUser: post.likers.includes(user?.sub ?? ''),
          replyCount: post.replyCount,
        };

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => ListResult, {
    name: 'list',
    description:
      'Query a list of posts defined by the pagination params. The list is ordered by the creation time of the posts. The list may contain deleted posts, but no replies.',
  })
  async list(
    @Args('offset', {
      type: () => Int,
      defaultValue: 0,
      description: 'The offset for the pagination. Defaults to 0.',
    })
    offset: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 100,
      description:
        'The limit for the pagination. Defaults to 100. Minimum is 1, maximum is 1000.',
    })
    limit: number,
    @GqlUser() user: User,
  ): Promise<ListResult> {
    const { count, posts } = await this.posts.list(offset, limit);

    return {
      count,
      data: posts.map(mapPostResult(user)),
      nextPageOffset: count > offset + limit ? offset + limit : undefined,
      previousPageOffset: offset > 0 ? Math.max(offset - limit, 0) : undefined,
    };
  }

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => [SearchPostResult])
  async search(): Promise<Array<typeof SearchPostResult>> {
    throw '';
  }

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => [PostResult])
  async replies(): Promise<Array<typeof PostResult>> {
    throw '';
  }
}
