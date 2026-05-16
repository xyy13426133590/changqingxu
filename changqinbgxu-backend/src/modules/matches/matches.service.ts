import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Match, MatchAction } from '../../database/entities/match.entity';
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
    return this.setMatchAction(userId, targetUserId, 'like');
  }

  /**
   * 不喜欢用户
   */
  async passUser(userId: string, targetUserId: string): Promise<MatchResponseDto> {
    return this.setMatchAction(userId, targetUserId, 'dislike');
  }

  /**
   * 超级喜欢用户
   */
  async superLikeUser(userId: string, targetUserId: string): Promise<MatchResponseDto> {
    return this.setMatchAction(userId, targetUserId, 'super_like');
  }

  /** 清空当前用户的滑卡记录（演示/联调用） */
  async resetSwipeHistory(userId: string): Promise<{ deleted: number }> {
    const result = await this.matchRepository.delete({ userId });
    return { deleted: result.affected ?? 0 };
  }

  /**
   * 喜欢/不喜欢/超级喜欢：已滑过则更新操作，便于演示环境反复测试
   */
  private async setMatchAction(
    userId: string,
    targetUserId: string,
    action: MatchAction,
  ): Promise<MatchResponseDto> {
    if (userId === targetUserId) {
      throw new ConflictException('不能对自己进行操作');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId, status: 'active' },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    const existingMatch = await this.matchRepository.findOne({
      where: { userId, targetUserId },
    });

    const reverseMatch = await this.matchRepository.findOne({
      where: {
        userId: targetUserId,
        targetUserId: userId,
        action: In(['like', 'super_like']),
      },
    });

    if (action === 'super_like') {
      if (existingMatch) {
        existingMatch.action = 'super_like';
        existingMatch.isMutual = true;
        const saved = await this.matchRepository.save(existingMatch);
        this.logger.log(`用户 ${userId} 更新为超级喜欢 ${targetUserId}`);
        return this.formatMatchResponse(saved, targetUser);
      }
      const match = this.matchRepository.create({
        userId,
        targetUserId,
        action: 'super_like',
        isMutual: true,
      });
      const saved = await this.matchRepository.save(match);
      this.logger.log(`用户 ${userId} 超级喜欢了用户 ${targetUserId}`);
      return this.formatMatchResponse(saved, targetUser);
    }

    if (action === 'dislike') {
      if (existingMatch) {
        if (existingMatch.isMutual && reverseMatch) {
          reverseMatch.isMutual = false;
          await this.matchRepository.save(reverseMatch);
        }
        existingMatch.action = 'dislike';
        existingMatch.isMutual = false;
        const saved = await this.matchRepository.save(existingMatch);
        this.logger.log(`用户 ${userId} 更新为不喜欢 ${targetUserId}`);
        return this.formatMatchResponse(saved, targetUser);
      }
      const match = this.matchRepository.create({
        userId,
        targetUserId,
        action: 'dislike',
        isMutual: false,
      });
      const saved = await this.matchRepository.save(match);
      this.logger.log(`用户 ${userId} 不喜欢用户 ${targetUserId}`);
      return this.formatMatchResponse(saved, targetUser);
    }

    // like
    const isMutual = !!reverseMatch;
    if (existingMatch) {
      existingMatch.action = 'like';
      existingMatch.isMutual = isMutual;
      const saved = await this.matchRepository.save(existingMatch);
      if (reverseMatch && !reverseMatch.isMutual) {
        reverseMatch.isMutual = true;
        await this.matchRepository.save(reverseMatch);
        this.logger.log(`用户 ${userId} 和 ${targetUserId} 互相喜欢`);
      }
      return this.formatMatchResponse(saved, targetUser);
    }

    const match = this.matchRepository.create({
      userId,
      targetUserId,
      action: 'like',
      isMutual,
    });
    const saved = await this.matchRepository.save(match);
    if (reverseMatch) {
      reverseMatch.isMutual = true;
      await this.matchRepository.save(reverseMatch);
      this.logger.log(`用户 ${userId} 和 ${targetUserId} 互相喜欢`);
    } else {
      this.logger.log(`用户 ${userId} 喜欢了用户 ${targetUserId}`);
    }
    return this.formatMatchResponse(saved, targetUser);
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
