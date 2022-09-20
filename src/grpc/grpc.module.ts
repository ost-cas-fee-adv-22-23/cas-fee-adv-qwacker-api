import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { PostsService } from './posts.grpc';

@Module({
  imports: [DataModule],
  controllers: [PostsService],
})
export class GrpcModule {}
