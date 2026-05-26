import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserInvite } from '../../database/entities/user-invite.entity';
import { type ChannelFirstTouchPayload } from './growth.constants';
import { GreetingQuotaService } from './greeting-quota.service';
import { WechatLoginDto } from '../auth/dto/auth.dto';
export type GrowthSummary = {
    vipUnlimited: boolean;
    greetingsRemaining: number;
    greetingsDailyQuota: number;
    greetingsDailyUsed: number;
    greetingsBonusRemaining: number;
    newcomerGift: {
        claimed: boolean;
        eligibleNow: boolean;
        bonusAmount: number;
        regionHint: string;
    };
    inviteCount: number;
};
export declare class GrowthService {
    private readonly userRepository;
    private readonly inviteRepository;
    private readonly greetingQuota;
    private readonly logger;
    constructor(userRepository: Repository<User>, inviteRepository: Repository<UserInvite>, greetingQuota: GreetingQuotaService);
    sanitizeChannel(att?: ChannelFirstTouchPayload | null): ChannelFirstTouchPayload | null;
    attachNewRegisterMetadata(userId: string, payload: Pick<WechatLoginDto, 'inviteFromUserId' | 'channelAttribution'>): Promise<void>;
    getSummary(userId: string): Promise<GrowthSummary>;
    claimNewcomerGift(userId: string): Promise<GrowthSummary>;
}
