import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createAccessTokenInterceptor,
  createManagementClient,
  ManagementServiceClient,
} from '@zitadel/node/dist/grpc';
import {
  Type,
  User,
  UserFieldName,
} from '@zitadel/node/dist/grpc/generated/zitadel/user';

export type ZitadelUser = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

type HumanUser = User & { type?: { $case: 'human' } };

const mapUser = (user: HumanUser): ZitadelUser => ({
  id: user.id,
  userName: user.userName,
  firstName: user.type?.human?.profile?.firstName ?? 'firstName',
  lastName: user.type?.human?.profile?.lastName ?? 'lastName',
  avatarUrl: user.type?.human?.profile?.avatarUrl ?? 'avatarUrl',
});

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

@Injectable()
export class UsersService {
  private readonly mgmt: ManagementServiceClient;

  constructor(config: ConfigService) {
    this.mgmt = createManagementClient(
      config.getOrThrow('ZITADEL_URL'),
      createAccessTokenInterceptor(config.getOrThrow('ZITADEL_PAT')),
    );
  }

  async get(id: string) {
    const { user } = await this.mgmt.getUserByID({ id });
    if (!user || user.type?.$case !== 'human') {
      throw new Error('User not found');
    }

    return mapUser(user as HumanUser);
  }

  async list(offset: number, limit: number) {
    const { result, details } = await this.mgmt.listUsers({
      queries: [
        { query: { $case: 'typeQuery', typeQuery: { type: Type.TYPE_HUMAN } } },
      ],
      query: {
        limit: clamp(limit, 1, 1000),
        offset,
        asc: true,
      },
      sortingColumn: UserFieldName.USER_FIELD_NAME_USER_NAME,
    });

    return {
      users: result.map(mapUser),
      count: details?.totalResult.toNumber() ?? 0,
    };
  }
}
