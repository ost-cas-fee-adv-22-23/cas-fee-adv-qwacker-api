import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like, Post } from 'src/entities';
import { AggregatedPost } from 'src/entities/post';
import { MediaService } from './media.service';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AggregatedPost, Post, Like]),
    ConfigModule,
  ],
  providers: [PostsService, MediaService],
  exports: [PostsService],
})
export class DataModule {}
