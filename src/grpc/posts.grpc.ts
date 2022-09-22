import { UseGuards } from '@nestjs/common';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { PostsService as DataPostsService } from '../data/posts.service';
import { GetAllResponse } from './gen/posts/GetAllResponse';
import { GrpcUser, OptionalZitadelGrpcAuthGuard } from './grpc.guard';

@GrpcService()
export class PostsService {
  constructor(private readonly posts: DataPostsService) {}

  @UseGuards(OptionalZitadelGrpcAuthGuard)
  @GrpcMethod()
  async getAll(): Promise<GetAllResponse> {
    return { posts: [] };
  }
}
