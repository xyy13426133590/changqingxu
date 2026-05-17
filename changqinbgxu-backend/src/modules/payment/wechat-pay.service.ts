import { readFileSync, existsSync } from 'fs';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  buildMiniProgramPaySign,
  buildRequestAuthorization,
  decryptNotifyResource,
  verifyWechatPayNotify,
} from './wechat-pay.utils';

export interface MiniProgramPaymentParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'RSA';
  paySign: string;
}

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);
  private merchantPrivateKeyPem: string | null = null;

  constructor(private readonly configService: ConfigService) {
    const pay = this.configService.get<{
      privateKeyPath?: string;
      privateKeyPem?: string;
    }>('wechatPay');
    const path = pay?.privateKeyPath;
    const inline = pay?.privateKeyPem;
    if (path && existsSync(path)) {
      this.merchantPrivateKeyPem = readFileSync(path, 'utf8');
    } else if (inline) {
      this.merchantPrivateKeyPem = inline.replace(/\\n/g, '\n');
    }
  }

  isLiveReady(): boolean {
    const mode = (this.configService.get<string>('wechatPay.mode') || 'mock').toLowerCase();
    if (mode !== 'live') {
      return false;
    }
    const pay = this.configService.get('wechatPay') as {
      mchid?: string;
      merchantSerial?: string;
      apiV3Key?: string;
      notifyUrl?: string;
    };
    const wx = this.configService.get('wechat') as { appid?: string };
    return !!(
      this.merchantPrivateKeyPem &&
      pay?.mchid &&
      pay?.merchantSerial &&
      pay?.apiV3Key?.length === 32 &&
      pay?.notifyUrl?.startsWith('https://') &&
      wx?.appid
    );
  }

  /** JSAPI 下单，返回 prepay_id */
  async createJsapiTransaction(params: {
    outTradeNo: string;
    description: string;
    amountYuan: number;
    openid: string;
  }): Promise<string> {
    const pay = this.configService.get<{
      mchid: string;
      merchantSerial: string;
      notifyUrl: string;
    }>('wechatPay');
    const wx = this.configService.get<{ appid: string }>('wechat');
    if (!this.merchantPrivateKeyPem || !pay?.mchid || !pay?.merchantSerial || !wx?.appid) {
      throw new BadRequestException('微信支付 live 配置不完整');
    }

    const bodyObj = {
      appid: wx.appid,
      mchid: pay.mchid,
      description: params.description.slice(0, 127),
      out_trade_no: params.outTradeNo,
      notify_url: pay.notifyUrl,
      amount: {
        total: Math.round(params.amountYuan * 100),
        currency: 'CNY' as const,
      },
      payer: { openid: params.openid },
    };

    const body = JSON.stringify(bodyObj);
    const urlPath = '/v3/pay/transactions/jsapi';
    const { authorization } = buildRequestAuthorization(
      pay.mchid,
      pay.merchantSerial,
      this.merchantPrivateKeyPem,
      'POST',
      urlPath,
      body,
    );

    const res = await fetch(`https://api.mch.weixin.qq.com${urlPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authorization,
        'User-Agent': 'changqingxu-nestjs',
      },
      body,
    });

    const text = await res.text();
    let json: { prepay_id?: string; message?: string; code?: string };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      throw new BadRequestException(`微信下单响应异常: ${text.slice(0, 200)}`);
    }

    if (!res.ok || !json.prepay_id) {
      this.logger.warn(`JSAPI 下单失败: ${text}`);
      throw new BadRequestException(json.message || json.code || '微信下单失败');
    }

    return json.prepay_id;
  }

  buildMiniProgramPayment(prepayId: string): MiniProgramPaymentParams {
    const wx = this.configService.get<{ appid: string }>('wechat');
    if (!wx?.appid || !this.merchantPrivateKeyPem) {
      throw new BadRequestException('无法生成支付签名');
    }
    const timeStamp = String(Math.floor(Date.now() / 1000));
    const nonceStr = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
    const pkg = `prepay_id=${prepayId}`;
    const paySign = buildMiniProgramPaySign(wx.appid, timeStamp, nonceStr, pkg, this.merchantPrivateKeyPem);
    return {
      timeStamp,
      nonceStr,
      package: pkg,
      signType: 'RSA',
      paySign,
    };
  }

  /** 校验并解密通知，返回明文对象 */
  parseAndDecryptNotify(bodyStr: string, headers: Record<string, string | string[] | undefined>): unknown {
    const pay = this.configService.get<{
      apiV3Key: string;
      platformCertPem?: string;
    }>('wechatPay');
    const mode = (this.configService.get<string>('wechatPay.mode') || 'mock').toLowerCase();

    const serial = String(headers['wechatpay-serial'] ?? '');
    const sig = String(headers['wechatpay-signature'] ?? '');
    const ts = String(headers['wechatpay-timestamp'] ?? '');
    const nonce = String(headers['wechatpay-nonce'] ?? '');

    if (mode === 'live' && pay?.platformCertPem) {
      const ok = verifyWechatPayNotify(pay.platformCertPem, serial, ts, nonce, bodyStr, sig);
      if (!ok) {
        throw new BadRequestException('微信支付通知验签失败');
      }
    } else if (mode === 'live' && !pay?.platformCertPem) {
      this.logger.warn('未配置 WECHAT_PAY_PLATFORM_CERT_PEM，跳过验签（不推荐生产环境）');
    }

    const body = JSON.parse(bodyStr) as {
      resource?: {
        algorithm?: string;
        ciphertext?: string;
        nonce?: string;
        associated_data?: string;
      };
      event_type?: string;
    };

    const resource = body.resource;
    if (!resource?.ciphertext || !resource.nonce || !pay?.apiV3Key) {
      throw new BadRequestException('通知体无 resource');
    }

    const plaintext = decryptNotifyResource(
      pay.apiV3Key,
      resource.ciphertext,
      resource.nonce,
      resource.associated_data ?? '',
    );
    return JSON.parse(plaintext) as Record<string, unknown>;
  }
}
