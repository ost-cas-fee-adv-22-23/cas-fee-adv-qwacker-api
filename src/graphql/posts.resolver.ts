import { Query, Resolver } from '@nestjs/graphql';
import { PostsService } from 'src/data/posts/posts.service';
import { Post } from './posts.models';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @Query(() => [Post])
  test(): Promise<Post[]> {
    return this.posts.all();
  }
}
