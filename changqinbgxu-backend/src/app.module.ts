import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MatchesModule } from './modules/matches/matches.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { VipModule } from './modules/vip/vip.module';
import { UploadModule } from './modules/upload/upload.module';

// 配置
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { ossConfig } from './config/oss.config';
import { wechatConfig } from './config/wechat.config';
import { wechatPayConfig } from './config/wechat-pay.config';
import { jwtConfig } from './config/jwt.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, redisConfig, ossConfig, wechatConfig, wechatPayConfig, jwtConfig],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ssl = configService.get<
          boolean | { rejectUnauthorized: boolean; ca?: string } | undefined
        >('database.ssl');
        return {
          type: 'mysql' as const,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password', ''),
          database: configService.get<string>('database.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('database.synchronize', false),
          logging: configService.get<boolean>('database.logging', false),
          charset: 'utf8mb4',
          timezone: '+08:00',
          ...(ssl !== undefined && ssl !== false ? { ssl } : {}),
        };
      },
    }),

    // Redis 模块
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db', 0),
        },
      }),
    }),

    // 业务模块
    AuthModule,
    UsersModule,
    MatchesModule,
    ConversationsModule,
    MessagesModule,
    VipModule,
    UploadModule,
  ],
})
export class AppModule {}
