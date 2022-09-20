import { Controller, Get } from '@nestjs/common';
import { PostsService } from 'src/data/posts/posts.service';
import { Post } from 'src/entities';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  test(): Promise<Post[]> {
    return this.posts.all();
  }
}
