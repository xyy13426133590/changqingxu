import { VipOrder } from './vip-order.entity';
export declare class VipPlan {
    id: string;
    name: string;
    durationMonths: number;
    price: number;
    originalPrice: number;
    features: string[];
    tag: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    orders: VipOrder[];
}
