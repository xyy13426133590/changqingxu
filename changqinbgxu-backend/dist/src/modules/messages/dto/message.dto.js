"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResponseDto = exports.MarkReadDto = exports.SendMessageDto = exports.MessageType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["VOICE"] = "voice";
    MessageType["EMOJI"] = "emoji";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '会话ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)('4', { message: '会话ID格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '会话ID不能为空' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '接收者ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)('4', { message: '接收者ID格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '接收者ID不能为空' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "receiverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '消息类型', enum: MessageType, example: MessageType.TEXT }),
    (0, class_validator_1.IsEnum)(MessageType, { message: '消息类型错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '消息类型不能为空' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '消息内容', example: '你好！' }),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '内容不能为空' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '媒体URL（图片/语音）', example: 'https://example.com/image.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: '媒体URL格式错误' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '媒体时长（语音）', example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '时长必须是数字' }),
    __metadata("design:type", Number)
], SendMessageDto.prototype, "mediaDuration", void 0);
class MarkReadDto {
}
exports.MarkReadDto = MarkReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '会话ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)('4', { message: '会话ID格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '会话ID不能为空' }),
    __metadata("design:type", String)
], MarkReadDto.prototype, "conversationId", void 0);
class MessageResponseDto {
}
exports.MessageResponseDto = MessageResponseDto;
//# sourceMappingURL=message.dto.js.map