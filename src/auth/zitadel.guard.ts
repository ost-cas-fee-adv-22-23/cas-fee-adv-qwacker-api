import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ZitadelAuthGuard extends AuthGuard('zitadel-introspection') {}

@Injectable()
export class OptionalZitadelAuthGuard extends ZitadelAuthGuard {
  handleRequest<TUser = any>(_: any, user: any): TUser {
    return user;
  }
}
