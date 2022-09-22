import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { PostsService } from 'src/data/posts/posts.service';
import { CurrentUser, OptionalZitadelGraphqlAuthGuard } from './graphql.guard';
import { Post } from './posts.models';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => [Post])
  test(@CurrentUser() u: any): Promise<Post[]> {
    console.log(u);
    return this.posts.all();
  }
}
