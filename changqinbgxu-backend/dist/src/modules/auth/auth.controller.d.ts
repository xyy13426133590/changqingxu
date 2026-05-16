import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SmsLoginDto, SendSmsDto, WechatLoginDto, RealNameDto, FaceVerifyDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    login(loginDto: LoginDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    smsLogin(smsLoginDto: SmsLoginDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    sendSms(sendSmsDto: SendSmsDto): Promise<{
        message: string;
        code?: string;
    }>;
    wechatLogin(wechatLoginDto: WechatLoginDto): Promise<import("./dto/auth.dto").AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    realName(userId: string, realNameDto: RealNameDto): Promise<{
        message: string;
    }>;
    faceVerify(userId: string, faceVerifyDto: FaceVerifyDto): Promise<{
        message: string;
    }>;
}
