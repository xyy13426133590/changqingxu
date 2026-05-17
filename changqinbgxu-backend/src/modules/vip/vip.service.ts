import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipPlan } from '../../database/entities/vip-plan.entity';
import { VipOrder } from '../../database/entities/vip-order.entity';
import { User } from '../../database/entities/user.entity';
import {
  CreateOrderDto,
  VipPlanResponseDto,
  VipOrderResponseDto,
  CreateOrderResultDto,
} from './dto/vip.dto';
import { WechatPayService } from '../payment/wechat-pay.service';
import { randomOutTradeNo } from '../payment/wechat-pay.utils';

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
    private readonly configService: ConfigService,
    private readonly wechatPayService: WechatPayService,
  ) {}

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

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<CreateOrderResultDto> {
    const { planId, payMethod = 'wechat' } = createOrderDto;

    const plan = await this.vipPlanRepository.findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('套餐不存在或已下架');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!user.wechatOpenid?.trim()) {
      throw new BadRequestException('请先使用微信小程序登录后再开通 VIP');
    }

    const outTradeNo = randomOutTradeNo();

    const order = this.vipOrderRepository.create({
      userId,
      planId,
      amount: plan.price,
      status: 'pending',
      payMethod,
      outTradeNo,
    });

    const savedOrder = await this.vipOrderRepository.save(order);
    this.logger.log(`用户 ${userId} 创建 VIP 订单 ${savedOrder.id} out_trade_no=${outTradeNo}`);

    const mode = (this.configService.get<string>('wechatPay.mode') || 'mock').toLowerCase();

    if (mode === 'mock') {
      return {
        order: this.formatOrderResponse(savedOrder, plan),
        paymentMode: 'mock',
      };
    }

    if (!this.wechatPayService.isLiveReady()) {
      this.logger.warn('WECHAT_PAY_MODE=live 但配置不全，降级为 mock');
      return {
        order: this.formatOrderResponse(savedOrder, plan),
        paymentMode: 'mock',
      };
    }

    try {
      const prepayId = await this.wechatPayService.createJsapiTransaction({
        outTradeNo,
        description: `VIP-${plan.name}`,
        amountYuan: Number(plan.price),
        openid: user.wechatOpenid.trim(),
      });

      savedOrder.wechatPrepayId = prepayId;
      await this.vipOrderRepository.save(savedOrder);

      const payment = this.wechatPayService.buildMiniProgramPayment(prepayId);
      return {
        order: this.formatOrderResponse(savedOrder, plan),
        payment,
        paymentMode: 'live',
      };
    } catch (e) {
      this.logger.error(`微信下单失败: ${e instanceof Error ? e.message : e}`);
      throw e instanceof BadRequestException ? e : new BadRequestException('微信支付下单失败');
    }
  }

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
   * 开发环境模拟支付成功（须 VIP_MOCK_PAY=1）
   */
  async mockCompleteOrder(userId: string, orderId: string): Promise<VipOrderResponseDto> {
    if (process.env.NODE_ENV !== 'development' || process.env.VIP_MOCK_PAY !== '1') {
      throw new ForbiddenException('仅开发环境且 VIP_MOCK_PAY=1 时可用');
    }

    const order = await this.vipOrderRepository.findOne({
      where: { id: orderId },
      relations: ['plan'],
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('订单不存在');
    }

    await this.finalizeOrderPaid(order, 'mock_tx_' + order.id);
    const refreshed = await this.vipOrderRepository.findOne({
      where: { id: orderId },
      relations: ['plan'],
    });
    return this.formatOrderResponse(refreshed!, refreshed!.plan);
  }

  /**
   * 微信支付异步通知
   */
  async handleWechatNotify(
    bodyStr: string,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ code: string; message: string }> {
    try {
      const plain = this.wechatPayService.parseAndDecryptNotify(bodyStr, headers) as {
        trade_state?: string;
        out_trade_no?: string;
        transaction_id?: string;
      };

      if (plain.trade_state !== 'SUCCESS') {
        return { code: 'SUCCESS', message: '成功' };
      }

      const outNo = plain.out_trade_no;
      const txId = plain.transaction_id;
      if (!outNo) {
        return { code: 'FAIL', message: '无商户单号' };
      }

      const order = await this.vipOrderRepository.findOne({
        where: { outTradeNo: outNo },
        relations: ['plan'],
      });

      if (!order) {
        this.logger.warn(`通知订单未找到: ${outNo}`);
        return { code: 'SUCCESS', message: '成功' };
      }

      await this.finalizeOrderPaid(order, txId || null);
      return { code: 'SUCCESS', message: '成功' };
    } catch (e) {
      this.logger.error(`支付通知处理失败: ${e instanceof Error ? e.message : e}`);
      return { code: 'FAIL', message: e instanceof Error ? e.message : '处理失败' };
    }
  }

  /** 幂等开通 VIP */
  private async finalizeOrderPaid(order: VipOrder, wechatTransactionId: string | null): Promise<void> {
    const plan = order.plan
      ? order.plan
      : await this.vipPlanRepository.findOne({ where: { id: order.planId } });

    if (!plan) {
      throw new NotFoundException('套餐不存在');
    }

    if (order.status === 'paid') {
      this.logger.log(`订单已支付，幂等跳过: ${order.id}`);
      return;
    }

    if (order.status !== 'pending') {
      throw new ForbiddenException('订单状态不允许支付');
    }

    if (wechatTransactionId) {
      const existed = await this.vipOrderRepository.findOne({
        where: { wechatTransactionId },
      });
      if (existed && existed.id !== order.id) {
        throw new BadRequestException('重复的交易号');
      }
    }

    order.status = 'paid';
    order.payTime = new Date();
    if (wechatTransactionId) {
      order.wechatTransactionId = wechatTransactionId;
    }

    const user = await this.userRepository.findOne({ where: { id: order.userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const now = new Date();
    let base = now;
    if (user.isVip && user.vipExpiry && new Date(user.vipExpiry) > now) {
      base = new Date(user.vipExpiry);
    }
    const expiresAt = new Date(base);
    expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);
    order.expiresAt = expiresAt;

    await this.vipOrderRepository.save(order);

    await this.userRepository.update(order.userId, {
      isVip: true,
      vipExpiry: expiresAt,
    });

    this.logger.log(`订单 ${order.id} 支付完成，用户 ${order.userId} VIP 至 ${expiresAt.toISOString()}`);
  }

  /** 保留原方法名供内部/兼容 */
  async completePayment(orderId: string): Promise<VipOrderResponseDto> {
    const order = await this.vipOrderRepository.findOne({
      where: { id: orderId },
      relations: ['plan'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    await this.finalizeOrderPaid(order, null);

    const refreshed = await this.vipOrderRepository.findOne({
      where: { id: orderId },
      relations: ['plan'],
    });
    return this.formatOrderResponse(refreshed!, refreshed!.plan);
  }

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
