import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { LikesController } from './likes.controller';
import { PostsController } from './posts.controller';

@Module({
  imports: [DataModule],
  controllers: [PostsController, LikesController],
})
export class RestModule {}
