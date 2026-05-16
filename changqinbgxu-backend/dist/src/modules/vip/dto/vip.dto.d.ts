export declare class CreateOrderDto {
    planId: string;
    payMethod?: string;
}
export declare class VipPlanResponseDto {
    id: string;
    name: string;
    durationMonths: number;
    price: number;
    originalPrice?: number;
    features: string[];
    tag?: string;
    sortOrder: number;
}
export declare class VipOrderResponseDto {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    status: string;
    payMethod?: string;
    payTime?: Date;
    expiresAt?: Date;
    createdAt: Date;
    plan?: VipPlanResponseDto;
}
