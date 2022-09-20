import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { PostsController } from './posts/posts.controller';

@Module({
  imports: [DataModule],
  controllers: [PostsController],
})
export class RestModule {}
