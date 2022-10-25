import {
  ArgsType,
  createUnionType,
  Field,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType({
  description: 'The result of a list query.',
})
export class ListResult {
  @Field(() => Int, { description: 'Total number of posts in the system.' })
  count: number;

  @Field(() => [ListPostResult])
  data: Array<typeof ListPostResult>;

  @Field(() => Int, {
    nullable: true,
    description: 'If set, shows the offset of the next page.',
  })
  nextPageOffset?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'If set, shows the offset of the previous page.',
  })
  previousPageOffset?: number;
}

@ObjectType({ description: 'The result of a search query.' })
export class SearchResult {
  @Field(() => Int, { description: 'Total number of posts in the search.' })
  count: number;

  @Field(() => [SearchPostResult])
  data: Array<typeof SearchPostResult>;

  @Field(() => Int, {
    nullable: true,
    description: 'If set, shows the offset of the next page.',
  })
  nextPageOffset?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'If set, shows the offset of the previous page.',
  })
  previousPageOffset?: number;
}

@ObjectType({
  description:
    'A deleted post. The content is not visible anymore, but replies are.',
})
export class DeletedPost {
  @Field(() => ID, { description: 'The ID (ulid) of the post.' })
  id: string;

  @Field(() => String, { description: 'The user ID of the creator.' })
  creator: string;
}

@ObjectType({
  description: 'The result of a user list query.',
})
export class UserListResult {
  @Field(() => Int, { description: 'Total number of users in the system.' })
  count: number;

  @Field(() => [User])
  data: User[];

  @Field(() => Int, {
    nullable: true,
    description: 'If set, shows the offset of the next page.',
  })
  nextPageOffset?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'If set, shows the offset of the previous page.',
  })
  previousPageOffset?: number;
}

@ObjectType({
  description: 'A user in the system.',
})
export class User {
  @Field(() => ID, { description: 'The ID of the user.' })
  id: string;

  @Field(() => String, { description: 'The userName of the user.' })
  userName: string;

  @Field(() => String, { description: 'The first name of the user.' })
  firstName: string;

  @Field(() => String, { description: 'The last name of the user.' })
  lastName: string;

  @Field(() => String, {
    description:
      'The (optional) avatar URL of the user. May be an empty string.',
  })
  avatarUrl: string;
}

@ObjectType({ isAbstract: true })
class NonDeletedPostBase extends DeletedPost {
  @Field(() => String)
  text: string;

  @Field(() => String, {
    nullable: true,
    description: 'If set, contains an url to the media.',
  })
  mediaUrl?: string;

  @Field(() => String, { nullable: true })
  mediaType?: string;

  @Field(() => Int)
  likeCount: number;

  @Field(() => Boolean)
  likedByUser: boolean;
}

@ObjectType({
  description:
    'A post. A post contains text and optionally media. It can be liked and replied to.',
})
export class Post extends NonDeletedPostBase {
  @Field(() => Int)
  replyCount: number;
}

@ObjectType({
  description:
    'A reply. Similar to a post, but it is always a reply to another post.',
})
export class Reply extends NonDeletedPostBase {
  @Field(() => ID)
  parentId: string;
}

export const ListPostResult = createUnionType({
  name: 'ListPostResult',
  types: () => [Post, DeletedPost] as const,
});

export const RepliesResult = createUnionType({
  name: 'RepliesResult',
  types: () => [Reply, DeletedPost] as const,
});

export const SearchPostResult = createUnionType({
  name: 'SearchPostResult',
  types: () => [Post, Reply] as const,
});

export const CreatePostResult = createUnionType({
  name: 'CreatePostResult',
  types: () => [Post, Reply] as const,
});

@ArgsType()
export class SearchParams {
  @Field({
    nullable: true,
    description:
      'If set, defines the search term that must match in the text of the post.',
  })
  text?: string;

  @Field(() => [String], {
    defaultValue: [],
    description: 'A list of tags (#TAG) that must be present in the post.',
  })
  tags: string[];

  @Field(() => [String], {
    defaultValue: [],
    description:
      'A list of user mentions (@USER) that must be present in the post.',
  })
  mentions: string[];

  @Field({
    nullable: true,
    description:
      'If set, true returns only replies while false returns only posts. If omitted, both are returned.',
  })
  isReply?: boolean;

  @Field(() => Int, { defaultValue: 0, description: 'The offset of the page.' })
  offset?: number;

  @Field(() => Int, {
    defaultValue: 100,
    description:
      'The limit of posts that is returned. Minimum: 1, Maximum: 1000.',
  })
  limit?: number;
}
