"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const messages_controller_1 = require("./messages.controller");
const messages_service_1 = require("./messages.service");
const messages_gateway_1 = require("./messages.gateway");
const message_entity_1 = require("../../database/entities/message.entity");
const conversation_entity_1 = require("../../database/entities/conversation.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const conversations_module_1 = require("../conversations/conversations.module");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module");
let MessagesModule = class MessagesModule {
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message, conversation_entity_1.Conversation, user_entity_1.User]),
            conversations_module_1.ConversationsModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
        ],
        controllers: [messages_controller_1.MessagesController],
        providers: [messages_service_1.MessagesService, messages_gateway_1.MessagesGateway],
        exports: [messages_service_1.MessagesService],
    })
], MessagesModule);
//# sourceMappingURL=messages.module.js.map