"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wechatConfig = void 0;
const config_1 = require("@nestjs/config");
exports.wechatConfig = (0, config_1.registerAs)('wechat', () => ({
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    tokenUrl: 'https://api.weixin.qq.com/sns/jscode2session',
}));
//# sourceMappingURL=wechat.config.js.map