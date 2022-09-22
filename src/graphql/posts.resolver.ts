import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { PostsService } from 'src/data/posts.service';
import { OptionalZitadelGraphqlAuthGuard } from './graphql.guard';
import { Post } from './posts.models';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => [Post])
  async test(): Promise<Post[]> {
    return [];
  }
}
