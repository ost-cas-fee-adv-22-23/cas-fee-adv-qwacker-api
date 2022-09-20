import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from './data/data.module';
import { Like, Post } from './entities';
import { GraphqlModule } from './graphql/graphql.module';
import { RestModule } from './rest/rest.module';
import { GrpcModule } from './grpc/grpc.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DataModule,
    RestModule,
    GraphqlModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASS'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [Post, Like],
      }),
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      ide: true,
      autoSchemaFile: true,
      sortSchema: true,
    }),
    GrpcModule,
  ],
})
export class AppModule {}
