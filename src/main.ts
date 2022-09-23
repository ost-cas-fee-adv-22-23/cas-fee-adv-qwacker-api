import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  GrpcOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { description, version } from '../package.json';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);

  const grpcOptions: GrpcOptions = {
    transport: Transport.GRPC,
    options: {
      url: `127.0.0.1:${config.get<number>('GRPC_PORT')}`,
      package: ['posts'],
      protoPath: join(__dirname, './grpc/protos/posts.proto'),
    },
  };
  app.connectMicroservice<MicroserviceOptions>(grpcOptions);

  const swagger = new DocumentBuilder()
    .setTitle('qwacker API')
    .setDescription(description)
    .setVersion(version)
    .setLicense('Apache 2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
    .setContact('smartive AG', 'https://smartive.ch', 'education@smartive.ch')
    .addTag(
      'Posts',
      'All related endpoints for posts. Allows creating, deleting, replying and searching.',
    )
    .addTag('Likes', 'Like and unlike posts.')
    .addBearerAuth(
      {
        type: 'openIdConnect',
        description: 'ZITADEL Authentication',
        name: 'ZITADEL',
        in: 'header',
        openIdConnectUrl:
          'https://cas-fee-advanced-ocvdad.zitadel.cloud/.well-known/openid-configuration',
        flows: {
          authorizationCode: {
            scopes: {
              openid: 'openid',
              profile: 'profile',
            },
          },
        },
      },
      'ZITADEL',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('rest', app, document);

  await app.startAllMicroservices();
  await app.listen(config.get<number>('HTTP_PORT') ?? 3000);
}
bootstrap();
