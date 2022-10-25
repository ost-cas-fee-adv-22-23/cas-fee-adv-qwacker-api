import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from 'src/data/users.service';
import { User as AuthUser } from '../auth/user';
import { GqlUser, ZitadelGraphqlAuthGuard } from './graphql.guard';
import { User, UserListResult } from './graphql.models';

@UseGuards(ZitadelGraphqlAuthGuard)
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

  @Query(() => UserListResult, {
    name: 'users',
    description:
      'Query a list of users defined by the pagination params. The list is ordered by the username.',
  })
  async list(
    @Args('offset', {
      type: () => Int,
      defaultValue: 0,
      description: 'The offset for the pagination. Defaults to 0.',
    })
    offset: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 100,
      description:
        'The limit for the pagination. Defaults to 100. Minimum is 1, maximum is 1000.',
    })
    limit: number,
  ): Promise<UserListResult> {
    const { count, users } = await this.users.list(offset, limit);

    return {
      count,
      data: users,
      nextPageOffset: count > offset + limit ? offset + limit : undefined,
      previousPageOffset: offset > 0 ? Math.max(offset - limit, 0) : undefined,
    };
  }

  @Query(() => User, {
    name: 'me',
    description: 'Get your own authenticated profile.',
  })
  async me(@GqlUser() user: AuthUser): Promise<User> {
    return {
      id: user?.sub,
      userName: user?.username?.replace('@smartive.zitadel.cloud', ''),
      avatarUrl: user?.picture,
      firstName: user?.given_name,
      lastName: user?.family_name,
    } as User;
  }
}
