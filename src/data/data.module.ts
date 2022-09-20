import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like, Post } from 'src/entities';
import { PostsService } from './posts/posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like])],
  providers: [PostsService],
  exports: [PostsService],
})
export class DataModule {}
