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
exports.AuthResponseDto = exports.RefreshTokenDto = exports.FaceVerifyDto = exports.RealNameDto = exports.WechatLoginDto = exports.SendSmsDto = exports.SmsLoginDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN', {}, { message: '请输入正确的手机号' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手机号不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '密码', example: 'password123' }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.MinLength)(6, { message: '密码最少6位' }),
    (0, class_validator_1.MaxLength)(32, { message: '密码最多32位' }),
    (0, class_validator_1.IsNotEmpty)({ message: '密码不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '昵称', example: '小明' }),
    (0, class_validator_1.IsString)({ message: '昵称必须是字符串' }),
    (0, class_validator_1.MinLength)(2, { message: '昵称最少2个字符' }),
    (0, class_validator_1.MaxLength)(16, { message: '昵称最多16个字符' }),
    (0, class_validator_1.IsNotEmpty)({ message: '昵称不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '验证码（可选，演示环境）', example: '888888', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "code", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN', {}, { message: '请输入正确的手机号' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手机号不能为空' }),
    __metadata("design:type", String)
], LoginDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '密码', example: 'password123' }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.MinLength)(6, { message: '密码最少6位' }),
    (0, class_validator_1.IsNotEmpty)({ message: '密码不能为空' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class SmsLoginDto {
}
exports.SmsLoginDto = SmsLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN', {}, { message: '请输入正确的手机号' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手机号不能为空' }),
    __metadata("design:type", String)
], SmsLoginDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '验证码', example: '888888' }),
    (0, class_validator_1.IsString)({ message: '验证码必须是字符串' }),
    (0, class_validator_1.MinLength)(4, { message: '验证码最少4位' }),
    (0, class_validator_1.MaxLength)(6, { message: '验证码最多6位' }),
    (0, class_validator_1.IsNotEmpty)({ message: '验证码不能为空' }),
    __metadata("design:type", String)
], SmsLoginDto.prototype, "code", void 0);
class SendSmsDto {
}
exports.SendSmsDto = SendSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN', {}, { message: '请输入正确的手机号' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手机号不能为空' }),
    __metadata("design:type", String)
], SendSmsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '类型', example: 'login', enum: ['login', 'register', 'reset'] }),
    (0, class_validator_1.IsEnum)(['login', 'register', 'reset'], { message: '类型必须是 login, register 或 reset' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendSmsDto.prototype, "type", void 0);
class WechatLoginDto {
}
exports.WechatLoginDto = WechatLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '微信登录 code', example: 'xxxxxxxx' }),
    (0, class_validator_1.IsString)({ message: 'code 必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'code 不能为空' }),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户信息（加密）', example: 'encryptedData', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "encryptedData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '加密算法的初始向量', example: 'iv', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "iv", void 0);
class RealNameDto {
}
exports.RealNameDto = RealNameDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '真实姓名', example: '张三' }),
    (0, class_validator_1.IsString)({ message: '姓名必须是字符串' }),
    (0, class_validator_1.MinLength)(2, { message: '姓名最少2个字符' }),
    (0, class_validator_1.MaxLength)(20, { message: '姓名最多20个字符' }),
    (0, class_validator_1.IsNotEmpty)({ message: '姓名不能为空' }),
    __metadata("design:type", String)
], RealNameDto.prototype, "legalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '身份证号', example: '110101199001011234' }),
    (0, class_validator_1.IsString)({ message: '身份证号必须是字符串' }),
    (0, class_validator_1.MinLength)(15, { message: '身份证号格式错误' }),
    (0, class_validator_1.MaxLength)(18, { message: '身份证号格式错误' }),
    (0, class_validator_1.IsNotEmpty)({ message: '身份证号不能为空' }),
    __metadata("design:type", String)
], RealNameDto.prototype, "idCard", void 0);
class FaceVerifyDto {
}
exports.FaceVerifyDto = FaceVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '人脸图片 Base64', example: 'data:image/jpeg;base64,...' }),
    (0, class_validator_1.IsString)({ message: '人脸图片必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '人脸图片不能为空' }),
    __metadata("design:type", String)
], FaceVerifyDto.prototype, "faceImage", void 0);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIs...' }),
    (0, class_validator_1.IsString)({ message: '刷新令牌必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '刷新令牌不能为空' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '访问令牌' }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '刷新令牌' }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户信息' }),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "user", void 0);
//# sourceMappingURL=auth.dto.js.map