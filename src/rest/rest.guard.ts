import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ZitadelAuthGuard extends AuthGuard('zitadel-introspection') {}

@Injectable()
export class OptionalZitadelAuthGuard extends ZitadelAuthGuard {
  private readonly logger = new Logger(OptionalZitadelAuthGuard.name);

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err) {
      this.logger.error(err);
      return null as any;
    }
    return user;
  }
}

export const RestUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user
      ? context.switchToHttp().getRequest().user
      : null,
);
