import { registerAs } from '@nestjs/config';

export const ossConfig = registerAs('oss', () => ({
  region: process.env.OSS_REGION || 'oss-cn-beijing',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET || 'changqingxu',
  domain: process.env.OSS_DOMAIN || '',
}));
