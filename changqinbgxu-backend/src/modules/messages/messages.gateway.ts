import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  server: Server;

  // 存储用户ID到Socket ID的映射
  private userSockets: Map<string, string> = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 处理连接
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (!token) {
        this.logger.warn(`客户端 ${client.id} 未提供令牌，断开连接`);
        client.disconnect();
        return;
      }

      // 验证令牌
      const payload = await this.jwtService.verifyAsync(token as string, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      client.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);

      this.logger.log(`用户 ${payload.sub} 已连接，Socket ID: ${client.id}`);

      // 发送连接成功事件
      client.emit('connected', { userId: payload.sub, message: '连接成功' });
    } catch (error) {
      this.logger.error(`客户端 ${client.id} 令牌验证失败`, error.message);
      client.emit('error', { message: '身份验证失败' });
      client.disconnect();
    }
  }

  /**
   * 处理断开连接
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      this.logger.log(`用户 ${client.userId} 已断开连接`);
    }
  }

  /**
   * 发送消息
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: '未授权' });
        return;
      }

      const message = await this.messagesService.sendMessage(client.userId, data);

      // 发送给发送者确认
      client.emit('message_sent', { success: true, message });

      // 发送给接收者（如果在线）
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('new_message', message);
      }

      this.logger.log(`WebSocket: 用户 ${client.userId} 发送消息给 ${data.receiverId}`);
    } catch (error) {
      this.logger.error('发送消息失败', error.message);
      client.emit('error', { message: '发送消息失败', details: error.message });
    }
  }

  /**
   * 标记已读
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: '未授权' });
        return;
      }

      const result = await this.messagesService.markMessagesRead(
        client.userId,
        data.conversationId,
      );

      client.emit('marked_read', { success: true, ...result });
    } catch (error) {
      this.logger.error('标记已读失败', error.message);
      client.emit('error', { message: '标记已读失败', details: error.message });
    }
  }

  /**
   * 加入会话房间
   */
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(data.conversationId);
    this.logger.log(`用户 ${client.userId} 加入会话 ${data.conversationId}`);
    client.emit('joined_conversation', { conversationId: data.conversationId });
  }

  /**
   * 离开会话房间
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(data.conversationId);
    this.logger.log(`用户 ${client.userId} 离开会话 ${data.conversationId}`);
    client.emit('left_conversation', { conversationId: data.conversationId });
  }

  /**
   * 心跳检测
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }
}
