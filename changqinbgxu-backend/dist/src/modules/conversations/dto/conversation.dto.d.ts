export declare class CreateConversationDto {
    targetUserId: string;
}
export declare class ConversationResponseDto {
    id: string;
    userId: string;
    targetUserId: string;
    targetUser: {
        id: string;
        nickname: string;
        avatar: string;
    };
    lastMessage: {
        id: string;
        content: string;
        type: string;
        createdAt: Date;
    } | null;
    unreadCount: number;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}
