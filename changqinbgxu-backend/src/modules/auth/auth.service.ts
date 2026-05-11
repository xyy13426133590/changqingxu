import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../../database/entities/user.entity';
import { SmsCode } from '../../database/entities/sms-code.entity';
import {
  RegisterDto,
  LoginDto,
  SmsLoginDto,
  SendSmsDto,
  WechatLoginDto,
  RealNameDto,
  FaceVerifyDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  // 演示环境固定验证码
  private readonly DEMO_SMS_CODE = '888888';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SmsCode)
    private readonly smsCodeRepository: Repository<SmsCode>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { phone, password, nickname, code } = registerDto;

    // 检查手机号是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingUser) {
      throw new BadRequestException('该手机号已被注册');
    }

    // 验证码验证（可选，演示环境）
    if (code && code !== this.DEMO_SMS_CODE) {
      await this.verifySmsCode(phone, code, 'register');
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 创建用户
    const user = this.userRepository.create({
      phone,
      passwordHash,
      nickname,
      avatar: '',
      gender: 'unknown',
      status: 'active',
    });

    const savedUser = await this.userRepository.save(user);

    // 生成令牌
    const tokens = await this.generateTokens(savedUser);

    // 更新最后登录时间
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

  /**
   * 手机号+密码登录
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { phone, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { phone, status: 'active' },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 生成令牌
    const tokens = await this.generateTokens(user);

    // 更新最后登录时间
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

  /**
   * 手机号+验证码登录
   */
  async smsLogin(smsLoginDto: SmsLoginDto): Promise<AuthResponseDto> {
    const { phone, code } = smsLoginDto;

    // 验证验证码
    await this.verifySmsCode(phone, code, 'login');

    let user = await this.userRepository.findOne({
      where: { phone, status: 'active' },
    });

    // 如果用户不存在，自动创建
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

    // 生成令牌
    const tokens = await this.generateTokens(user);

    // 更新最后登录时间
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

  /**
   * 发送短信验证码
   */
  async sendSms(sendSmsDto: SendSmsDto): Promise<{ message: string; code?: string }> {
    const { phone, type = 'login' } = sendSmsDto;

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('手机号格式错误');
    }

    // 生成验证码（演示环境使用固定码）
    const code = this.DEMO_SMS_CODE;

    // 保存到数据库
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5分钟有效期

    const smsCode = this.smsCodeRepository.create({
      phone,
      code,
      type,
      expiresAt,
      isUsed: false,
    });

    await this.smsCodeRepository.save(smsCode);

    // 演示环境直接返回验证码
    this.logger.log(`验证码已发送（演示）: ${phone} -> ${code}`);

    return {
      message: '验证码发送成功',
      code, // 演示环境返回，生产环境去掉
    };
  }

  /**
   * 微信登录
   */
  async wechatLogin(wechatLoginDto: WechatLoginDto): Promise<AuthResponseDto> {
    const { code } = wechatLoginDto;
    const { appid, secret, tokenUrl } = this.configService.get('wechat');

    try {
      // 调用微信接口获取 openid
      const response = await fetch(
        `${tokenUrl}?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`,
      );
      const data = await response.json();

      if (data.errcode) {
        throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`);
      }

      const { openid, unionid } = data;

      // 查找或创建用户
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

      // 生成令牌
      const tokens = await this.generateTokens(user);

      // 更新最后登录时间
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
      });

      this.logger.log(`微信登录成功: ${openid}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.formatUserResponse(user),
      };
    } catch (error) {
      this.logger.error('微信登录失败', error);
      throw new UnauthorizedException('微信登录失败，请重试');
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, status: 'active' },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const accessToken = await this.jwtService.signAsync(
        { sub: user.id, phone: user.phone },
        {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: this.configService.get<string>('jwt.expiresIn'),
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 实名认证
   */
  async realName(userId: string, realNameDto: RealNameDto): Promise<{ message: string }> {
    const { legalName, idCard } = realNameDto;

    // TODO: 接入真实的实名认证服务（如阿里云、腾讯云）
    // 演示环境直接通过

    // 身份证脱敏处理
    const maskedIdCard = idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');

    await this.userRepository.update(userId, {
      legalName,
      idCardMasked: maskedIdCard,
      isRealName: true,
    });

    this.logger.log(`实名认证成功: ${userId}`);

    return { message: '实名认证成功' };
  }

  /**
   * 人脸核验
   */
  async faceVerify(userId: string, faceVerifyDto: FaceVerifyDto): Promise<{ message: string }> {
    const { faceImage } = faceVerifyDto;

    // TODO: 接入真实的人脸识别服务（如阿里云、腾讯云）
    // 演示环境直接通过

    await this.userRepository.update(userId, {
      isFaceVerified: true,
    });

    this.logger.log(`人脸核验成功: ${userId}`);

    return { message: '人脸核验成功' };
  }

  /**
   * 私有方法：验证短信验证码
   */
  private async verifySmsCode(
    phone: string,
    code: string,
    type: 'login' | 'register' | 'reset',
  ): Promise<void> {
    // 演示环境固定验证码直接通过
    if (code === this.DEMO_SMS_CODE) {
      return;
    }

    const smsCode = await this.smsCodeRepository.findOne({
      where: { phone, code, type, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!smsCode) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    if (smsCode.expiresAt < new Date()) {
      throw new UnauthorizedException('验证码已过期');
    }

    // 标记为已使用
    smsCode.isUsed = true;
    await this.smsCodeRepository.save(smsCode);
  }

  /**
   * 私有方法：生成访问令牌和刷新令牌
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = { sub: user.id, phone: user.phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * 私有方法：格式化用户响应
   */
  private formatUserResponse(user: User) {
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
}
