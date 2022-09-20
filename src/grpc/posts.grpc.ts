import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { PostsService as DataPostsService } from '../data/posts/posts.service';
import { GetAllResponse } from './gen/posts/GetAllResponse';

@GrpcService()
export class PostsService {
  constructor(private readonly posts: DataPostsService) {}

  @GrpcMethod()
  async getAll(): Promise<GetAllResponse> {
    const posts = await this.posts.all();
    return { posts };
  }
}
