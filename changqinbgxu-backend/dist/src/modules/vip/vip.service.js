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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vip_plan_entity_1 = require("../../database/entities/vip-plan.entity");
const vip_order_entity_1 = require("../../database/entities/vip-order.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let VipService = VipService_1 = class VipService {
    constructor(vipPlanRepository, vipOrderRepository, userRepository) {
        this.vipPlanRepository = vipPlanRepository;
        this.vipOrderRepository = vipOrderRepository;
        this.userRepository = userRepository;
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
    async completePayment(orderId) {
        const order = await this.vipOrderRepository.findOne({
            where: { id: orderId },
            relations: ['plan'],
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'pending') {
            throw new common_1.ForbiddenException('订单状态不允许支付');
        }
        order.status = 'paid';
        order.payTime = new Date();
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + order.plan.durationMonths);
        order.expiresAt = expiresAt;
        await this.vipOrderRepository.save(order);
        await this.userRepository.update(order.userId, {
            isVip: true,
            vipExpiry: expiresAt,
        });
        this.logger.log(`订单 ${orderId} 支付完成，用户 ${order.userId} 成为 VIP`);
        return this.formatOrderResponse(order, order.plan);
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
        typeorm_2.Repository])
], VipService);
//# sourceMappingURL=vip.service.js.map