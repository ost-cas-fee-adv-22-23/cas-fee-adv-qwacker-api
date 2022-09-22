import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { stringify } from 'qs';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import {
  OptionalZitadelAuthGuard,
  RestUser,
  ZitadelAuthGuard,
} from './rest.guard';
import { PaginatedResult, Post as PostEntry } from './rest.models';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Get()
  async list(
    @RestUser() user: User,
    @Req() req: Request,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResult<PostEntry>> {
    const o = parseInt(offset ?? '0', 10);
    const l = parseInt(limit ?? '100', 10);
    const { count, posts } = await this.posts.list(o, l);

    return {
      count,
      data: posts.map(PostEntry.mapFromAggregated(user)),
      next:
        count > o + l
          ? `${req.protocol}://${req.get('host')}${req.path}?${stringify({
              offset: o + l,
              limit: l,
            })}`
          : undefined,
      previous:
        o > 0
          ? `${req.protocol}://${req.get('host')}${req.path}?${stringify({
              offset: o - l,
              limit: o - l < 0 ? o : l,
            })}`
          : undefined,
    };
  }

  @UseGuards(OptionalZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Post('search')
  search(@RestUser() a: any): Promise<any> {
    return a;
  }

  @UseGuards(ZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Post()
  create(@RestUser() a: any): Promise<any> {
    return a;
  }

  @UseGuards(ZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Post(':id')
  reply(@RestUser() a: any): Promise<any> {
    return a;
  }

  @UseGuards(ZitadelAuthGuard)
  @ApiBearerAuth('ZITADEL')
  @Delete()
  delete(@RestUser() a: any): Promise<any> {
    return a;
  }
}
