import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { PostsResolver } from './posts.resolver';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [DataModule],
  providers: [PostsResolver, UsersResolver],
})
export class GraphqlModule {}
