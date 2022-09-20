import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Post' })
export class Post {
  @Field(() => ID)
  id: string;
}
