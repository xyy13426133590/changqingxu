"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const ioredis_1 = require("@nestjs-modules/ioredis");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const matches_module_1 = require("./modules/matches/matches.module");
const conversations_module_1 = require("./modules/conversations/conversations.module");
const messages_module_1 = require("./modules/messages/messages.module");
const vip_module_1 = require("./modules/vip/vip.module");
const upload_module_1 = require("./modules/upload/upload.module");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const redis_config_1 = require("./config/redis.config");
const oss_config_1 = require("./config/oss.config");
const wechat_config_1 = require("./config/wechat.config");
const wechat_pay_config_1 = require("./config/wechat-pay.config");
const jwt_config_1 = require("./config/jwt.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [app_config_1.appConfig, database_config_1.databaseConfig, redis_config_1.redisConfig, oss_config_1.ossConfig, wechat_config_1.wechatConfig, wechat_pay_config_1.wechatPayConfig, jwt_config_1.jwtConfig],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const ssl = configService.get('database.ssl');
                    return {
                        type: 'mysql',
                        host: configService.get('database.host'),
                        port: configService.get('database.port'),
                        username: configService.get('database.username'),
                        password: configService.get('database.password', ''),
                        database: configService.get('database.database'),
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: configService.get('database.synchronize', false),
                        logging: configService.get('database.logging', false),
                        charset: 'utf8mb4',
                        timezone: '+08:00',
                        ...(ssl !== undefined && ssl !== false ? { ssl } : {}),
                    };
                },
            }),
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'single',
                    options: {
                        host: configService.get('redis.host'),
                        port: configService.get('redis.port'),
                        password: configService.get('redis.password'),
                        db: configService.get('redis.db', 0),
                    },
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            matches_module_1.MatchesModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            vip_module_1.VipModule,
            upload_module_1.UploadModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map