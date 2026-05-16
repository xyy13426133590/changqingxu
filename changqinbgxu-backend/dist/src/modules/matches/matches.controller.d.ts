import { MatchesService } from './matches.service';
import { LikeUserDto, PassUserDto, SuperLikeUserDto } from './dto/match.dto';
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    likeUser(userId: string, likeUserDto: LikeUserDto): Promise<import("./dto/match.dto").MatchResponseDto>;
    passUser(userId: string, passUserDto: PassUserDto): Promise<import("./dto/match.dto").MatchResponseDto>;
    superLikeUser(userId: string, superLikeUserDto: SuperLikeUserDto): Promise<import("./dto/match.dto").MatchResponseDto>;
    getMutualMatches(userId: string): Promise<import("./dto/match.dto").MatchResponseDto[]>;
    resetSwipeHistory(userId: string): Promise<{
        deleted: number;
    }>;
}
