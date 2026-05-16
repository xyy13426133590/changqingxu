import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { User } from '../../database/entities/user.entity';
import { ConversationResponseDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取用户的会话列表
   */
  async getConversations(userId: string): Promise<ConversationResponseDto[]> {
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

  /**
   * 创建会话
   */
  async createConversation(userId: string, targetUserId: string): Promise<ConversationResponseDto> {
    // 检查目标用户是否存在
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId, status: 'active' },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否已存在会话
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

    // 创建新会话
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
      throw new NotFoundException('会话创建失败');
    }

    return this.formatConversationResponse(withRelations, userId);
  }

  /**
   * 删除会话
   */
  async deleteConversation(userId: string, conversationId: string): Promise<{ message: string }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      throw new ForbiddenException('无权操作此会话');
    }

    await this.conversationRepository.remove(conversation);

    this.logger.log(`用户 ${userId} 删除了会话 ${conversationId}`);

    return { message: '会话已删除' };
  }

  /**
   * 置顶/取消置顶会话
   */
  async togglePin(userId: string, conversationId: string): Promise<{ isPinned: boolean }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      throw new ForbiddenException('无权操作此会话');
    }

    // 判断当前用户是会话的哪一方
    const isUser1 = conversation.userId1 === userId;

    if (isUser1) {
      conversation.isPinned1 = !conversation.isPinned1;
    } else {
      conversation.isPinned2 = !conversation.isPinned2;
    }

    await this.conversationRepository.save(conversation);

    this.logger.log(`用户 ${userId} ${isUser1 ? conversation.isPinned1 : conversation.isPinned2 ? '置顶' : '取消置顶'}了会话 ${conversationId}`);

    return { isPinned: isUser1 ? conversation.isPinned1 : conversation.isPinned2 };
  }

  /**
   * 获取消息历史
   */
  async getMessages(
    userId: string,
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ messages: Message[]; total: number }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      throw new ForbiddenException('无权查看此会话');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages: messages.reverse(), total };
  }

  /**
   * 格式化会话响应
   */
  private formatConversationResponse(
    conversation: Conversation,
    currentUserId: string,
  ): ConversationResponseDto {
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
}
