import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../database/entities/message.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { SendMessageDto, MessageResponseDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  /**
   * 发送消息
   */
  async sendMessage(
    senderId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const { conversationId, receiverId, type, content, mediaUrl, mediaDuration } = sendMessageDto;

    // 检查会话是否存在
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.userId1 !== senderId && conversation.userId2 !== senderId) {
      throw new ForbiddenException('无权在此会话发送消息');
    }

    // 创建消息
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

    // 更新会话最后消息和未读数
    const isUser1 = conversation.userId1 === senderId;
    if (isUser1) {
      conversation.unreadCount2 += 1;
    } else {
      conversation.unreadCount1 += 1;
    }
    conversation.lastMessageId = savedMessage.id;
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    this.logger.log(`用户 ${senderId} 发送消息给 ${receiverId}: ${content.substring(0, 20)}`);

    return this.formatMessageResponse(savedMessage);
  }

  /**
   * 标记消息已读
   */
  async markMessagesRead(
    userId: string,
    conversationId: string,
  ): Promise<{ message: string; clearedCount: number }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      throw new ForbiddenException('无权操作此会话');
    }

    // 更新未读数
    const isUser1 = conversation.userId1 === userId;
    const clearedCount = isUser1 ? conversation.unreadCount1 : conversation.unreadCount2;

    if (isUser1) {
      conversation.unreadCount1 = 0;
    } else {
      conversation.unreadCount2 = 0;
    }

    await this.conversationRepository.save(conversation);

    // 标记消息为已读
    await this.messageRepository.update(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true },
    );

    this.logger.log(`用户 ${userId} 标记会话 ${conversationId} 的消息已读，清除 ${clearedCount} 条`);

    return { message: '标记成功', clearedCount };
  }

  /**
   * 格式化消息响应
   */
  private formatMessageResponse(message: Message): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      type: message.type as any,
      content: message.content,
      mediaUrl: message.mediaUrl,
      mediaDuration: message.mediaDuration,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
  }
}
