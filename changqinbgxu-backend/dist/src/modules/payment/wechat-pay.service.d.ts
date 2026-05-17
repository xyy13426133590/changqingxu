import { ConfigService } from '@nestjs/config';
export interface MiniProgramPaymentParams {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: 'RSA';
    paySign: string;
}
export declare class WechatPayService {
    private readonly configService;
    private readonly logger;
    private merchantPrivateKeyPem;
    constructor(configService: ConfigService);
    isLiveReady(): boolean;
    createJsapiTransaction(params: {
        outTradeNo: string;
        description: string;
        amountYuan: number;
        openid: string;
    }): Promise<string>;
    buildMiniProgramPayment(prepayId: string): MiniProgramPaymentParams;
    parseAndDecryptNotify(bodyStr: string, headers: Record<string, string | string[] | undefined>): unknown;
}
