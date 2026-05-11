import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Match } from './match.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { VipOrder } from './vip-order.entity';

export type Gender = 'male' | 'female' | 'unknown';
export type UserStatus = 'active' | 'suspended' | 'deleted';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true, length: 20 })
  @Index()
  phone: string;

  @Column({ name: 'password_hash', nullable: true, select: false })
  passwordHash: string;

  @Column({ name: 'wechat_openid', unique: true, nullable: true, length: 100 })
  wechatOpenid: string;

  @Column({ name: 'wechat_unionid', nullable: true, length: 100 })
  wechatUnionid: string;

  @Column({ length: 50, default: '' })
  nickname: string;

  @Column({ length: 500, default: '' })
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'unknown'],
    default: 'unknown',
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ length: 100, default: '' })
  hometown: string;

  @Column({ length: 100, default: '' })
  location: string;

  // 生辰信息
  @Column({ length: 10, default: '' })
  zodiac: string;

  @Column({ name: 'zodiac_sign', length: 20, default: '' })
  zodiacSign: string;

  @Column({ length: 10, default: '' })
  mbti: string;

  @Column({ length: 10, default: '' })
  riyuan: string;

  // 教育职业
  @Column({ length: 20, default: '' })
  education: string;

  @Column({ length: 100, default: '' })
  school: string;

  @Column({
    name: 'school_tier',
    type: 'enum',
    enum: ['985', '211', null],
    nullable: true,
  })
  schoolTier: '985' | '211' | null;

  @Column({ length: 50, default: '' })
  occupation: string;

  @Column({ name: 'job_level', length: 20, default: '' })
  jobLevel: string;

  @Column({ length: 100, default: '' })
  company: string;

  @Column({ length: 50, default: '' })
  income: string;

  // 个人介绍
  @Column({ type: 'text', default: '' })
  bio: string;

  @Column({ type: 'json', default: [] })
  hobbies: string[];

  // 认证状态
  @Column({ name: 'is_real_name', default: false })
  isRealName: boolean;

  @Column({ name: 'is_face_verified', default: false })
  isFaceVerified: boolean;

  @Column({ name: 'legal_name', length: 50, default: '' })
  legalName: string;

  @Column({ name: 'id_card_masked', length: 50, default: '' })
  idCardMasked: string;

  // VIP
  @Column({ name: 'is_vip', default: false })
  isVip: boolean;

  @Column({ name: 'vip_expiry', type: 'datetime', nullable: true })
  vipExpiry: Date;

  // 筛选设置
  @Column({ name: 'filter_settings', type: 'json', default: {} })
  filterSettings: Record<string, any>;

  // 基础字段
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  })
  status: UserStatus;

  // 关系
  @OneToMany(() => Match, (match) => match.user)
  matches: Match[];

  @OneToMany(() => Conversation, (conversation) => conversation.user1)
  conversationsAsUser1: Conversation[];

  @OneToMany(() => Conversation, (conversation) => conversation.user2)
  conversationsAsUser2: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => VipOrder, (order) => order.user)
  vipOrders: VipOrder[];
}
