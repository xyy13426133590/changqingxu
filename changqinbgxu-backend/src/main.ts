import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  // 上传 OSS 不可用或 Bucket 无效时写入本地 uploads/，经此前缀提供可读 URL
  const uploadsRoot = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsRoot)) {
    mkdirSync(uploadsRoot, { recursive: true });
  }
  app.useStaticAssets(uploadsRoot, {
    prefix: `/${apiPrefix}/upload-static/`,
  });

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS 配置
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 全局前缀
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('长情许交友小程序 API')
    .setDescription('基于 NestJS + MySQL + Redis + WebSocket 的社交交友后端')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('认证', '用户登录注册')
    .addTag('用户', '用户资料管理')
    .addTag('匹配', '喜欢/不喜欢匹配')
    .addTag('会话', '聊天会话管理')
    .addTag('消息', '实时消息')
    .addTag('VIP', '会员套餐')
    .addTag('上传', '文件上传')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  logger.log(`========================================`);
  logger.log(`应用启动成功`);
  logger.log(`监听端口: ${port}`);
  logger.log(`API 地址: http://localhost:${port}/${apiPrefix}`);
  logger.log(`API 文档: http://localhost:${port}/docs`);
  logger.log(`WebSocket: ws://localhost:${port}`);
  logger.log(`========================================`);
}

bootstrap();
