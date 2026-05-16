import { User } from './user.entity';
import { VipPlan } from './vip-plan.entity';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export declare class VipOrder {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    status: OrderStatus;
    payMethod: string;
    payTime: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    plan: VipPlan;
}
