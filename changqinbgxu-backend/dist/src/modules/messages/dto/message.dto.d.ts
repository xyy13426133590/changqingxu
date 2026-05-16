export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    VOICE = "voice",
    EMOJI = "emoji",
    SYSTEM = "system"
}
export declare class SendMessageDto {
    conversationId: string;
    receiverId: string;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    mediaDuration?: number;
}
export declare class MarkReadDto {
    conversationId: string;
}
export declare class MessageResponseDto {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    mediaDuration?: number;
    isRead: boolean;
    createdAt: Date;
    sender?: {
        id: string;
        nickname: string;
        avatar: string;
    };
}
