import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { stringify } from 'qs';
import { UsersService, ZitadelUser } from 'src/data/users.service';
import { ZitadelAuthGuard } from './rest.guard';
import { PaginatedResult } from './rest.models';
import { userSchema } from './rest.schemas';

@UseGuards(ZitadelAuthGuard)
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('ZITADEL')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({
    description: 'Fetch a paginated list of users, ordered by their username.',
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
      'The amount of users that is returned in one call. Minimum is 1, maximum is 1000. Defaults to 100.',
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
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'The paginated list of users.',
    schema: {
      type: 'object',
      title: 'PaginatedResult',
      properties: {
        data: {
          type: 'array',
          items: {
            uniqueItems: true,
            ...userSchema,
          },
        },
        count: {
          type: 'number',
          example: 1000,
          description: 'The total count of users in the system.',
        },
        next: {
          type: 'string',
          nullable: true,
          example: '/users?offset=100&limit=100',
          description:
            'If filled, hints the next api call to make to fetch the next page.',
        },
        previous: {
          type: 'string',
          nullable: true,
          example: '/users?offset=0&limit=100',
          description:
            'If filled, hints the next api call to make to fetch the previous page.',
        },
      },
    },
  })
  async list(
    @Req() req: Request,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<PaginatedResult<ZitadelUser>> {
    const { count, users } = await this.users.list(offset, limit);

    return {
      count,
      data: users,
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
}
