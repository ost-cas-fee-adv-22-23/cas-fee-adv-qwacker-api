import { Controller, Get } from '@nestjs/common';
import { PostsService } from 'src/data/posts/posts.service';
import { Post } from 'src/entities';

@Controller('rest/posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  async test(): Promise<Post[]> {
    return this.posts.all();
  }
}
