import {
  Check,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { ulid } from 'ulid';
import { Like } from './like';

@Entity({ name: 'posts' })
@Check(
  `("mediaUrl" is null and "mediaType" is null) or ("mediaUrl" is not null and "mediaType" is not null)`,
)
export class Post {
  @PrimaryColumn({ length: 26 })
  id: string = ulid();

  @Column()
  creator: string;

  @Column()
  text: string;

  @Column({ nullable: true })
  mediaUrl?: string;

  @Column({ nullable: true })
  mediaType?: string;

  @ManyToOne(() => Post, (p) => p.replies)
  parent?: Post;

  @OneToMany(() => Post, (p) => p.parent)
  replies?: Post[];

  @OneToMany(() => Like, (l) => l.post)
  likes?: Like[];
}

@ViewEntity({
  name: 'aggregated_posts',
  expression: `
  with postlikes as (
    select 
      l."postId",
      array_remove(array_agg(l."userId"), null) as likers
    from likes l
    group by l."postId"
  ),
  replies as (
    select
      p."parentId",
      count(p.id) as count
    from posts p
    where p."parentId" is not null
    group by p."parentId"
  )
  select
    p.*,
    coalesce(lp.likers, '{}') as "likers",
    coalesce(r.count, 0) as "replyCount"
  from posts p
    left join postlikes lp on p.id = lp."postId"
    left join replies r on r."parentId" = p.id
  where p."parentId" is null;
  `,
})
export class AggregatedPost {
  @ViewColumn()
  id: string;

  @ViewColumn()
  creator: string;

  @ViewColumn()
  text: string;

  @ViewColumn()
  mediaUrl?: string;

  @ViewColumn()
  mediaType?: string;

  @ViewColumn()
  likers: string[];

  @ViewColumn({ transformer: { from: (v) => +v, to: (v) => v } })
  replyCount: number;
}
