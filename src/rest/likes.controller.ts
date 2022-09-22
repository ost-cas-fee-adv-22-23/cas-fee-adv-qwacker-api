import {
  Controller,
  Delete,
  HttpCode,
  HttpException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import { RestUser, ZitadelAuthGuard } from './rest.guard';

@UseGuards(ZitadelAuthGuard)
@Controller('posts/:id/likes')
export class LikesController {
  constructor(private readonly posts: PostsService) {}

  @Put()
  @HttpCode(204)
  async like(@RestUser() user: User, @Param('id') id: string): Promise<void> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    await this.posts.like(id, user.sub);
  }

  @Delete()
  @HttpCode(204)
  async unlike(@RestUser() user: User, @Param('id') id: string): Promise<void> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    await this.posts.unlike(id, user.sub);
  }
}
