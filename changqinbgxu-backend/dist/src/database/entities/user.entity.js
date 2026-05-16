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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("./match.entity");
const conversation_entity_1 = require("./conversation.entity");
const message_entity_1 = require("./message.entity");
const vip_order_entity_1 = require("./vip-order.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true, length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wechat_openid', unique: true, nullable: true, length: 100 }),
    __metadata("design:type", String)
], User.prototype, "wechatOpenid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wechat_unionid', nullable: true, length: 100 }),
    __metadata("design:type", String)
], User.prototype, "wechatUnionid", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: '' }),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, default: '' }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['male', 'female', 'unknown'],
        default: 'unknown',
    }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: '' }),
    __metadata("design:type", String)
], User.prototype, "hometown", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: '' }),
    __metadata("design:type", String)
], User.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: '' }),
    __metadata("design:type", String)
], User.prototype, "zodiac", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'zodiac_sign', length: 20, default: '' }),
    __metadata("design:type", String)
], User.prototype, "zodiacSign", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: '' }),
    __metadata("design:type", String)
], User.prototype, "mbti", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: '' }),
    __metadata("design:type", String)
], User.prototype, "riyuan", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: '' }),
    __metadata("design:type", String)
], User.prototype, "education", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: '' }),
    __metadata("design:type", String)
], User.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'school_tier',
        type: 'enum',
        enum: ['985', '211'],
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "schoolTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: '' }),
    __metadata("design:type", String)
], User.prototype, "occupation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_level', length: 20, default: '' }),
    __metadata("design:type", String)
], User.prototype, "jobLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: '' }),
    __metadata("design:type", String)
], User.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: '' }),
    __metadata("design:type", String)
], User.prototype, "income", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: [] }),
    __metadata("design:type", Array)
], User.prototype, "hobbies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_real_name', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isRealName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_face_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isFaceVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legal_name', length: 50, default: '' }),
    __metadata("design:type", String)
], User.prototype, "legalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_card_masked', length: 50, default: '' }),
    __metadata("design:type", String)
], User.prototype, "idCardMasked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_vip', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVip", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vip_expiry', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "vipExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'filter_settings', type: 'json', default: {} }),
    __metadata("design:type", Object)
], User.prototype, "filterSettings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'suspended', 'deleted'],
        default: 'active',
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (match) => match.user),
    __metadata("design:type", Array)
], User.prototype, "matches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conversation) => conversation.user1),
    __metadata("design:type", Array)
], User.prototype, "conversationsAsUser1", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conversation) => conversation.user2),
    __metadata("design:type", Array)
], User.prototype, "conversationsAsUser2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vip_order_entity_1.VipOrder, (order) => order.user),
    __metadata("design:type", Array)
], User.prototype, "vipOrders", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map