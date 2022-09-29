import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [DataModule],
  providers: [PostsResolver],
})
export class GraphqlModule {}
