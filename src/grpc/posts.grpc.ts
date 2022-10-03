import { Metadata } from '@grpc/grpc-js';
import { UseGuards } from '@nestjs/common';
import { GrpcMethod, GrpcService, RpcException } from '@nestjs/microservices';
import { User } from 'src/auth/user';
import { AggregatedPost } from 'src/entities';
import { PostsService as DataPostsService } from '../data/posts.service';
import { Empty } from './gen/google/protobuf/Empty';
import { CreateRequest } from './gen/posts/CreateRequest';
import { IdRequest } from './gen/posts/IdRequest';
import { ListRequest } from './gen/posts/ListRequest';
import { ListResponse } from './gen/posts/ListResponse';
import { PostResult } from './gen/posts/PostResult';
import { RepliesResponse } from './gen/posts/RepliesResponse';
import { SearchRequest } from './gen/posts/SearchRequest';
import { SearchResponse } from './gen/posts/SearchResponse';
import {
  OptionalZitadelGrpcAuthGuard,
  ZitadelGrpcAuthGuard,
} from './grpc.guard';

const grpcUser = (metadata: Metadata): User =>
  metadata.get('user')?.[0] as any as User;

const mapPostResult =
  (user: User) =>
  (post: AggregatedPost): PostResult => ({
    id: post.id,
    creator: user?.sub,
    content: post.deleted ? 'deleted' : post.parentId ? 'reply' : 'post',
    post:
      !post.deleted && !post.parentId
        ? {
            text: post.text,
            media_url: post.mediaUrl ? { value: post.mediaUrl } : null,
            media_type: post.mediaType ? { value: post.mediaType } : null,
            like_count: post.likers.length,
            liked_by_user: post.likers.includes(user?.sub ?? ''),
            reply_count: post.replyCount,
          }
        : undefined,
    reply:
      !post.deleted && post.parentId
        ? {
            text: post.text,
            media_url: post.mediaUrl ? { value: post.mediaUrl } : null,
            media_type: post.mediaType ? { value: post.mediaType } : null,
            like_count: post.likers.length,
            liked_by_user: post.likers.includes(user?.sub ?? ''),
            parent_id: post.parentId,
          }
        : undefined,
    deleted: post.deleted ? {} : undefined,
  });

@GrpcService()
export class PostsService {
  constructor(private readonly posts: DataPostsService) {}

  @UseGuards(OptionalZitadelGrpcAuthGuard)
  @GrpcMethod()
  async list(
    { offset = 0, limit = 100, newer_than }: ListRequest,
    metadata: Metadata,
  ): Promise<ListResponse> {
    const user = grpcUser(metadata);
    const { count, posts } = await this.posts.list(offset, limit, newer_than);
    return {
      count,
      data: posts.map(mapPostResult(user)),
      next:
        count > offset + limit
          ? {
              limit,
              offset: offset + limit,
            }
          : null,
      previous:
        offset > 0
          ? {
              limit,
              offset: Math.max(offset - limit, 0),
            }
          : null,
    };
  }

  @UseGuards(OptionalZitadelGrpcAuthGuard)
  @GrpcMethod()
  async search(
    request: SearchRequest,
    metadata: Metadata,
  ): Promise<SearchResponse> {
    const user = grpcUser(metadata);
    const { offset = 0, limit = 100, is_reply, mentions, tags, text } = request;
    const { count, posts } = await this.posts.search(
      {
        mentions,
        tags,
        text: text?.value,
        isReply: is_reply?.value,
      },
      offset,
      limit,
    );

    return {
      count,
      data: posts.map(mapPostResult(user)),
      next:
        count > offset + limit
          ? { ...request, limit, offset: offset + limit }
          : null,
      previous:
        offset > 0
          ? { ...request, limit, offset: Math.max(offset - limit, 0) }
          : null,
    };
  }

  @UseGuards(OptionalZitadelGrpcAuthGuard)
  @GrpcMethod()
  async replies(
    { id }: IdRequest,
    metadata: Metadata,
  ): Promise<RepliesResponse> {
    if (!id) {
      throw new RpcException('id is required');
    }

    const user = grpcUser(metadata);
    const { replies } = await this.posts.getPostWithReplies(id);

    return {
      data: replies.map(mapPostResult(user)),
    };
  }

  @UseGuards(ZitadelGrpcAuthGuard)
  @GrpcMethod()
  async create(
    { text, image, parent_id }: CreateRequest,
    metadata: Metadata,
  ): Promise<PostResult> {
    const user = grpcUser(metadata);
    if (!user || !user.sub) {
      throw new RpcException('user not authorized');
    }

    if (!text) {
      throw new RpcException('text is required');
    }

    if (image && (!image.data || !image.type)) {
      throw new RpcException('image url and type are required');
    }

    const post = await this.posts.create({
      text,
      parentId: parent_id?.value,
      userId: user.sub,
      mediaBuffer: image?.data as Buffer | undefined,
      mediaType: image?.type,
    });
    return mapPostResult(user)(post);
  }

  @UseGuards(ZitadelGrpcAuthGuard)
  @GrpcMethod()
  async delete({ id }: IdRequest, metadata: Metadata): Promise<Empty> {
    const user = grpcUser(metadata);
    if (!user || !user.sub) {
      throw new RpcException('user not authorized');
    }

    if (!id) {
      throw new RpcException('id is required');
    }

    await this.posts.delete(id, user.sub);
    return {};
  }

  @UseGuards(ZitadelGrpcAuthGuard)
  @GrpcMethod()
  async like({ id }: IdRequest, metadata: Metadata): Promise<Empty> {
    const user = grpcUser(metadata);
    if (!user || !user.sub) {
      throw new RpcException('user not authorized');
    }

    if (!id) {
      throw new RpcException('id is required');
    }

    await this.posts.like(id, user.sub);
    return {};
  }

  @UseGuards(ZitadelGrpcAuthGuard)
  @GrpcMethod()
  async unlike({ id }: IdRequest, metadata: Metadata): Promise<Empty> {
    const user = grpcUser(metadata);
    if (!user || !user.sub) {
      throw new RpcException('user not authorized');
    }

    if (!id) {
      throw new RpcException('id is required');
    }

    await this.posts.unlike(id, user.sub);
    return {};
  }
}
