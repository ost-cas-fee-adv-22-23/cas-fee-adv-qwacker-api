import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { PostsService } from './posts.grpc';
import { UsersService } from './users.grpc';

@Module({
  imports: [DataModule],
  controllers: [PostsService, UsersService],
})
export class GrpcModule {}
