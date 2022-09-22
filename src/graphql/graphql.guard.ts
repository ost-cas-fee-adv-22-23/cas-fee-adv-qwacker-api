import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IAuthModuleOptions } from '@nestjs/passport';
import { ZitadelAuthGuard } from 'src/auth/zitadel.guard';

@Injectable()
export class ZitadelGraphqlAuthGuard extends ZitadelAuthGuard {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions<any> | undefined {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

@Injectable()
export class OptionalZitadelGraphqlAuthGuard extends ZitadelAuthGuard {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions<any> | undefined {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest<TUser = any>(_: any, user: any): TUser {
    return user;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
