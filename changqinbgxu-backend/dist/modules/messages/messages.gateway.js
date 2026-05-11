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
var MessagesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const messages_service_1 = require("./messages.service");
const message_dto_1 = require("./dto/message.dto");
let MessagesGateway = MessagesGateway_1 = class MessagesGateway {
    constructor(messagesService, jwtService, configService) {
        this.messagesService = messagesService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(MessagesGateway_1.name);
        this.userSockets = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.query.token;
            if (!token) {
                this.logger.warn(`客户端 ${client.id} 未提供令牌，断开连接`);
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('jwt.secret'),
            });
            client.userId = payload.sub;
            this.userSockets.set(payload.sub, client.id);
            this.logger.log(`用户 ${payload.sub} 已连接，Socket ID: ${client.id}`);
            client.emit('connected', { userId: payload.sub, message: '连接成功' });
        }
        catch (error) {
            this.logger.error(`客户端 ${client.id} 令牌验证失败`, error.message);
            client.emit('error', { message: '身份验证失败' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.userSockets.delete(client.userId);
            this.logger.log(`用户 ${client.userId} 已断开连接`);
        }
    }
    async handleSendMessage(client, data) {
        try {
            if (!client.userId) {
                client.emit('error', { message: '未授权' });
                return;
            }
            const message = await this.messagesService.sendMessage(client.userId, data);
            client.emit('message_sent', { success: true, message });
            const receiverSocketId = this.userSockets.get(data.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('new_message', message);
            }
            this.logger.log(`WebSocket: 用户 ${client.userId} 发送消息给 ${data.receiverId}`);
        }
        catch (error) {
            this.logger.error('发送消息失败', error.message);
            client.emit('error', { message: '发送消息失败', details: error.message });
        }
    }
    async handleMarkRead(client, data) {
        try {
            if (!client.userId) {
                client.emit('error', { message: '未授权' });
                return;
            }
            const result = await this.messagesService.markMessagesRead(client.userId, data.conversationId);
            client.emit('marked_read', { success: true, ...result });
        }
        catch (error) {
            this.logger.error('标记已读失败', error.message);
            client.emit('error', { message: '标记已读失败', details: error.message });
        }
    }
    handleJoinConversation(client, data) {
        client.join(data.conversationId);
        this.logger.log(`用户 ${client.userId} 加入会话 ${data.conversationId}`);
        client.emit('joined_conversation', { conversationId: data.conversationId });
    }
    handleLeaveConversation(client, data) {
        client.leave(data.conversationId);
        this.logger.log(`用户 ${client.userId} 离开会话 ${data.conversationId}`);
        client.emit('left_conversation', { conversationId: data.conversationId });
    }
    handlePing(client) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handlePing", null);
exports.MessagesGateway = MessagesGateway = MessagesGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        jwt_1.JwtService,
        config_1.ConfigService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map