import { Metadata } from '@grpc/grpc-js';
import { UseGuards } from '@nestjs/common';
import { GrpcMethod, GrpcService, RpcException } from '@nestjs/microservices';
import { User } from 'src/auth/user';
import {
  UsersService as DataUsersService,
  ZitadelUser,
} from '../data/users.service';
import { Empty } from './gen/google/protobuf/Empty';
import { GetRequest } from './gen/users/GetRequest';
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

  @GrpcMethod()
  async get({ id }: GetRequest): Promise<GrpcUser> {
    if (!id) {
      throw new RpcException('id is required');
    }

    const user = await this.users.get(id);
    return mapUser(user);
  }

  @GrpcMethod()
  async me(_: Empty, metadata: Metadata): Promise<GrpcUser> {
    const user = grpcUser(metadata);

    return {
      id: user?.sub,
      user_name: user?.username?.replace('@smartive.zitadel.cloud', ''),
      avatar_url: user?.picture,
      first_name: user?.given_name,
      last_name: user?.family_name,
    } as GrpcUser;
  }
}
