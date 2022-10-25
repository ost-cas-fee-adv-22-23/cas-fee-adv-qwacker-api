import { Metadata } from '@grpc/grpc-js';
import { UseGuards } from '@nestjs/common';
import { GrpcMethod, GrpcService } from '@nestjs/microservices';
import { User } from 'src/auth/user';
import {
  UsersService as DataUsersService,
  ZitadelUser,
} from '../data/users.service';
import { ListRequest } from './gen/users/ListRequest';
import { ListResponse } from './gen/users/ListResponse';
import { User as GrpcUser } from './gen/users/User';
import { ZitadelGrpcAuthGuard } from './grpc.guard';

const grpcUser = (metadata: Metadata): User =>
  metadata.get('user')?.[0] as any as User;

const mapUser = (user: ZitadelUser): GrpcUser => ({
  id: user.id,
  user_name: user.userName,
  first_name: user.firstName,
  last_name: user.lastName,
  avatar_url: user.avatarUrl,
});

@UseGuards(ZitadelGrpcAuthGuard)
@GrpcService()
export class UsersService {
  constructor(private readonly users: DataUsersService) {}

  @GrpcMethod()
  async list({ offset = 0, limit = 100 }: ListRequest): Promise<ListResponse> {
    const { count, users } = await this.users.list(offset, limit);
    return {
      count,
      data: users.map(mapUser),
      next:
        count > offset + limit
          ? {
              limit,
              offset: offset + limit,
            }
          : null,
      previous:
        offset > 0
          ? {
              limit,
              offset: Math.max(offset - limit, 0),
            }
          : null,
    };
  }

  // @GrpcMethod()
  // async replies(
  //   { id }: IdRequest,
  //   metadata: Metadata,
  // ): Promise<RepliesResponse> {
  //   if (!id) {
  //     throw new RpcException('id is required');
  //   }

  //   const user = grpcUser(metadata);
  //   const { replies } = await this.users.getPostWithReplies(id);

  //   return {
  //     data: replies.map(mapPostResult(user)),
  //   };
  // }
}
