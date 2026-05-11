import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export type MatchAction = 'like' | 'dislike' | 'super_like';

@Entity('matches')
@Index(['userId', 'targetUserId'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'target_user_id' })
  targetUserId: string;

  @Column({
    type: 'enum',
    enum: ['like', 'dislike', 'super_like'],
  })
  action: MatchAction;

  @Column({ name: 'is_mutual', default: false })
  isMutual: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.matches)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.matches)
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;
}
