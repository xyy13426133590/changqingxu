export type SmsCodeType = 'login' | 'register' | 'reset';
export declare class SmsCode {
    id: string;
    phone: string;
    code: string;
    type: SmsCodeType;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}
