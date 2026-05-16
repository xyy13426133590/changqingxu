export declare class RegisterDto {
    phone: string;
    password: string;
    nickname: string;
    code?: string;
}
export declare class LoginDto {
    phone: string;
    password: string;
}
export declare class SmsLoginDto {
    phone: string;
    code: string;
}
export declare class SendSmsDto {
    phone: string;
    type?: 'login' | 'register' | 'reset';
}
export declare class WechatLoginDto {
    code: string;
    encryptedData?: string;
    iv?: string;
}
export declare class RealNameDto {
    legalName: string;
    idCard: string;
}
export declare class FaceVerifyDto {
    faceImage: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        phone: string;
        nickname: string;
        avatar: string;
        isRealName: boolean;
        isFaceVerified: boolean;
        isVip: boolean;
    };
}
