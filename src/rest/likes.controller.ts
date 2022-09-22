import { Controller, Delete, Put, UseGuards } from '@nestjs/common';
import { PostsService } from 'src/data/posts.service';
import { RestUser, ZitadelAuthGuard } from './rest.guard';

@UseGuards(ZitadelAuthGuard)
@Controller('posts/:id/likes')
export class LikesController {
  constructor(private readonly posts: PostsService) {}

  @Put()
  like(@RestUser() a: any): Promise<any> {
    return a;
  }

  @Delete()
  unlike(@RestUser() a: any): Promise<any> {
    return a;
  }
}
