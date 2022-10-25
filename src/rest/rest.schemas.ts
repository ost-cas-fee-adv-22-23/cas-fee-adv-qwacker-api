import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const basePostSchema: Record<string, SchemaObject | ReferenceObject> = {
  id: {
    type: 'string',
    format: 'ulid',
    description: 'ID of the post, defined in the ULID format.',
    externalDocs: {
      url: 'https://github.com/ulid/spec',
      description: 'ULID Specification',
    },
    example: '01GDMMR85BEHP8AKV8ZGGM259K',
  },
  creator: {
    type: 'string',
    description: 'ID of the user who created the post.',
    example: '179944860378202369',
  },
  text: {
    type: 'string',
    description: 'Text in the post.',
    example: 'Hello World! @user #newpost',
  },
  mediaUrl: {
    type: 'string',
    description: 'URL - if any - to the media object attached to this post.',
    example:
      'https://storage.googleapis.com/cas-fee-adv-qwacker-api-local-dev/1094b5e0-5f30-4f0b-a342-ae12936c42ff',
    nullable: true,
  },
  mediaType: {
    type: 'string',
    description:
      'If mediaUrl is set, this field contains the mime type of the media object.',
    example: 'image/png',
    nullable: true,
  },
  likeCount: {
    type: 'number',
    description: 'Number of total likes on this post.',
    example: 42,
  },
  likedByUser: {
    type: 'boolean',
    description:
      'Indicates if the current user liked this post. If the call was made unauthorized, all posts are returned with this field set to false.',
    example: true,
  },
};

export const deletedSchema: SchemaObject | ReferenceObject = {
  type: 'object',
  title: 'Delete',
  properties: {
    type: {
      type: 'deleted',
      description: 'Indicates, that this result is a deleted post.',
      example: 'deleted',
    },
    id: {
      type: 'string',
      format: 'ulid',
      description: 'ID of the post, defined in the ULID format.',
      externalDocs: {
        url: 'https://github.com/ulid/spec',
        description: 'ULID Specification',
      },
      example: '01GDMMR85BEHP8AKV8ZGGM259K',
    },
    creator: {
      type: 'string',
      description: 'ID of the user who created the post.',
      example: '179944860378202369',
    },
    parentId: {
      type: 'string',
      description: 'ID of the parent.',
      example: '01GDMMR85BEHP8AKV8ZGGM259K',
      nullable: true,
    },
  },
};

export const postSchema: SchemaObject | ReferenceObject = {
  type: 'object',
  title: 'Post',
  properties: {
    ...basePostSchema,
    type: {
      type: 'post',
      description: 'Indicates, that this result is a post.',
      example: 'post',
    },
    replyCount: {
      type: 'number',
      description: 'Number of total replies to this post.',
      example: 42,
    },
  },
};

export const userSchema: SchemaObject | ReferenceObject = {
  type: 'object',
  title: 'User',
  properties: {
    id: {
      type: 'string',
      description: 'The (long) ID of the user.',
      example: '179828644301046017',
    },
    userName: {
      type: 'string',
      description:
        'The username of the user. May be used to mention someone in the posts.',
      example: 'johnDoe',
    },
    firstName: {
      type: 'string',
      description: 'The first name of the user.',
      example: 'John',
    },
    lastName: {
      type: 'string',
      description: 'The last name of the user.',
      example: 'Doe',
    },
    avatarUrl: {
      type: 'string',
      description:
        'URL to the avatar of the user. This field may be empty (empty string).',
    },
  },
};

export const replySchema: SchemaObject | ReferenceObject = {
  type: 'object',
  title: 'Reply',
  properties: {
    ...basePostSchema,
    type: {
      type: 'reply',
      description: 'Indicates, that this result is a reply to a post.',
      example: 'reply',
    },
    parentId: {
      type: 'string',
      format: 'ulid',
      description: 'Reference ID to the parent post.',
      example: '01GDMMR85BEHP8AKV8ZGGM259K',
    },
  },
};

export const searchParamsSchema: Record<
  string,
  SchemaObject | ReferenceObject
> = {
  text: {
    type: 'string',
    nullable: true,
    description: 'Search for posts that contain this text.',
    example: 'Hello World',
  },
  tags: {
    type: 'array',
    items: {
      type: 'string',
      nullable: false,
      description: 'Search for posts that contain this tag (#TEXT).',
      example: 'newpost',
    },
  },
  mentions: {
    type: 'array',
    items: {
      type: 'string',
      nullable: false,
      description:
        'Search for posts that contain this mention to a user (@TEXT).',
      example: 'smartive',
    },
  },
  isReply: {
    type: 'boolean',
    nullable: true,
    description:
      'Search for posts that are replies to other posts. If omitted, all posts are searched.',
    example: false,
  },
  offset: {
    type: 'number',
    nullable: true,
    default: 0,
    example: 0,
    description: 'The offset for pagination of further calls.',
  },
  limit: {
    type: 'number',
    nullable: true,
    default: 100,
    example: 500,
    description:
      'The amount of posts that is returned in one call. Minimum is 1, maximum is 1000.',
  },
};
