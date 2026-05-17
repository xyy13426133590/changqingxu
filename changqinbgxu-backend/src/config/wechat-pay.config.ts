import { registerAs } from '@nestjs/config';

export const wechatPayConfig = registerAs('wechatPay', () => ({
  /** live | mock — mock 不调微信下单，可走 mock-pay 模拟开通 */
  mode: (process.env.WECHAT_PAY_MODE || 'mock').toLowerCase(),
  mchid: process.env.WECHAT_PAY_MCHID || '',
  /** API 证书序列号（请求签名头） */
  merchantSerial: process.env.WECHAT_PAY_MERCHANT_SERIAL || '',
  apiV3Key: process.env.WECHAT_PAY_API_V3_KEY || '',
  /** 商户 API 私钥 PEM 文件路径，或与 WECHAT_PAY_PRIVATE_KEY_PEM 二选一 */
  privateKeyPath: process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '',
  privateKeyPem: process.env.WECHAT_PAY_PRIVATE_KEY_PEM || '',
  /** 支付结果通知 URL（须 HTTPS 可达），如 https://你的域名/api/vip/payment/wechat-notify */
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
  /** 验签：微信支付平台公钥 PEM（管理平台下载），live 强烈建议配置 */
  platformCertPem: process.env.WECHAT_PAY_PLATFORM_CERT_PEM || '',
}));
