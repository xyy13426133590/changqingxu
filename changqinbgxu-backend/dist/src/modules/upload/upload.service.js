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
const fs_1 = require("fs");
const path = require("path");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        const ossConfig = this.configService.get('oss');
        if (ossConfig?.accessKeyId && ossConfig?.accessKeySecret && ossConfig?.bucket) {
            this.ossClient = new OSS({
                region: ossConfig.region,
                accessKeyId: ossConfig.accessKeyId,
                accessKeySecret: ossConfig.accessKeySecret,
                bucket: ossConfig.bucket,
            });
        }
        else {
            this.ossClient = undefined;
            this.logger.warn('OSS AK/SK 或 Bucket 未配置，上传将直接使用本地磁盘');
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
        const baseName = file.originalname || '';
        const extFromName = baseName.includes('.') && baseName.length > 0
            ? (baseName.split('.').pop() || '').toLowerCase()
            : '';
        const allowed = new Set([
            'mp3',
            'wav',
            'm4a',
            'aac',
            'mp4',
            'mpeg',
            'caf',
            'amr',
            '3gp',
        ]);
        const ext = extFromName && allowed.has(extFromName) ? extFromName : 'aac';
        const hash = crypto.randomBytes(8).toString('hex');
        const fileName = `${folder}/${userId}/${Date.now()}_${hash}.${ext}`;
        const buffer = file.buffer;
        if (!buffer?.length) {
            throw new Error('上传文件内容为空');
        }
        const persistLocal = async () => {
            const uploadsRoot = path.join(process.cwd(), 'uploads');
            const diskPath = path.join(uploadsRoot, ...fileName.split('/'));
            await fs_1.promises.mkdir(path.dirname(diskPath), { recursive: true });
            await fs_1.promises.writeFile(diskPath, buffer);
            const apiPrefix = (this.configService.get('app.apiPrefix') ??
                process.env.API_PREFIX ??
                'api').replace(/^\/+|\/+$/g, '');
            const publicBase = (this.configService.get('app.publicBaseUrl') ??
                `http://127.0.0.1:${this.configService.get('app.port', 3000)}`).replace(/\/+$/, '');
            const absoluteUrl = `${publicBase}/${apiPrefix}/upload-static/${fileName}`;
            this.logger.warn(`本地存储已写入 ${diskPath}`);
            return { url: absoluteUrl, fileName };
        };
        if (!this.ossClient) {
            return persistLocal();
        }
        try {
            const result = await this.ossClient.put(fileName, buffer);
            const domain = this.configService.get('oss.domain') || result.url;
            const composed = domain.includes('http') ? `${domain}/${fileName}` : `https://${domain}/${fileName}`;
            const url = result.url || composed;
            this.logger.log(`文件上传成功(OSS): ${fileName}`);
            return { url, fileName };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`OSS 上传失败，降级为本地存储: ${message}`);
            return persistLocal();
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map