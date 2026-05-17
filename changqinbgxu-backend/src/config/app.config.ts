import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const portParsed = parseInt(process.env.PORT || '3000', 10);
  const port = Number.isFinite(portParsed) ? portParsed : 3000;
  /** 提供给客户端拼媒体绝对地址（本地上传/OSS 回退时使用）；小程序真机需填局域网 IP 或域名 */
  const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${port}`)
    .replace(/\/+$/, '');
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port,
    apiPrefix: process.env.API_PREFIX || 'api',
    publicBaseUrl,
    logLevel: process.env.LOG_LEVEL || 'debug',
    logFormat: process.env.LOG_FORMAT || 'combined',
  };
});
