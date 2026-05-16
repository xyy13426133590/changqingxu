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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const matches_service_1 = require("./matches.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const match_dto_1 = require("./dto/match.dto");
let MatchesController = class MatchesController {
    constructor(matchesService) {
        this.matchesService = matchesService;
    }
    async likeUser(userId, likeUserDto) {
        return this.matchesService.likeUser(userId, likeUserDto.targetUserId);
    }
    async passUser(userId, passUserDto) {
        return this.matchesService.passUser(userId, passUserDto.targetUserId);
    }
    async superLikeUser(userId, superLikeUserDto) {
        return this.matchesService.superLikeUser(userId, superLikeUserDto.targetUserId);
    }
    async getMutualMatches(userId) {
        return this.matchesService.getMutualMatches(userId);
    }
    async resetSwipeHistory(userId) {
        return this.matchesService.resetSwipeHistory(userId);
    }
};
exports.MatchesController = MatchesController;
__decorate([
    (0, common_1.Post)('like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '喜欢用户' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '操作成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, match_dto_1.LikeUserDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "likeUser", null);
__decorate([
    (0, common_1.Post)('pass'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '不喜欢用户' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '操作成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, match_dto_1.PassUserDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "passUser", null);
__decorate([
    (0, common_1.Post)('super-like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '超级喜欢用户' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '操作成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, match_dto_1.SuperLikeUserDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "superLikeUser", null);
__decorate([
    (0, common_1.Get)('mutual'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取互相喜欢的人' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getMutualMatches", null);
__decorate([
    (0, common_1.Post)('reset-swipes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '清空滑卡记录（演示/联调）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '已清空' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "resetSwipeHistory", null);
exports.MatchesController = MatchesController = __decorate([
    (0, swagger_1.ApiTags)('匹配'),
    (0, common_1.Controller)('matches'),
    __metadata("design:paramtypes", [matches_service_1.MatchesService])
], MatchesController);
//# sourceMappingURL=matches.controller.js.map