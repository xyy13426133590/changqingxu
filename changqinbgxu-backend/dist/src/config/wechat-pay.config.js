"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wechatPayConfig = void 0;
const config_1 = require("@nestjs/config");
exports.wechatPayConfig = (0, config_1.registerAs)('wechatPay', () => ({
    mode: (process.env.WECHAT_PAY_MODE || 'mock').toLowerCase(),
    mchid: process.env.WECHAT_PAY_MCHID || '',
    merchantSerial: process.env.WECHAT_PAY_MERCHANT_SERIAL || '',
    apiV3Key: process.env.WECHAT_PAY_API_V3_KEY || '',
    privateKeyPath: process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '',
    privateKeyPem: process.env.WECHAT_PAY_PRIVATE_KEY_PEM || '',
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
    platformCertPem: process.env.WECHAT_PAY_PLATFORM_CERT_PEM || '',
}));
//# sourceMappingURL=wechat-pay.config.js.map