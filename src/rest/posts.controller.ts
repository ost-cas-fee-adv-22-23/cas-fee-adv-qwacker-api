import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { OptionalZitadelAuthGuard } from 'src/auth/zitadel.guard';
import { PostsService } from 'src/data/posts/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelAuthGuard)
  @Get()
  test(@Req() a: any): Promise<any> {
    return a.user;
  }
}
