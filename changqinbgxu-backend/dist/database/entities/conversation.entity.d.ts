import { User } from './user.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: string;
    userId1: string;
    userId2: string;
    lastMessageId: string;
    lastMessageAt: Date;
    unreadCount1: number;
    unreadCount2: number;
    isPinned1: boolean;
    isPinned2: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    user1: User;
    user2: User;
    messages: Message[];
    lastMessage: Message;
}
