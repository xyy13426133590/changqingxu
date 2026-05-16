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
var ConversationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("../../database/entities/conversation.entity");
const message_entity_1 = require("../../database/entities/message.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let ConversationsService = ConversationsService_1 = class ConversationsService {
    constructor(conversationRepository, messageRepository, userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(ConversationsService_1.name);
    }
    async getConversations(userId) {
        const conversations = await this.conversationRepository.find({
            where: [
                { userId1: userId },
                { userId2: userId },
            ],
            relations: ['user1', 'user2', 'lastMessage'],
            order: { lastMessageAt: 'DESC' },
        });
        return conversations.map((conv) => this.formatConversationResponse(conv, userId));
    }
    async createConversation(userId, targetUserId) {
        const targetUser = await this.userRepository.findOne({
            where: { id: targetUserId, status: 'active' },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('目标用户不存在');
        }
        const existingConversation = await this.conversationRepository.findOne({
            where: [
                { userId1: userId, userId2: targetUserId },
                { userId1: targetUserId, userId2: userId },
            ],
            relations: ['user1', 'user2', 'lastMessage'],
        });
        if (existingConversation) {
            return this.formatConversationResponse(existingConversation, userId);
        }
        const conversation = this.conversationRepository.create({
            userId1: userId,
            userId2: targetUserId,
        });
        const savedConversation = await this.conversationRepository.save(conversation);
        this.logger.log(`用户 ${userId} 创建了与 ${targetUserId} 的会话`);
        const withRelations = await this.conversationRepository.findOne({
            where: { id: savedConversation.id },
            relations: ['user1', 'user2', 'lastMessage'],
        });
        if (!withRelations) {
            throw new common_1.NotFoundException('会话创建失败');
        }
        return this.formatConversationResponse(withRelations, userId);
    }
    async deleteConversation(userId, conversationId) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('会话不存在');
        }
        if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
            throw new common_1.ForbiddenException('无权操作此会话');
        }
        await this.conversationRepository.remove(conversation);
        this.logger.log(`用户 ${userId} 删除了会话 ${conversationId}`);
        return { message: '会话已删除' };
    }
    async togglePin(userId, conversationId) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('会话不存在');
        }
        if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
            throw new common_1.ForbiddenException('无权操作此会话');
        }
        const isUser1 = conversation.userId1 === userId;
        if (isUser1) {
            conversation.isPinned1 = !conversation.isPinned1;
        }
        else {
            conversation.isPinned2 = !conversation.isPinned2;
        }
        await this.conversationRepository.save(conversation);
        this.logger.log(`用户 ${userId} ${isUser1 ? conversation.isPinned1 : conversation.isPinned2 ? '置顶' : '取消置顶'}了会话 ${conversationId}`);
        return { isPinned: isUser1 ? conversation.isPinned1 : conversation.isPinned2 };
    }
    async getMessages(userId, conversationId, page = 1, limit = 20) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('会话不存在');
        }
        if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
            throw new common_1.ForbiddenException('无权查看此会话');
        }
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { conversationId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { messages: messages.reverse(), total };
    }
    formatConversationResponse(conversation, currentUserId) {
        const isUser1 = conversation.userId1 === currentUserId;
        const targetUserId = isUser1 ? conversation.userId2 : conversation.userId1;
        const targetUser = isUser1 ? conversation.user2 : conversation.user1;
        const unreadCount = isUser1 ? conversation.unreadCount1 : conversation.unreadCount2;
        const isPinned = isUser1 ? conversation.isPinned1 : conversation.isPinned2;
        return {
            id: conversation.id,
            userId: currentUserId,
            targetUserId: targetUser?.id ?? targetUserId,
            targetUser: {
                id: targetUser?.id ?? targetUserId,
                nickname: targetUser?.nickname ?? '',
                avatar: targetUser?.avatar ?? '',
            },
            lastMessage: conversation.lastMessage
                ? {
                    id: conversation.lastMessage.id,
                    content: conversation.lastMessage.content,
                    type: conversation.lastMessage.type,
                    createdAt: conversation.lastMessage.createdAt,
                }
                : null,
            unreadCount,
            isPinned,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = ConversationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map