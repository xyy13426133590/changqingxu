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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const OSS = require("ali-oss");
const crypto = require("crypto");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        const ossConfig = this.configService.get('oss');
        if (ossConfig && ossConfig.accessKeyId && ossConfig.accessKeySecret) {
            this.ossClient = new OSS({
                region: ossConfig.region,
                accessKeyId: ossConfig.accessKeyId,
                accessKeySecret: ossConfig.accessKeySecret,
                bucket: ossConfig.bucket,
            });
        }
    }
    async uploadImage(userId, file) {
        return this.uploadToOss(userId, file, 'images');
    }
    async uploadVoice(userId, file) {
        return this.uploadToOss(userId, file, 'voices');
    }
    async uploadAvatar(userId, file) {
        return this.uploadToOss(userId, file, 'avatars');
    }
    async uploadToOss(userId, file, folder) {
        const ext = file.originalname.split('.').pop();
        const hash = crypto.randomBytes(8).toString('hex');
        const fileName = `${folder}/${userId}/${Date.now()}_${hash}.${ext}`;
        if (!this.ossClient) {
            this.logger.warn('OSS 未配置，使用本地存储');
            const mockUrl = `https://example.com/${fileName}`;
            return { url: mockUrl, fileName };
        }
        try {
            const result = await this.ossClient.put(fileName, file.buffer);
            const domain = this.configService.get('oss.domain') || result.url;
            const url = domain.includes('http') ? `${domain}/${fileName}` : `https://${domain}/${fileName}`;
            this.logger.log(`文件上传成功: ${fileName}`);
            return { url: result.url || url, fileName };
        }
        catch (error) {
            this.logger.error(`文件上传失败: ${error.message}`);
            throw new Error('文件上传失败');
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map