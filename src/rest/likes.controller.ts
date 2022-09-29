import {
  Controller,
  Delete,
  HttpCode,
  HttpException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import { RestUser, ZitadelAuthGuard } from './rest.guard';

@UseGuards(ZitadelAuthGuard)
@Controller('posts/:id/likes')
@ApiTags('Likes')
@ApiBearerAuth('ZITADEL')
export class LikesController {
  constructor(private readonly posts: PostsService) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({ description: 'Create a like on a specific post.' })
  @ApiParam({ name: 'id', description: 'The ID (ulid) of the post to like.' })
  @ApiResponse({ status: 204, description: 'The like was created.' })
  @ApiResponse({ status: 401, description: 'User is unauthorized.' })
  @ApiResponse({ status: 403, description: 'No authenticated user is found.' })
  async like(@RestUser() user: User, @Param('id') id: string): Promise<void> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    await this.posts.like(id, user.sub);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ description: 'Delete a like on a specific post.' })
  @ApiParam({ name: 'id', description: 'The ID (ulid) of the post to unlike.' })
  @ApiResponse({
    status: 204,
    description:
      'The like was deleted. This is also returned when no specific userId/postId like was found.',
  })
  @ApiResponse({ status: 401, description: 'User is unauthorized.' })
  @ApiResponse({ status: 403, description: 'No authenticated user is found.' })
  async unlike(@RestUser() user: User, @Param('id') id: string): Promise<void> {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    await this.posts.unlike(id, user.sub);
  }
}
