import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like, Post } from 'src/entities';
import { AggregatedPost } from 'src/entities/post';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([AggregatedPost, Post, Like])],
  providers: [PostsService],
  exports: [PostsService],
})
export class DataModule {}
