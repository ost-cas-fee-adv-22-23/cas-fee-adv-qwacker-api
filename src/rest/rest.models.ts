import { User } from 'src/auth/user';
import { AggregatedPost } from 'src/entities';

export type PaginatedResult<TData> = {
  data: TData[];
  count: number;
  next?: string;
  previous?: string;
};

export class Post {
  id: string;
  creator: string;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  likeCount: number;
  likedByUser: boolean;
  replyCount: number;

  static mapFromAggregated(user: User): (post: AggregatedPost) => Post {
    return (post: AggregatedPost): Post => {
      const result = {
        ...post,
        likers: undefined,
        likeCount: post.likers.length,
        likedByUser: user ? post.likers.includes(user.sub ?? '') : false,
      };
      delete result.likers;

      return result;
    };
  }
}
