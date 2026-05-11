import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type SmsCodeType = 'login' | 'register' | 'reset';

@Entity('sms_codes')
@Index(['phone', 'code'])
@Index(['expiresAt'])
export class SmsCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 10 })
  code: string;

  @Column({
    type: 'enum',
    enum: ['login', 'register', 'reset'],
    default: 'login',
  })
  type: SmsCodeType;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
