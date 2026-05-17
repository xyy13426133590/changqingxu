import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { VipPlan } from './vip-plan.entity';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

@Entity('vip_orders')
@Index(['userId'])
@Index(['status'])
export class VipOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'plan_id' })
  planId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending',
  })
  status: OrderStatus;

  @Column({ name: 'pay_method', length: 20, nullable: true })
  payMethod: string;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date;

  /** 微信支付商户单号，≤32 字符；历史订单可能为空 */
  @Column({ name: 'out_trade_no', length: 32, unique: true, nullable: true })
  outTradeNo: string | null;

  @Column({ name: 'wechat_prepay_id', length: 128, nullable: true })
  wechatPrepayId: string | null;

  @Column({ name: 'wechat_transaction_id', length: 64, nullable: true, unique: true })
  wechatTransactionId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.vipOrders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => VipPlan, (plan) => plan.orders)
  @JoinColumn({ name: 'plan_id' })
  plan: VipPlan;
}
