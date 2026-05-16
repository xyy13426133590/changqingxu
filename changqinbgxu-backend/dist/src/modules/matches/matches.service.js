"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MatchesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("../../database/entities/match.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let MatchesService = MatchesService_1 = class MatchesService {
    constructor(matchRepository, userRepository) {
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(MatchesService_1.name);
    }
    async likeUser(userId, targetUserId) {
        return this.setMatchAction(userId, targetUserId, 'like');
    }
    async passUser(userId, targetUserId) {
        return this.setMatchAction(userId, targetUserId, 'dislike');
    }
    async superLikeUser(userId, targetUserId) {
        return this.setMatchAction(userId, targetUserId, 'super_like');
    }
    async resetSwipeHistory(userId) {
        const result = await this.matchRepository.delete({ userId });
        return { deleted: result.affected ?? 0 };
    }
    async setMatchAction(userId, targetUserId, action) {
        if (userId === targetUserId) {
            throw new common_1.ConflictException('不能对自己进行操作');
        }
        const targetUser = await this.userRepository.findOne({
            where: { id: targetUserId, status: 'active' },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('目标用户不存在');
        }
        const existingMatch = await this.matchRepository.findOne({
            where: { userId, targetUserId },
        });
        const reverseMatch = await this.matchRepository.findOne({
            where: {
                userId: targetUserId,
                targetUserId: userId,
                action: (0, typeorm_2.In)(['like', 'super_like']),
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
        }
        else {
            this.logger.log(`用户 ${userId} 喜欢了用户 ${targetUserId}`);
        }
        return this.formatMatchResponse(saved, targetUser);
    }
    async getMutualMatches(userId) {
        const matches = await this.matchRepository.find({
            where: { userId, isMutual: true },
            relations: ['targetUser'],
            order: { createdAt: 'DESC' },
        });
        return matches.map((match) => this.formatMatchResponse(match, match.targetUser));
    }
    formatMatchResponse(match, targetUser) {
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
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = MatchesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MatchesService);
//# sourceMappingURL=matches.service.js.map