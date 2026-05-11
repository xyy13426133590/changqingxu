import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../database/entities/match.entity';
import { User } from '../../database/entities/user.entity';
import { MatchResponseDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 喜欢用户
   */
  async likeUser(userId: string, targetUserId: string): Promise<MatchResponseDto> {
    // 检查目标用户是否存在
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId, status: 'active' },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否已经匹配过
    const existingMatch = await this.matchRepository.findOne({
      where: { userId, targetUserId },
    });

    if (existingMatch) {
      throw new ConflictException('已经对该用户进行过操作');
    }

    // 检查是否是互相喜欢
    const reverseMatch = await this.matchRepository.findOne({
      where: { userId: targetUserId, targetUserId: userId, action: 'like' },
    });

    const isMutual = !!reverseMatch;

    // 创建匹配记录
    const match = this.matchRepository.create({
      userId,
      targetUserId,
      action: 'like',
      isMutual,
    });

    const savedMatch = await this.matchRepository.save(match);

    // 如果互相喜欢，更新对方的匹配记录
    if (reverseMatch) {
      reverseMatch.isMutual = true;
      await this.matchRepository.save(reverseMatch);

      this.logger.log(`用户 ${userId} 和 ${targetUserId} 互相喜欢，匹配成功！`);
    } else {
      this.logger.log(`用户 ${userId} 喜欢了用户 ${targetUserId}`);
    }

    return this.formatMatchResponse(savedMatch, targetUser);
  }

  /**
   * 不喜欢用户
   */
  async passUser(userId: string, targetUserId: string): Promise<MatchResponseDto> {
    // 检查目标用户是否存在
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId, status: 'active' },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否已经匹配过
    const existingMatch = await this.matchRepository.findOne({
      where: { userId, targetUserId },
    });

    if (existingMatch) {
      throw new ConflictException('已经对该用户进行过操作');
    }

    // 创建不喜欢记录
    const match = this.matchRepository.create({
      userId,
      targetUserId,
      action: 'dislike',
      isMutual: false,
    });

    const savedMatch = await this.matchRepository.save(match);

    this.logger.log(`用户 ${userId} 不喜欢用户 ${targetUserId}`);

    return this.formatMatchResponse(savedMatch, targetUser);
  }

  /**
   * 超级喜欢用户
   */
  async superLikeUser(userId: string, targetUserId: string): Promise<MatchResponseDto> {
    // 检查目标用户是否存在
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId, status: 'active' },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否已经匹配过
    const existingMatch = await this.matchRepository.findOne({
      where: { userId, targetUserId },
    });

    if (existingMatch) {
      throw new ConflictException('已经对该用户进行过操作');
    }

    // 超级喜欢直接视为互相匹配
    const match = this.matchRepository.create({
      userId,
      targetUserId,
      action: 'super_like',
      isMutual: true,
    });

    const savedMatch = await this.matchRepository.save(match);

    this.logger.log(`用户 ${userId} 超级喜欢了用户 ${targetUserId}，直接匹配成功！`);

    return this.formatMatchResponse(savedMatch, targetUser);
  }

  /**
   * 获取互相喜欢的人
   */
  async getMutualMatches(userId: string): Promise<MatchResponseDto[]> {
    const matches = await this.matchRepository.find({
      where: { userId, isMutual: true },
      relations: ['targetUser'],
      order: { createdAt: 'DESC' },
    });

    return matches.map((match) => this.formatMatchResponse(match, match.targetUser));
  }

  /**
   * 格式化匹配响应
   */
  private formatMatchResponse(match: Match, targetUser: User): MatchResponseDto {
    return {
      id: match.id,
      userId: match.userId,
      targetUserId: match.targetUserId,
      action: match.action,
      isMutual: match.isMutual,
      createdAt: match.createdAt,
      targetUser: {
        id: targetUser.id,
        nickname: targetUser.nickname,
        avatar: targetUser.avatar,
      },
    };
  }
}
