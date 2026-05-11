import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['userId1', 'userId2'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id_1' })
  userId1: string;

  @Column({ name: 'user_id_2' })
  userId2: string;

  @Column({ name: 'last_message_id', nullable: true })
  lastMessageId: string;

  @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
  lastMessageAt: Date;

  @Column({ name: 'unread_count_1', default: 0 })
  unreadCount1: number;

  @Column({ name: 'unread_count_2', default: 0 })
  unreadCount2: number;

  @Column({ name: 'is_pinned_1', default: false })
  isPinned1: boolean;

  @Column({ name: 'is_pinned_2', default: false })
  isPinned2: boolean;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.conversationsAsUser1)
  @JoinColumn({ name: 'user_id_1' })
  user1: User;

  @ManyToOne(() => User, (user) => user.conversationsAsUser2)
  @JoinColumn({ name: 'user_id_2' })
  user2: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @ManyToOne(() => Message, (message) => message.id)
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message;
}
