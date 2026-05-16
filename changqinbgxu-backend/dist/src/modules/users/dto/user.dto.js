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
exports.UserCardDto = exports.UserResponseDto = exports.ReportUserDto = exports.UpdateFiltersDto = exports.UpdateProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '昵称', example: '小明' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: '昵称最少2个字符' }),
    (0, class_validator_1.MaxLength)(16, { message: '昵称最多16个字符' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '头像URL', example: 'https://example.com/avatar.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: '头像必须是有效的URL' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '性别', example: 'male', enum: ['male', 'female', 'unknown'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['male', 'female', 'unknown']),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '生日', example: '1990-01-01' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '身高(cm)', example: 175 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '体重(kg)', example: 70 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '家乡', example: '北京市' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "hometown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '当前位置', example: '北京市朝阳区' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '学历', example: '本科' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '学校', example: '北京大学' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '学校档次', example: '985', enum: ['985', '211', null] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['985', '211', null]),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "schoolTier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '职业', example: '产品经理' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '职位级别', example: '高级' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "jobLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '公司', example: '阿里巴巴' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '年收入', example: '20万-30万' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "income", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '个人介绍', example: '热爱生活，喜欢旅行...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: '个人介绍最多500字' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '兴趣爱好', example: ['旅行', '摄影', '阅读'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateProfileDto.prototype, "hobbies", void 0);
class UpdateFiltersDto {
}
exports.UpdateFiltersDto = UpdateFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '年龄范围', example: { min: 20, max: 35 } }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateFiltersDto.prototype, "ageRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '生肖配对偏好', example: ['三合', '六合'] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateFiltersDto.prototype, "zodiacMatch", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '距离范围(km)', example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateFiltersDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '学历要求', example: ['本科', '硕士'] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateFiltersDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '收入范围', example: { min: '10万', max: '50万' } }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateFiltersDto.prototype, "incomeRange", void 0);
class ReportUserDto {
}
exports.ReportUserDto = ReportUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '举报原因', example: '发布不当内容' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: '举报原因不能为空' }),
    __metadata("design:type", String)
], ReportUserDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '详细描述', example: '该用户发布违规内容...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportUserDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '截图证据URL数组', example: ['https://example.com/evidence1.jpg'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ReportUserDto.prototype, "evidence", void 0);
class UserResponseDto {
}
exports.UserResponseDto = UserResponseDto;
class UserCardDto {
}
exports.UserCardDto = UserCardDto;
//# sourceMappingURL=user.dto.js.map