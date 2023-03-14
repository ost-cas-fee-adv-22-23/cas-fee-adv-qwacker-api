import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpException,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { stringify } from 'qs';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import { QueryFailedError } from 'typeorm';
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
import {
  deletedSchema,
  postSchema,
  replySchema,
  searchParamsSchema,
} from './rest.schemas';

@Controller('posts')
@ApiTags('Posts')
@ApiBearerAuth('ZITADEL')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelAuthGuard)
  @Get()
  @ApiOperation({
    description:
      'Fetch a paginated list of posts, ordered by the time of their creation. May contain deleted posts.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description:
      'The offset for pagination of further calls. Defaults to 0 if omitted.',
    examples: {
      'from start': {
        value: 0,
      },
      'skip the first 100': {
        value: 100,
      },
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'The amount of posts that is returned in one call. Minimum is 1, maximum is 1000. Defaults to 100.',
    examples: {
      default: {
        value: 100,
      },
      minimum: {
        value: 1,
      },
      maximum: {
        value: 1000,
      },
    },
  })
  @ApiQuery({
    name: 'newerThan',
    required: false,
    description:
      'The ID of a post, to only return posts that are newer than the given post. If omitted, all posts are returned.',
    examples: {
      'all posts': {
        value: undefined,
      },
      'posts newer than a given post': {
        value: '01GEESHPQQ4NJKNZJN9AKWQW6G',
      },
    },
  })
  @ApiQuery({
    name: 'olderThan',
    required: false,
    description:
      'The ID of a post, to only return posts that are older than the given post. If omitted, all posts are returned.',
    examples: {
      'all posts': {
        value: undefined,
      },
      'posts older than a given post': {
        value: '01GEESHPQQ4NJKNZJN9AKWQW6G',
      },
    },
  })
  @ApiQuery({
    name: 'creator',
    required: false,
    description:
      'The ID of a creator. Only posts of the given creator should be returned. If omitted, all posts are returned.',
    examples: {
      'all posts': {
        value: undefined,
      },
      'posts from Peter Manser': {
        value: '195305735549092097',
      },
    },
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'The paginated list of posts.',
    schema: {
      type: 'object',
      title: 'PaginatedResult',
      properties: {
        data: {
          type: 'array',
          items: {
            uniqueItems: true,
            ...postSchema,
          },
        },
        count: {
          type: 'number',
          example: 1000,
          description: 'The total count of posts in the system.',
        },
        next: {
          type: 'string',
          nullable: true,
          example: '/posts?offset=100&limit=100',
          description:
            'If filled, hints the next api call to make to fetch the next page.',
        },
        previous: {
          type: 'string',
          nullable: true,
          example: '/posts?offset=0&limit=100',
          description:
            'If filled, hints the next api call to make to fetch the previous page.',
        },
      },
    },
  })
  async list(
    @RestUser() user: User,
    @Req() req: Request,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('newerThan') newerThan?: string,
    @Query('olderThan') olderThan?: string,
    @Query('creator') creator?: string,
  ): Promise<PaginatedResult<PostResult>> {
    const { count, posts } = await this.posts.list(
      offset,
      limit,
      newerThan,
      olderThan,
      creator,
    );

    return {
      count,
      data: posts.map(mapPostResult(user)),
      next:
        count > offset + limit
          ? `//${req.get('host')}${req.path}?${stringify({
              offset: offset + limit,
              limit,
              creator,
            })}`
          : undefined,
      previous:
        offset > 0
          ? `//${req.get('host')}${req.path}?${stringify({
              offset: Math.max(offset - limit, 0),
              limit,
              creator,
            })}`
          : undefined,
    };
  }

  @UseGuards(OptionalZitadelAuthGuard)
  @Get(':id')
  @ApiOperation({
    description: 'Get a specific post.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID (ulid) of the post to get.',
    example: '01GEESHPQQ4NJKNZJN9AKWQW6G',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description:
      'The requested post. This may be a post, a reply, or a deleted post.',
    schema: {
      oneOf: [postSchema, replySchema, deletedSchema],
    },
  })
  async single(@RestUser() user: User, @Param('id') id: string) {
    const { post } = await this.posts.getPostWithReplies(id);
    return mapPostResult(user)(post);
  }

  @UseGuards(OptionalZitadelAuthGuard)
  @Get(':id/replies')
  @ApiOperation({
    description: 'Get an ordered list of replies for the given post.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID (ulid) of the post to get the replies from.',
    example: '01GEESHPQQ4NJKNZJN9AKWQW6G',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'The list of replies for a given post.',
    schema: {
      type: 'array',
      uniqueItems: true,
      items: {
        uniqueItems: true,
        ...replySchema,
      },
    },
  })
  async replies(@RestUser() user: User, @Param('id') id: string) {
    const { replies } = await this.posts.getPostWithReplies(id);
    return replies.map(mapPostResult(user));
  }

  @UseGuards(OptionalZitadelAuthGuard)
  @Post('search')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Search for posts or replies in the database. The result is always paginated and ordered by the time of their creation.',
  })
  @ApiBody({
    description: 'The search parameters.',
    required: true,
    schema: {
      type: 'object',
      title: 'SearchParams',
      nullable: false,
      properties: searchParamsSchema,
    },
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'The paginated search result.',
    schema: {
      type: 'object',
      title: 'PaginatedSearchResult',
      properties: {
        data: {
          type: 'array',
          items: {
            uniqueItems: true,
            oneOf: [postSchema, replySchema],
          },
        },
        count: {
          type: 'number',
          example: 1000,
          description: 'The total count of posts in the executed search.',
        },
        next: {
          type: 'object',
          properties: searchParamsSchema,
          nullable: true,
          description:
            'If filled, hints the search parameters for the next page.',
        },
        previous: {
          type: 'object',
          properties: searchParamsSchema,
          nullable: true,
          description:
            'If filled, hints the search parameters for the previous page.',
        },
      },
    },
  })
  async search(
    @RestUser() user: User,
    @Body() { offset = 0, limit = 100, ...params }: PostSearchParams,
  ): Promise<PaginatedSearchResult<PostResult, PostSearchParams>> {
    const { count, posts } = await this.posts.search(params, offset, limit);

    return {
      count,
      data: posts.map(mapPostResult(user)),
      next:
        count > offset + limit
          ? {
              ...params,
              limit,
              offset: offset + limit,
            }
          : undefined,
      previous:
        offset > 0
          ? {
              ...params,
              limit,
              offset: Math.max(offset - limit, 0),
            }
          : undefined,
    };
  }

  @UseGuards(ZitadelAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    description:
      'Create a new post with the logged in user. A post can contain an optional image and must contain text.',
  })
  @ApiBody({
    required: true,
    description: 'The data for the post to create.',
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          example: 'Hello World!',
          description: 'The text of the post.',
        },
        image: {
          type: 'file',
          description: 'The image of the post.',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The post was created.',
    schema: postSchema,
  })
  @ApiResponse({
    status: 400,
    description: 'The uploaded file is not an image or bigger than 5MB.',
  })
  @ApiResponse({ status: 401, description: 'User is unauthorized.' })
  @ApiResponse({ status: 403, description: 'No authenticated user is found.' })
  async create(
    @RestUser() user: User,
    @Body() { text }: CreatePostParams,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/.*/ }),
        ],
      }),
    )
    image?: Express.Multer.File,
  ): Promise<PostResult> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    const post = await this.posts.create({
      text,
      userId: user.sub,
      mediaBuffer: image?.buffer,
      mediaType: image?.mimetype,
    });
    return mapPostResult(user)(post);
  }

  @UseGuards(ZitadelAuthGuard)
  @Post(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    description:
      'Create a reply to a post with the logged in user. A reply can contain an optional image and must contain text.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID (ulid) of the post to reply to.',
    example: '01F1ZQZQXZJZJXZQZQZQZQZQZQ',
    required: true,
    format: 'ulid',
  })
  @ApiBody({
    required: true,
    description: 'The data for the reply to create.',
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          example: 'Hello World!',
          description: 'The text of the reply.',
        },
        image: {
          type: 'file',
          description: 'The image of the reply.',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The reply was created.',
    schema: postSchema,
  })
  @ApiResponse({
    status: 400,
    description: 'The uploaded file is not an image or bigger than 5MB.',
  })
  @ApiResponse({ status: 401, description: 'User is unauthorized.' })
  @ApiResponse({ status: 403, description: 'No authenticated user is found.' })
  @ApiResponse({
    status: 404,
    description: 'No post with the given ID was found.',
  })
  async reply(
    @RestUser() user: User,
    @Param('id') parentId: string,
    @Body() { text }: CreatePostParams,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/.*/ }),
        ],
      }),
    )
    image?: Express.Multer.File,
  ): Promise<PostResult> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    try {
      const post = await this.posts.create({
        text,
        parentId,
        userId: user.sub,
        mediaBuffer: image?.buffer,
        mediaType: image?.mimetype,
      });
      return mapPostResult(user)(post);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new HttpException('Not Found', 404);
      }

      throw e;
    }
  }

  @UseGuards(ZitadelAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    description:
      'Deletes a post or reply if it exists and if the logged in user is the author.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID (ulid) of the post that shall be deleted.',
  })
  @ApiResponse({
    status: 204,
    description: 'The post was deleted if it existed.',
  })
  @ApiResponse({ status: 401, description: 'User is unauthorized.' })
  @ApiResponse({ status: 403, description: 'No authenticated user is found.' })
  async delete(@RestUser() user: User, @Param('id') id: string): Promise<void> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    await this.posts.delete(id, user.sub);
  }
}
