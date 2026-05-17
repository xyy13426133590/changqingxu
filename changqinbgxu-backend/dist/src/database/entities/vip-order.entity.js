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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipOrder = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const vip_plan_entity_1 = require("./vip-plan.entity");
let VipOrder = class VipOrder {
};
exports.VipOrder = VipOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VipOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], VipOrder.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_id' }),
    __metadata("design:type", String)
], VipOrder.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VipOrder.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'paid', 'cancelled', 'refunded'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], VipOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_method', length: 20, nullable: true }),
    __metadata("design:type", String)
], VipOrder.prototype, "payMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_time', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], VipOrder.prototype, "payTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], VipOrder.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'out_trade_no', length: 32, unique: true, nullable: true }),
    __metadata("design:type", String)
], VipOrder.prototype, "outTradeNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wechat_prepay_id', length: 128, nullable: true }),
    __metadata("design:type", String)
], VipOrder.prototype, "wechatPrepayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wechat_transaction_id', length: 64, nullable: true, unique: true }),
    __metadata("design:type", String)
], VipOrder.prototype, "wechatTransactionId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VipOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VipOrder.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.vipOrders),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], VipOrder.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vip_plan_entity_1.VipPlan, (plan) => plan.orders),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", vip_plan_entity_1.VipPlan)
], VipOrder.prototype, "plan", void 0);
exports.VipOrder = VipOrder = __decorate([
    (0, typeorm_1.Entity)('vip_orders'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status'])
], VipOrder);
//# sourceMappingURL=vip-order.entity.js.map