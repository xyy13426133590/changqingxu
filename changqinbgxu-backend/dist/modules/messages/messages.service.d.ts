import { Repository } from 'typeorm';
import { Message } from '../../database/entities/message.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { SendMessageDto, MessageResponseDto } from './dto/message.dto';
export declare class MessagesService {
    private readonly messageRepository;
    private readonly conversationRepository;
    private readonly logger;
    constructor(messageRepository: Repository<Message>, conversationRepository: Repository<Conversation>);
    sendMessage(senderId: string, sendMessageDto: SendMessageDto): Promise<MessageResponseDto>;
    markMessagesRead(userId: string, conversationId: string): Promise<{
        message: string;
        clearedCount: number;
    }>;
    private formatMessageResponse;
}
