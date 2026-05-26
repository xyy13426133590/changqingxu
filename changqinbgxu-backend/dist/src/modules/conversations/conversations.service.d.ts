import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { User } from '../../database/entities/user.entity';
import { ConversationResponseDto } from './dto/conversation.dto';
import { GreetingQuotaService } from '../growth/greeting-quota.service';
export declare class ConversationsService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly userRepository;
    private readonly greetingQuotaService;
    private readonly logger;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>, userRepository: Repository<User>, greetingQuotaService: GreetingQuotaService);
    getConversations(userId: string): Promise<ConversationResponseDto[]>;
    createConversation(userId: string, targetUserId: string): Promise<ConversationResponseDto>;
    deleteConversation(userId: string, conversationId: string): Promise<{
        message: string;
    }>;
    togglePin(userId: string, conversationId: string): Promise<{
        isPinned: boolean;
    }>;
    getMessages(userId: string, conversationId: string, page?: number, limit?: number): Promise<{
        messages: Message[];
        total: number;
    }>;
    private formatConversationResponse;
}
