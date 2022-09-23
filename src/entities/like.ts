import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post';

@Entity({ name: 'likes' })
export class Like {
  @PrimaryColumn({ length: 26 })
  postId: string;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Post, (p) => p.likes)
  post?: Post;
}
