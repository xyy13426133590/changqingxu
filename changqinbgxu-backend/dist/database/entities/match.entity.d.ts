import { User } from './user.entity';
export type MatchAction = 'like' | 'dislike' | 'super_like';
export declare class Match {
    id: string;
    userId: string;
    targetUserId: string;
    action: MatchAction;
    isMutual: boolean;
    createdAt: Date;
    user: User;
    targetUser: User;
}
