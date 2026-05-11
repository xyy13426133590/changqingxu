"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const apiPrefix = configService.get('API_PREFIX', 'api');
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
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
//# sourceMappingURL=main.js.map