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
exports.VipPlan = void 0;
const typeorm_1 = require("typeorm");
const vip_order_entity_1 = require("./vip-order.entity");
let VipPlan = class VipPlan {
};
exports.VipPlan = VipPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VipPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], VipPlan.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_months' }),
    __metadata("design:type", Number)
], VipPlan.prototype, "durationMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VipPlan.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VipPlan.prototype, "originalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: [] }),
    __metadata("design:type", Array)
], VipPlan.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VipPlan.prototype, "tag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], VipPlan.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], VipPlan.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VipPlan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vip_order_entity_1.VipOrder, (order) => order.plan),
    __metadata("design:type", Array)
], VipPlan.prototype, "orders", void 0);
exports.VipPlan = VipPlan = __decorate([
    (0, typeorm_1.Entity)('vip_plans')
], VipPlan);
//# sourceMappingURL=vip-plan.entity.js.map