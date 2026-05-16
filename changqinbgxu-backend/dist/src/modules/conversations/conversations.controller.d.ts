import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/conversation.dto';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    getConversations(userId: string): Promise<import("./dto/conversation.dto").ConversationResponseDto[]>;
    createConversation(userId: string, createDto: CreateConversationDto): Promise<import("./dto/conversation.dto").ConversationResponseDto>;
    deleteConversation(conversationId: string, userId: string): Promise<{
        message: string;
    }>;
    togglePin(conversationId: string, userId: string): Promise<{
        isPinned: boolean;
    }>;
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
        messages: import("../../database/entities").Message[];
        total: number;
    }>;
}
