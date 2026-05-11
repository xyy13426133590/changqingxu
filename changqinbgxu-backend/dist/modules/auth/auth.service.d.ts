import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { SmsCode } from '../../database/entities/sms-code.entity';
import { RegisterDto, LoginDto, SmsLoginDto, SendSmsDto, WechatLoginDto, RealNameDto, FaceVerifyDto, RefreshTokenDto, AuthResponseDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly smsCodeRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly SALT_ROUNDS;
    private readonly DEMO_SMS_CODE;
    constructor(userRepository: Repository<User>, smsCodeRepository: Repository<SmsCode>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    smsLogin(smsLoginDto: SmsLoginDto): Promise<AuthResponseDto>;
    sendSms(sendSmsDto: SendSmsDto): Promise<{
        message: string;
        code?: string;
    }>;
    wechatLogin(wechatLoginDto: WechatLoginDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    realName(userId: string, realNameDto: RealNameDto): Promise<{
        message: string;
    }>;
    faceVerify(userId: string, faceVerifyDto: FaceVerifyDto): Promise<{
        message: string;
    }>;
    private verifySmsCode;
    private generateTokens;
    private formatUserResponse;
}
