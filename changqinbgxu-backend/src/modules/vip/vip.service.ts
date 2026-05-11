import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipPlan } from '../../database/entities/vip-plan.entity';
import { VipOrder } from '../../database/entities/vip-order.entity';
import { User } from '../../database/entities/user.entity';
import { CreateOrderDto, VipPlanResponseDto, VipOrderResponseDto } from './dto/vip.dto';

@Injectable()
export class VipService {
  private readonly logger = new Logger(VipService.name);

  constructor(
    @InjectRepository(VipPlan)
    private readonly vipPlanRepository: Repository<VipPlan>,
    @InjectRepository(VipOrder)
    private readonly vipOrderRepository: Repository<VipOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取 VIP 套餐列表
   */
  async getPlans(): Promise<{ plans: VipPlanResponseDto[] }> {
    const plans = await this.vipPlanRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    return {
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        durationMonths: plan.durationMonths,
        price: Number(plan.price),
        originalPrice: plan.originalPrice ? Number(plan.originalPrice) : undefined,
        features: plan.features || [],
        tag: plan.tag,
        sortOrder: plan.sortOrder,
      })),
    };
  }

  /**
   * 创建订单
   */
  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<VipOrderResponseDto> {
    const { planId, payMethod = 'wechat' } = createOrderDto;

    // 检查套餐是否存在
    const plan = await this.vipPlanRepository.findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('套餐不存在或已下架');
    }

    // 创建订单
    const order = this.vipOrderRepository.create({
      userId,
      planId,
      amount: plan.price,
      status: 'pending',
      payMethod,
    });

    const savedOrder = await this.vipOrderRepository.save(order);

    this.logger.log(`用户 ${userId} 创建了 VIP 订单 ${savedOrder.id}，套餐 ${planId}`);

    return this.formatOrderResponse(savedOrder, plan);
  }

  /**
   * 查询订单状态
   */
  async getOrder(userId: string, orderId: string): Promise<VipOrderResponseDto> {
    const order = await this.vipOrderRepository.findOne({
      where: { id: orderId },
      relations: ['plan'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权查看此订单');
    }

    return this.formatOrderResponse(order, order.plan);
  }

  /**
   * 完成支付（回调处理）
   */
  async completePayment(orderId: string): Promise<VipOrderResponseDto> {
    const order = await this.vipOrderRepository.findOne({
      where: { id: orderId },
      relations: ['plan'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new ForbiddenException('订单状态不允许支付');
    }

    // 更新订单状态
    order.status = 'paid';
    order.payTime = new Date();

    // 计算到期时间
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + order.plan.durationMonths);
    order.expiresAt = expiresAt;

    await this.vipOrderRepository.save(order);

    // 更新用户 VIP 状态
    await this.userRepository.update(order.userId, {
      isVip: true,
      vipExpiry: expiresAt,
    });

    this.logger.log(`订单 ${orderId} 支付完成，用户 ${order.userId} 成为 VIP`);

    return this.formatOrderResponse(order, order.plan);
  }

  /**
   * 格式化订单响应
   */
  private formatOrderResponse(order: VipOrder, plan?: VipPlan): VipOrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      planId: order.planId,
      amount: Number(order.amount),
      status: order.status,
      payMethod: order.payMethod,
      payTime: order.payTime,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            durationMonths: plan.durationMonths,
            price: Number(plan.price),
            originalPrice: plan.originalPrice ? Number(plan.originalPrice) : undefined,
            features: plan.features || [],
            tag: plan.tag,
            sortOrder: plan.sortOrder,
          }
        : undefined,
    };
  }
}
