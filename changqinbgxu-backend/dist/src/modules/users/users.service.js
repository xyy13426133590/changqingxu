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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const match_entity_1 = require("../../database/entities/match.entity");
const DAILY_RECOMMENDATION_COUNT = 10;
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepository, matchRepository) {
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async getUserById(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, status: 'active' },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return this.formatUserResponse(user);
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const userUpdates = { ...updateProfileDto };
        if (updateProfileDto.birthday) {
            const birthDate = new Date(updateProfileDto.birthday);
            userUpdates.age = this.calculateAge(birthDate);
            Object.assign(userUpdates, this.calculateZodiacInfo(birthDate));
        }
        Object.assign(user, userUpdates);
        const updatedUser = await this.userRepository.save(user);
        this.logger.log(`用户资料更新成功: ${userId}`);
        return this.formatUserResponse(updatedUser);
    }
    async updateFilters(userId, updateFiltersDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        user.filterSettings = {
            ...user.filterSettings,
            ...updateFiltersDto,
        };
        await this.userRepository.save(user);
        return { filterSettings: user.filterSettings };
    }
    async getVipStatus(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['isVip', 'vipExpiry'],
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const now = new Date();
        const isVipActive = user.isVip && user.vipExpiry && user.vipExpiry > now;
        return {
            isVip: isVipActive,
            vipExpiry: user.vipExpiry,
            daysRemaining: isVipActive
                ? Math.ceil((user.vipExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0,
        };
    }
    async getUserCard(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, status: 'active' },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return this.formatUserCard(user, userId);
    }
    async getRecommendations(userId, page = 1, limit = 10) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const matchedUserIds = await this.getMatchedUserIds(userId);
        const skip = (page - 1) * limit;
        let recycled = false;
        let users = await this.queryRecommendationUsers(userId, matchedUserIds, true);
        if (users.length === 0) {
            users = await this.queryRecommendationUsers(userId, matchedUserIds, false);
        }
        if (users.length === 0 && matchedUserIds.length > 0) {
            users = await this.queryRecommendationUsers(userId, [], false);
            recycled = users.length > 0;
        }
        const total = users.length;
        const pageUsers = users.slice(skip, skip + limit);
        const userCards = pageUsers.map((u) => this.formatUserCard(u, userId));
        return { users: userCards, total, ...(recycled ? { recycled: true } : {}) };
    }
    async getDailyRecommendations(userId) {
        const matchedUserIds = await this.getMatchedUserIds(userId);
        let users = await this.queryRecommendationUsers(userId, matchedUserIds, false, DAILY_RECOMMENDATION_COUNT, true);
        let recycled = false;
        if (users.length === 0 && matchedUserIds.length > 0) {
            users = await this.queryRecommendationUsers(userId, [], false, DAILY_RECOMMENDATION_COUNT, true);
            recycled = users.length > 0;
        }
        const userCards = users.map((u) => this.formatUserCard(u, userId));
        return { users: userCards, ...(recycled ? { recycled: true } : {}) };
    }
    async queryRecommendationUsers(userId, matchedUserIds, applyFilters, take, randomOrder = false) {
        const qb = this.userRepository
            .createQueryBuilder('user')
            .where('user.id != :userId', { userId })
            .andWhere('user.status = :status', { status: 'active' });
        if (matchedUserIds.length > 0) {
            qb.andWhere('user.id NOT IN (:...matchedUserIds)', { matchedUserIds });
        }
        if (applyFilters) {
            const current = await this.userRepository.findOne({
                where: { id: userId },
                select: ['filterSettings'],
            });
            const fs = (current?.filterSettings || {});
            const { ageRange, education, incomeRange } = fs;
            const ageMin = ageRange?.min;
            const ageMax = ageRange?.max;
            if (typeof ageMin === 'number' &&
                typeof ageMax === 'number' &&
                !Number.isNaN(ageMin) &&
                !Number.isNaN(ageMax) &&
                ageMin <= ageMax) {
                qb.andWhere('user.age IS NOT NULL')
                    .andWhere('user.age >= :ageMin', { ageMin })
                    .andWhere('user.age <= :ageMax', { ageMax });
            }
            if (Array.isArray(education) && education.length > 0) {
                qb.andWhere('user.education IN (:...educations)', {
                    educations: education,
                });
            }
            if (incomeRange != null &&
                typeof incomeRange.min === 'string' &&
                incomeRange.min.length > 0) {
                qb.andWhere('user.income = :income', { income: incomeRange.min });
            }
        }
        if (randomOrder) {
            qb.orderBy('RAND()');
        }
        else {
            qb.orderBy('user.created_at', 'DESC');
        }
        if (take != null && take > 0) {
            qb.take(take);
        }
        return qb.getMany();
    }
    async getUserDetail(userId, currentUserId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, status: 'active' },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return this.formatUserCard(user, currentUserId);
    }
    async reportUser(userId, targetUserId, reportDto) {
        this.logger.log(`用户 ${userId} 举报了用户 ${targetUserId}: ${reportDto.reason}`);
        return { message: '举报成功，我们会尽快处理' };
    }
    async getMatchedUserIds(userId) {
        const matches = await this.matchRepository.find({
            where: { userId },
            select: ['targetUserId'],
        });
        return matches.map((match) => match.targetUserId);
    }
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    calculateZodiacInfo(birthDate) {
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const zodiacAnimals = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
        const zodiac = zodiacAnimals[year % 12];
        const zodiacSign = this.getZodiacSign(month, day);
        const seed = year * 10000 + month * 100 + day;
        const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
        const mbti = mbtiTypes[seed % mbtiTypes.length];
        const riyuanTypes = ['甲木', '乙木', '丙火', '丁火', '戊土', '己土', '庚金', '辛金', '壬水', '癸水'];
        const riyuan = riyuanTypes[seed % riyuanTypes.length];
        return { zodiac, zodiacSign, mbti, riyuan };
    }
    getZodiacSign(month, day) {
        const zodiacSigns = [
            { sign: '摩羯座', endDay: 19 },
            { sign: '水瓶座', endDay: 18 },
            { sign: '双鱼座', endDay: 20 },
            { sign: '白羊座', endDay: 19 },
            { sign: '金牛座', endDay: 20 },
            { sign: '双子座', endDay: 21 },
            { sign: '巨蟹座', endDay: 22 },
            { sign: '狮子座', endDay: 22 },
            { sign: '处女座', endDay: 22 },
            { sign: '天秤座', endDay: 22 },
            { sign: '天蝎座', endDay: 21 },
            { sign: '射手座', endDay: 21 },
            { sign: '摩羯座', endDay: 31 },
        ];
        const signIndex = day <= zodiacSigns[month - 1].endDay ? month - 1 : month;
        return zodiacSigns[signIndex].sign;
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            phone: user.phone,
            nickname: user.nickname,
            avatar: user.avatar,
            gender: user.gender,
            age: user.age,
            height: user.height,
            location: user.location,
            zodiac: user.zodiac,
            zodiacSign: user.zodiacSign,
            mbti: user.mbti,
            education: user.education,
            occupation: user.occupation,
            income: user.income,
            bio: user.bio,
            hobbies: user.hobbies || [],
            isRealName: user.isRealName,
            isFaceVerified: user.isFaceVerified,
            isVip: user.isVip,
            vipExpiry: user.vipExpiry,
            filterSettings: user.filterSettings || {},
            createdAt: user.createdAt,
        };
    }
    formatUserCard(user, currentUserId) {
        const matchReasons = ['生肖三合', '星座配对', '日柱相生', '五行互补'];
        const matchReason = matchReasons[Math.floor(Math.random() * matchReasons.length)];
        const matchTaglines = ['志趣相投', '天生一对', '缘分天定', '相辅相成'];
        const matchTagline = matchTaglines[Math.floor(Math.random() * matchTaglines.length)];
        const matchScore = Math.floor(Math.random() * 30) + 70;
        return {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            gender: user.gender,
            age: user.age,
            height: user.height,
            weight: user.weight ?? null,
            hometown: user.hometown || '',
            location: user.location,
            zodiac: user.zodiac,
            zodiacSign: user.zodiacSign,
            mbti: user.mbti,
            riyuan: user.riyuan,
            education: user.education,
            school: user.school || '',
            schoolTier: user.schoolTier ?? null,
            occupation: user.occupation,
            jobLevel: user.jobLevel || '',
            company: user.company || '',
            income: user.income,
            bio: user.bio,
            hobbies: user.hobbies || [],
            isRealName: user.isRealName,
            isFaceVerified: user.isFaceVerified,
            isVip: user.isVip,
            matchReason: matchReason,
            matchTagline: matchTagline,
            matchScore: matchScore,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map