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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../../database/entities/message.entity");
const conversation_entity_1 = require("../../database/entities/conversation.entity");
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(messageRepository, conversationRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async sendMessage(senderId, sendMessageDto) {
        const { conversationId, receiverId, type, content, mediaUrl, mediaDuration } = sendMessageDto;
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('会话不存在');
        }
        if (conversation.userId1 !== senderId && conversation.userId2 !== senderId) {
            throw new common_1.ForbiddenException('无权在此会话发送消息');
        }
        const message = this.messageRepository.create({
            conversationId,
            senderId,
            receiverId,
            type,
            content,
            mediaUrl,
            mediaDuration,
            isRead: false,
        });
        const savedMessage = await this.messageRepository.save(message);
        const isUser1 = conversation.userId1 === senderId;
        if (isUser1) {
            conversation.unreadCount2 += 1;
        }
        else {
            conversation.unreadCount1 += 1;
        }
        conversation.lastMessageId = savedMessage.id;
        conversation.lastMessageAt = new Date();
        await this.conversationRepository.save(conversation);
        this.logger.log(`用户 ${senderId} 发送消息给 ${receiverId}: ${content.substring(0, 20)}`);
        return this.formatMessageResponse(savedMessage);
    }
    async markMessagesRead(userId, conversationId) {
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
        const clearedCount = isUser1 ? conversation.unreadCount1 : conversation.unreadCount2;
        if (isUser1) {
            conversation.unreadCount1 = 0;
        }
        else {
            conversation.unreadCount2 = 0;
        }
        await this.conversationRepository.save(conversation);
        await this.messageRepository.update({ conversationId, receiverId: userId, isRead: false }, { isRead: true });
        this.logger.log(`用户 ${userId} 标记会话 ${conversationId} 的消息已读，清除 ${clearedCount} 条`);
        return { message: '标记成功', clearedCount };
    }
    formatMessageResponse(message) {
        return {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            type: message.type,
            content: message.content,
            mediaUrl: message.mediaUrl,
            mediaDuration: message.mediaDuration,
            isRead: message.isRead,
            createdAt: message.createdAt,
        };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map