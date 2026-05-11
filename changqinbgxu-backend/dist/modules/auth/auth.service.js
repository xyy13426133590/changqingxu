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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../database/entities/user.entity");
const sms_code_entity_1 = require("../../database/entities/sms-code.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, smsCodeRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.smsCodeRepository = smsCodeRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.SALT_ROUNDS = 10;
        this.DEMO_SMS_CODE = '888888';
    }
    async register(registerDto) {
        const { phone, password, nickname, code } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { phone },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('该手机号已被注册');
        }
        if (code && code !== this.DEMO_SMS_CODE) {
            await this.verifySmsCode(phone, code, 'register');
        }
        const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
        const user = this.userRepository.create({
            phone,
            passwordHash,
            nickname,
            avatar: '',
            gender: 'unknown',
            status: 'active',
        });
        const savedUser = await this.userRepository.save(user);
        const tokens = await this.generateTokens(savedUser);
        await this.userRepository.update(savedUser.id, {
            lastLoginAt: new Date(),
        });
        this.logger.log(`用户注册成功: ${phone}`);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: this.formatUserResponse(savedUser),
        };
    }
    async login(loginDto) {
        const { phone, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { phone, status: 'active' },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const tokens = await this.generateTokens(user);
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date(),
        });
        this.logger.log(`用户登录成功: ${phone}`);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: this.formatUserResponse(user),
        };
    }
    async smsLogin(smsLoginDto) {
        const { phone, code } = smsLoginDto;
        await this.verifySmsCode(phone, code, 'login');
        let user = await this.userRepository.findOne({
            where: { phone, status: 'active' },
        });
        if (!user) {
            user = this.userRepository.create({
                phone,
                nickname: `用户${phone.slice(-4)}`,
                avatar: '',
                gender: 'unknown',
                status: 'active',
            });
            user = await this.userRepository.save(user);
            this.logger.log(`自动创建用户: ${phone}`);
        }
        const tokens = await this.generateTokens(user);
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date(),
        });
        this.logger.log(`验证码登录成功: ${phone}`);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: this.formatUserResponse(user),
        };
    }
    async sendSms(sendSmsDto) {
        const { phone, type = 'login' } = sendSmsDto;
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            throw new common_1.BadRequestException('手机号格式错误');
        }
        const code = this.DEMO_SMS_CODE;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        const smsCode = this.smsCodeRepository.create({
            phone,
            code,
            type,
            expiresAt,
            isUsed: false,
        });
        await this.smsCodeRepository.save(smsCode);
        this.logger.log(`验证码已发送（演示）: ${phone} -> ${code}`);
        return {
            message: '验证码发送成功',
            code,
        };
    }
    async wechatLogin(wechatLoginDto) {
        const { code } = wechatLoginDto;
        const { appid, secret, tokenUrl } = this.configService.get('wechat');
        try {
            const response = await fetch(`${tokenUrl}?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`);
            const data = await response.json();
            if (data.errcode) {
                throw new common_1.UnauthorizedException(`微信登录失败: ${data.errmsg}`);
            }
            const { openid, unionid } = data;
            let user = await this.userRepository.findOne({
                where: { wechatOpenid: openid },
            });
            if (!user) {
                user = this.userRepository.create({
                    wechatOpenid: openid,
                    wechatUnionid: unionid,
                    nickname: '微信用户',
                    avatar: '',
                    gender: 'unknown',
                    status: 'active',
                });
                user = await this.userRepository.save(user);
                this.logger.log(`微信用户创建成功: ${openid}`);
            }
            const tokens = await this.generateTokens(user);
            await this.userRepository.update(user.id, {
                lastLoginAt: new Date(),
            });
            this.logger.log(`微信登录成功: ${openid}`);
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: this.formatUserResponse(user),
            };
        }
        catch (error) {
            this.logger.error('微信登录失败', error);
            throw new common_1.UnauthorizedException('微信登录失败，请重试');
        }
    }
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('jwt.secret'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, status: 'active' },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('用户不存在');
            }
            const accessToken = await this.jwtService.signAsync({ sub: user.id, phone: user.phone }, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn'),
            });
            return { accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('刷新令牌无效或已过期');
        }
    }
    async realName(userId, realNameDto) {
        const { legalName, idCard } = realNameDto;
        const maskedIdCard = idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
        await this.userRepository.update(userId, {
            legalName,
            idCardMasked: maskedIdCard,
            isRealName: true,
        });
        this.logger.log(`实名认证成功: ${userId}`);
        return { message: '实名认证成功' };
    }
    async faceVerify(userId, faceVerifyDto) {
        const { faceImage } = faceVerifyDto;
        await this.userRepository.update(userId, {
            isFaceVerified: true,
        });
        this.logger.log(`人脸核验成功: ${userId}`);
        return { message: '人脸核验成功' };
    }
    async verifySmsCode(phone, code, type) {
        if (code === this.DEMO_SMS_CODE) {
            return;
        }
        const smsCode = await this.smsCodeRepository.findOne({
            where: { phone, code, type, isUsed: false },
            order: { createdAt: 'DESC' },
        });
        if (!smsCode) {
            throw new common_1.UnauthorizedException('验证码错误或已过期');
        }
        if (smsCode.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('验证码已过期');
        }
        smsCode.isUsed = true;
        await this.smsCodeRepository.save(smsCode);
    }
    async generateTokens(user) {
        const payload = { sub: user.id, phone: user.phone };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn', '7d'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn', '30d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            phone: user.phone,
            nickname: user.nickname,
            avatar: user.avatar,
            isRealName: user.isRealName,
            isFaceVerified: user.isFaceVerified,
            isVip: user.isVip,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(sms_code_entity_1.SmsCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map