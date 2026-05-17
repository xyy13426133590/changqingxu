"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vip_plan_entity_1 = require("../../database/entities/vip-plan.entity");
const vip_order_entity_1 = require("../../database/entities/vip-order.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const wechat_pay_service_1 = require("../payment/wechat-pay.service");
const wechat_pay_utils_1 = require("../payment/wechat-pay.utils");
let VipService = VipService_1 = class VipService {
    constructor(vipPlanRepository, vipOrderRepository, userRepository, configService, wechatPayService) {
        this.vipPlanRepository = vipPlanRepository;
        this.vipOrderRepository = vipOrderRepository;
        this.userRepository = userRepository;
        this.configService = configService;
        this.wechatPayService = wechatPayService;
        this.logger = new common_1.Logger(VipService_1.name);
    }
    async getPlans() {
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
    async createOrder(userId, createOrderDto) {
        const { planId, payMethod = 'wechat' } = createOrderDto;
        const plan = await this.vipPlanRepository.findOne({
            where: { id: planId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('套餐不存在或已下架');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (!user.wechatOpenid?.trim()) {
            throw new common_1.BadRequestException('请先使用微信小程序登录后再开通 VIP');
        }
        const outTradeNo = (0, wechat_pay_utils_1.randomOutTradeNo)();
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
        const mode = (this.configService.get('wechatPay.mode') || 'mock').toLowerCase();
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
        }
        catch (e) {
            this.logger.error(`微信下单失败: ${e instanceof Error ? e.message : e}`);
            throw e instanceof common_1.BadRequestException ? e : new common_1.BadRequestException('微信支付下单失败');
        }
    }
    async getOrder(userId, orderId) {
        const order = await this.vipOrderRepository.findOne({
            where: { id: orderId },
            relations: ['plan'],
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('无权查看此订单');
        }
        return this.formatOrderResponse(order, order.plan);
    }
    async mockCompleteOrder(userId, orderId) {
        if (process.env.NODE_ENV !== 'development' || process.env.VIP_MOCK_PAY !== '1') {
            throw new common_1.ForbiddenException('仅开发环境且 VIP_MOCK_PAY=1 时可用');
        }
        const order = await this.vipOrderRepository.findOne({
            where: { id: orderId },
            relations: ['plan'],
        });
        if (!order || order.userId !== userId) {
            throw new common_1.NotFoundException('订单不存在');
        }
        await this.finalizeOrderPaid(order, 'mock_tx_' + order.id);
        const refreshed = await this.vipOrderRepository.findOne({
            where: { id: orderId },
            relations: ['plan'],
        });
        return this.formatOrderResponse(refreshed, refreshed.plan);
    }
    async handleWechatNotify(bodyStr, headers) {
        try {
            const plain = this.wechatPayService.parseAndDecryptNotify(bodyStr, headers);
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
        }
        catch (e) {
            this.logger.error(`支付通知处理失败: ${e instanceof Error ? e.message : e}`);
            return { code: 'FAIL', message: e instanceof Error ? e.message : '处理失败' };
        }
    }
    async finalizeOrderPaid(order, wechatTransactionId) {
        const plan = order.plan
            ? order.plan
            : await this.vipPlanRepository.findOne({ where: { id: order.planId } });
        if (!plan) {
            throw new common_1.NotFoundException('套餐不存在');
        }
        if (order.status === 'paid') {
            this.logger.log(`订单已支付，幂等跳过: ${order.id}`);
            return;
        }
        if (order.status !== 'pending') {
            throw new common_1.ForbiddenException('订单状态不允许支付');
        }
        if (wechatTransactionId) {
            const existed = await this.vipOrderRepository.findOne({
                where: { wechatTransactionId },
            });
            if (existed && existed.id !== order.id) {
                throw new common_1.BadRequestException('重复的交易号');
            }
        }
        order.status = 'paid';
        order.payTime = new Date();
        if (wechatTransactionId) {
            order.wechatTransactionId = wechatTransactionId;
        }
        const user = await this.userRepository.findOne({ where: { id: order.userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
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
    async completePayment(orderId) {
        const order = await this.vipOrderRepository.findOne({
            where: { id: orderId },
            relations: ['plan'],
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        await this.finalizeOrderPaid(order, null);
        const refreshed = await this.vipOrderRepository.findOne({
            where: { id: orderId },
            relations: ['plan'],
        });
        return this.formatOrderResponse(refreshed, refreshed.plan);
    }
    formatOrderResponse(order, plan) {
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
};
exports.VipService = VipService;
exports.VipService = VipService = VipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vip_plan_entity_1.VipPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(vip_order_entity_1.VipOrder)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        wechat_pay_service_1.WechatPayService])
], VipService);
//# sourceMappingURL=vip.service.js.map