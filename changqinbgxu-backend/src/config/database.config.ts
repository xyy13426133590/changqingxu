import { registerAs } from '@nestjs/config';

/** 腾讯云 MySQL 外网链路常需开启 SSL；内网/VPC 直连一般可关闭 */
function buildMysqlSsl():
  | boolean
  | { rejectUnauthorized: boolean; ca?: string }
  | undefined {
  if (process.env.DB_SSL !== 'true') {
    return undefined;
  }
  if (process.env.DB_SSL_CA) {
    return {
      rejectUnauthorized: true,
      ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
    };
  }
  // 无 CA 时仅适合开发联调；生产建议配置 DB_SSL_CA（控制台下载证书）
  return { rejectUnauthorized: false };
}

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'changqingxu',
  // 已用 docs/database.sql 建表时建议 .env 设 DB_SYNCHRONIZE=false，避免自动改表与脚本冲突
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  ssl: buildMysqlSsl(),
}));
