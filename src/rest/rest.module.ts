import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { LikesController } from './likes.controller';
import { PostsController } from './posts.controller';
import { UsersController } from './users.controller';

@Module({
  imports: [DataModule],
  controllers: [PostsController, LikesController, UsersController],
})
export class RestModule {}
