import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';
import { stringify } from 'qs';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import {
  OptionalZitadelAuthGuard,
  RestUser,
  ZitadelAuthGuard,
} from './rest.guard';
import {
  CreatePostParams,
  mapPostResult,
  PaginatedResult,
  PaginatedSearchResult,
  PostResult,
  PostSearchParams,
} from './rest.models';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @ApiSecurity({})
  @Get()
  async list(
    @RestUser() user: User,
    @Req() req: Request,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<PaginatedResult<PostResult>> {
    const { count, posts } = await this.posts.list(offset, limit);

    return {
      count,
      data: posts.map(mapPostResult(user)),
      next:
        count > offset + limit
          ? `${req.protocol}://${req.get('host')}${req.path}?${stringify({
              offset: offset + limit,
              limit: limit,
            })}`
          : undefined,
      previous:
        offset > 0
          ? `${req.protocol}://${req.get('host')}${req.path}?${stringify({
              offset: Math.max(offset - limit, 0),
              limit: limit,
            })}`
          : undefined,
    };
  }

  @UseGuards(OptionalZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @ApiSecurity({})
  @Post('search')
  @HttpCode(200)
  async search(
    @RestUser() user: User,
    @Body() params: PostSearchParams,
  ): Promise<PaginatedSearchResult<PostResult, PostSearchParams>> {
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 100;
    const { count, posts } = await this.posts.search(params, offset, limit);

    return {
      count,
      data: posts.map(mapPostResult(user)),
      next:
        count > offset + limit
          ? {
              ...params,
              offset: offset + limit,
            }
          : undefined,
      previous:
        offset > 0
          ? {
              ...params,
              offset: Math.max(offset - limit, 0),
            }
          : undefined,
    };
  }

  @UseGuards(ZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Post()
  async create(
    @RestUser() user: User,
    @Body() { text }: CreatePostParams,
  ): Promise<PostResult> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    const post = await this.posts.create({ text, userId: user.sub });
    return mapPostResult(user)(post);
  }

  @UseGuards(ZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Post(':id')
  async reply(
    @RestUser() user: User,
    @Param('id') parentId: string,
    @Body() { text }: CreatePostParams,
  ): Promise<PostResult> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    const post = await this.posts.create({ text, userId: user.sub, parentId });
    return mapPostResult(user)(post);
  }

  @UseGuards(ZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Delete()
  delete(@RestUser() user: User): Promise<any> {
    throw '';
  }
}
