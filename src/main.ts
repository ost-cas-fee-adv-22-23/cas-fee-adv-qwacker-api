import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  ClientOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { description, version } from '../package.json';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  const config = app.get<ConfigService>(ConfigService);

  const grpcOptions: ClientOptions = {
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
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('rest', app, document);

  await app.startAllMicroservices();
  await app.listen(config.get<number>('HTTP_PORT') ?? 3000);
}
bootstrap();
