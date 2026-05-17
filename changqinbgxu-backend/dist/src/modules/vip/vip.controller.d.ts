import { VipService } from './vip.service';
import { CreateOrderDto } from './dto/vip.dto';
export declare class VipController {
    private readonly vipService;
    constructor(vipService: VipService);
    getPlans(): Promise<{
        plans: import("./dto/vip.dto").VipPlanResponseDto[];
    }>;
    createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<import("./dto/vip.dto").CreateOrderResultDto>;
    getOrder(orderId: string, userId: string): Promise<import("./dto/vip.dto").VipOrderResponseDto>;
    mockPay(orderId: string, userId: string): Promise<import("./dto/vip.dto").VipOrderResponseDto>;
}
