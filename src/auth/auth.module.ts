import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZitadelAuthStrategy } from './auth.strategy';

@Module({
  imports: [ConfigModule],
  providers: [ZitadelAuthStrategy],
})
export class AuthModule {}
