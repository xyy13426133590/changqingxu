import { Conversation } from './conversation.entity';
import { User } from './user.entity';
export type MessageType = 'text' | 'image' | 'voice' | 'emoji' | 'system';
export declare class Message {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    type: MessageType;
    content: string;
    mediaUrl: string;
    mediaDuration: number;
    isRead: boolean;
    createdAt: Date;
    conversation: Conversation;
    sender: User;
    receiver: User;
}
