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
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const message_entity_1 = require("./message.entity");
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id_1' }),
    __metadata("design:type", String)
], Conversation.prototype, "userId1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id_2' }),
    __metadata("design:type", String)
], Conversation.prototype, "userId2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_message_id', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "lastMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_message_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unread_count_1', default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "unreadCount1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unread_count_2', default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "unreadCount2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_pinned_1', default: false }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isPinned1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_pinned_2', default: false }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isPinned2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_blocked', default: false }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Conversation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.conversationsAsUser1),
    (0, typeorm_1.JoinColumn)({ name: 'user_id_1' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "user1", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.conversationsAsUser2),
    (0, typeorm_1.JoinColumn)({ name: 'user_id_2' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "user2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_entity_1.Message, (message) => message.id),
    (0, typeorm_1.JoinColumn)({ name: 'last_message_id' }),
    __metadata("design:type", message_entity_1.Message)
], Conversation.prototype, "lastMessage", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations'),
    (0, typeorm_1.Index)(['userId1', 'userId2'], { unique: true })
], Conversation);
//# sourceMappingURL=conversation.entity.js.map