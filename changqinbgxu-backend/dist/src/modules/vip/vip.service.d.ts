import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { VipPlan } from '../../database/entities/vip-plan.entity';
import { VipOrder } from '../../database/entities/vip-order.entity';
import { User } from '../../database/entities/user.entity';
import { CreateOrderDto, VipPlanResponseDto, VipOrderResponseDto, CreateOrderResultDto } from './dto/vip.dto';
import { WechatPayService } from '../payment/wechat-pay.service';
export declare class VipService {
    private readonly vipPlanRepository;
    private readonly vipOrderRepository;
    private readonly userRepository;
    private readonly configService;
    private readonly wechatPayService;
    private readonly logger;
    constructor(vipPlanRepository: Repository<VipPlan>, vipOrderRepository: Repository<VipOrder>, userRepository: Repository<User>, configService: ConfigService, wechatPayService: WechatPayService);
    getPlans(): Promise<{
        plans: VipPlanResponseDto[];
    }>;
    createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<CreateOrderResultDto>;
    getOrder(userId: string, orderId: string): Promise<VipOrderResponseDto>;
    mockCompleteOrder(userId: string, orderId: string): Promise<VipOrderResponseDto>;
    handleWechatNotify(bodyStr: string, headers: Record<string, string | string[] | undefined>): Promise<{
        code: string;
        message: string;
    }>;
    private finalizeOrderPaid;
    completePayment(orderId: string): Promise<VipOrderResponseDto>;
    private formatOrderResponse;
}
