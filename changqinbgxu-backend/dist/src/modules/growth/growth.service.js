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
var GrowthService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const user_invite_entity_1 = require("../../database/entities/user-invite.entity");
const growth_constants_1 = require("./growth.constants");
const greeting_quota_service_1 = require("./greeting-quota.service");
let GrowthService = GrowthService_1 = class GrowthService {
    constructor(userRepository, inviteRepository, greetingQuota) {
        this.userRepository = userRepository;
        this.inviteRepository = inviteRepository;
        this.greetingQuota = greetingQuota;
        this.logger = new common_1.Logger(GrowthService_1.name);
    }
    sanitizeChannel(att) {
        if (!att)
            return null;
        const clip = (v, max = 512) => typeof v === 'string' ? v.trim().slice(0, max) : undefined;
        const o = {};
        const scene = clip(att.scene);
        const query = clip(att.query);
        const utmSource = clip(att.utmSource, 128);
        const utmMedium = clip(att.utmMedium, 128);
        const utmCampaign = clip(att.utmCampaign, 128);
        if (scene)
            o.scene = scene;
        if (query)
            o.query = query;
        if (utmSource)
            o.utmSource = utmSource;
        if (utmMedium)
            o.utmMedium = utmMedium;
        if (utmCampaign)
            o.utmCampaign = utmCampaign;
        return Object.keys(o).length ? o : null;
    }
    async attachNewRegisterMetadata(userId, payload) {
        const channel = this.sanitizeChannel(payload.channelAttribution ?? null);
        let user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            return;
        const updates = {};
        if (channel && !user.channelFirstTouchJson) {
            updates.channelFirstTouchJson = channel;
        }
        if (payload.inviteFromUserId) {
            const inviterId = payload.inviteFromUserId.trim();
            if (inviterId && inviterId !== userId && !user.inviterUserId) {
                const inviter = await this.userRepository.findOne({
                    where: { id: inviterId, status: 'active' },
                });
                if (inviter) {
                    const dup = await this.inviteRepository.findOne({
                        where: { inviteeId: userId },
                    });
                    if (!dup) {
                        await this.inviteRepository.save(this.inviteRepository.create({
                            inviterId: inviter.id,
                            inviteeId: userId,
                        }));
                        updates.inviterUserId = inviter.id;
                        this.logger.log(`邀请绑定: ${inviter.id} → ${userId}`);
                    }
                }
            }
        }
        if (Object.keys(updates).length === 0)
            return;
        await this.userRepository.update(userId, updates);
    }
    async getSummary(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, status: 'active' },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const vipUnlimited = this.greetingQuota.isVipEffective(user);
        const remaining = await this.greetingQuota.getRemainingForUser(user);
        const dailyUsed = vipUnlimited ? 0 : user.greetingDailyUsed;
        const eligible = (0, greeting_quota_service_1.profileLooksLuzhou)(user);
        const inviteCount = (await this.inviteRepository
            .createQueryBuilder('i')
            .where('i.inviter_id = :userId', { userId })
            .getCount()) ?? 0;
        return {
            vipUnlimited,
            greetingsRemaining: remaining,
            greetingsDailyQuota: vipUnlimited ? 0 : growth_constants_1.GREETING_DAILY_BASE_NON_VIP,
            greetingsDailyUsed: dailyUsed,
            greetingsBonusRemaining: user.greetingBonusRemaining,
            newcomerGift: {
                claimed: !!user.newcomerGiftClaimedAt,
                eligibleNow: eligible && !user.newcomerGiftClaimedAt,
                bonusAmount: growth_constants_1.NEWCOMER_GIFT_GREETING_BONUS,
                regionHint: `需在资料中标注同城（所在地或籍贯含「泸州」）。`,
            },
            inviteCount,
        };
    }
    async claimNewcomerGift(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, status: 'active' },
        });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        if (user.newcomerGiftClaimedAt) {
            throw new common_1.ConflictException('你已领取过新人礼遇');
        }
        if (!(0, greeting_quota_service_1.profileLooksLuzhou)(user)) {
            throw new common_1.BadRequestException(`请先完善资料，将所在地或家乡填写为包含「泸州」的地区后再领取`);
        }
        user.greetingBonusRemaining += growth_constants_1.NEWCOMER_GIFT_GREETING_BONUS;
        user.newcomerGiftClaimedAt = new Date();
        await this.userRepository.save(user);
        return this.getSummary(userId);
    }
};
exports.GrowthService = GrowthService;
exports.GrowthService = GrowthService = GrowthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_invite_entity_1.UserInvite)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof greeting_quota_service_1.GreetingQuotaService !== "undefined" && greeting_quota_service_1.GreetingQuotaService) === "function" ? _a : Object])
], GrowthService);
//# sourceMappingURL=growth.service.js.map