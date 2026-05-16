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
exports.MatchResponseDto = exports.SuperLikeUserDto = exports.PassUserDto = exports.LikeUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class LikeUserDto {
}
exports.LikeUserDto = LikeUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标用户ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)('4', { message: '目标用户ID格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '目标用户ID不能为空' }),
    __metadata("design:type", String)
], LikeUserDto.prototype, "targetUserId", void 0);
class PassUserDto {
}
exports.PassUserDto = PassUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标用户ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)('4', { message: '目标用户ID格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '目标用户ID不能为空' }),
    __metadata("design:type", String)
], PassUserDto.prototype, "targetUserId", void 0);
class SuperLikeUserDto {
}
exports.SuperLikeUserDto = SuperLikeUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标用户ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)('4', { message: '目标用户ID格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '目标用户ID不能为空' }),
    __metadata("design:type", String)
], SuperLikeUserDto.prototype, "targetUserId", void 0);
class MatchResponseDto {
}
exports.MatchResponseDto = MatchResponseDto;
//# sourceMappingURL=match.dto.js.map