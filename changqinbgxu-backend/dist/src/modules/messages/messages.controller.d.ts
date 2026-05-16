import { MessagesService } from './messages.service';
import { SendMessageDto, MarkReadDto } from './dto/message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(userId: string, sendMessageDto: SendMessageDto): Promise<import("./dto/message.dto").MessageResponseDto>;
    markRead(userId: string, markReadDto: MarkReadDto): Promise<{
        message: string;
        clearedCount: number;
    }>;
}
