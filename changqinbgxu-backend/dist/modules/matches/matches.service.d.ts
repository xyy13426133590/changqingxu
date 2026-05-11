import { Repository } from 'typeorm';
import { Match } from '../../database/entities/match.entity';
import { User } from '../../database/entities/user.entity';
import { MatchResponseDto } from './dto/match.dto';
export declare class MatchesService {
    private readonly matchRepository;
    private readonly userRepository;
    private readonly logger;
    constructor(matchRepository: Repository<Match>, userRepository: Repository<User>);
    likeUser(userId: string, targetUserId: string): Promise<MatchResponseDto>;
    passUser(userId: string, targetUserId: string): Promise<MatchResponseDto>;
    superLikeUser(userId: string, targetUserId: string): Promise<MatchResponseDto>;
    getMutualMatches(userId: string): Promise<MatchResponseDto[]>;
    private formatMatchResponse;
}
