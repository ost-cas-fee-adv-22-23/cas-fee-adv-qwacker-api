import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ZitadelAuthGuard } from 'src/auth/zitadel.guard';

@Injectable()
export class ZitadelGraphqlAuthGuard extends ZitadelAuthGuard {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

@Injectable()
export class OptionalZitadelGraphqlAuthGuard extends ZitadelGraphqlAuthGuard {
  private readonly logger = new Logger(OptionalZitadelGraphqlAuthGuard.name);

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err) {
      this.logger.error(err);
      return null as any;
    }
    return user;
  }
}

export const GqlUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
