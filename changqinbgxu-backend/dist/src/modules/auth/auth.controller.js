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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async smsLogin(smsLoginDto) {
        return this.authService.smsLogin(smsLoginDto);
    }
    async sendSms(sendSmsDto) {
        return this.authService.sendSms(sendSmsDto);
    }
    async wechatLogin(wechatLoginDto) {
        return this.authService.wechatLogin(wechatLoginDto);
    }
    async refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
    async realName(userId, realNameDto) {
        return this.authService.realName(userId, realNameDto);
    }
    async faceVerify(userId, faceVerifyDto) {
        return this.authService.faceVerify(userId, faceVerifyDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: '用户注册' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '注册成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数错误或手机号已存在' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '手机号+密码登录' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '登录成功' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '手机号或密码错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('sms-login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '手机号+验证码登录' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '登录成功' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '验证码错误或已过期' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SmsLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "smsLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('send-sms'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '发送短信验证码' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '验证码发送成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '手机号格式错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SendSmsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendSms", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('wechat-login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '微信登录' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '登录成功' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '微信授权失败' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.WechatLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "wechatLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '刷新访问令牌' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '刷新成功' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '刷新令牌无效' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('real-name'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '实名认证' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '认证成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '身份信息验证失败' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.RealNameDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "realName", null);
__decorate([
    (0, common_1.Post)('face-verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '人脸核验' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '核验成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '人脸核验失败' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.FaceVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "faceVerify", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('认证'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map