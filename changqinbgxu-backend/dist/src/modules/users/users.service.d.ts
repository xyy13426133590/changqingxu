import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Match } from '../../database/entities/match.entity';
import { UpdateProfileDto, UpdateFiltersDto, UserResponseDto, UserCardDto, ReportUserDto } from './dto/user.dto';
export declare class UsersService {
    private readonly userRepository;
    private readonly matchRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, matchRepository: Repository<Match>);
    getUserById(userId: string): Promise<UserResponseDto>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto>;
    updateFilters(userId: string, updateFiltersDto: UpdateFiltersDto): Promise<{
        filterSettings: Record<string, any>;
    }>;
    getVipStatus(userId: string): Promise<{
        isVip: boolean;
        vipExpiry: Date;
        daysRemaining: number;
    }>;
    getUserCard(userId: string): Promise<UserCardDto>;
    getRecommendations(userId: string, page?: number, limit?: number): Promise<{
        users: UserCardDto[];
        total: number;
        recycled?: boolean;
    }>;
    getDailyRecommendations(userId: string): Promise<{
        users: UserCardDto[];
        recycled?: boolean;
    }>;
    private queryRecommendationUsers;
    getUserDetail(userId: string, currentUserId: string): Promise<UserCardDto>;
    reportUser(userId: string, targetUserId: string, reportDto: ReportUserDto): Promise<{
        message: string;
    }>;
    private getMatchedUserIds;
    private calculateAge;
    private calculateZodiacInfo;
    private getZodiacSign;
    private formatUserResponse;
    private formatUserCard;
}
