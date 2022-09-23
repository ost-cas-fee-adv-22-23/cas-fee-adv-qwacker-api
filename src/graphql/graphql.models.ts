import { createUnionType, Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'The result of a list query.',
})
export class ListResult {
  @Field(() => Int, { description: 'Total number of posts in the system.' })
  count: number;

  @Field(() => [PostResult])
  data: Array<typeof PostResult>;

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

export const PostResult = createUnionType({
  name: 'PostResult',
  types: () => [Post, Reply, DeletedPost] as const,
});

export const SearchPostResult = createUnionType({
  name: 'SearchPostResult',
  types: () => [Post, Reply] as const,
});
