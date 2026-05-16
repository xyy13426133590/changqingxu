import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateFiltersDto, UserResponseDto, UserCardDto, ReportUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<UserResponseDto>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto>;
    updateFilters(userId: string, updateFiltersDto: UpdateFiltersDto): Promise<{
        filterSettings: Record<string, any>;
    }>;
    getVipStatus(userId: string): Promise<{
        isVip: boolean;
        vipExpiry: Date;
        daysRemaining: number;
    }>;
    getMyCard(userId: string): Promise<UserCardDto>;
    getRecommendations(userId: string, page?: number, limit?: number): Promise<{
        users: UserCardDto[];
        total: number;
    }>;
    getDailyRecommendations(userId: string): Promise<{
        users: UserCardDto[];
    }>;
    getUserById(userId: string, currentUserId: string): Promise<UserCardDto>;
    reportUser(targetUserId: string, userId: string, reportDto: ReportUserDto): Promise<{
        message: string;
    }>;
}
