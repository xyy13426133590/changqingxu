import { Repository } from 'typeorm';
import { VipPlan } from '../../database/entities/vip-plan.entity';
import { VipOrder } from '../../database/entities/vip-order.entity';
import { User } from '../../database/entities/user.entity';
import { CreateOrderDto, VipPlanResponseDto, VipOrderResponseDto } from './dto/vip.dto';
export declare class VipService {
    private readonly vipPlanRepository;
    private readonly vipOrderRepository;
    private readonly userRepository;
    private readonly logger;
    constructor(vipPlanRepository: Repository<VipPlan>, vipOrderRepository: Repository<VipOrder>, userRepository: Repository<User>);
    getPlans(): Promise<{
        plans: VipPlanResponseDto[];
    }>;
    createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<VipOrderResponseDto>;
    getOrder(userId: string, orderId: string): Promise<VipOrderResponseDto>;
    completePayment(orderId: string): Promise<VipOrderResponseDto>;
    private formatOrderResponse;
}
