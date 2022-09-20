import {
  Check,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
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
