export declare class LikeUserDto {
    targetUserId: string;
}
export declare class PassUserDto {
    targetUserId: string;
}
export declare class SuperLikeUserDto {
    targetUserId: string;
}
export declare class MatchResponseDto {
    id: string;
    userId: string;
    targetUserId: string;
    action: string;
    isMutual: boolean;
    createdAt: Date;
    targetUser?: {
        id: string;
        nickname: string;
        avatar: string;
    };
}
