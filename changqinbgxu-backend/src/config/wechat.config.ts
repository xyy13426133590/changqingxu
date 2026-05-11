import { registerAs } from '@nestjs/config';

export const wechatConfig = registerAs('wechat', () => ({
  appid: process.env.WECHAT_APPID || '',
  secret: process.env.WECHAT_SECRET || '',
  tokenUrl: 'https://api.weixin.qq.com/sns/jscode2session',
}));
