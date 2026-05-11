"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ossConfig = void 0;
const config_1 = require("@nestjs/config");
exports.ossConfig = (0, config_1.registerAs)('oss', () => ({
    region: process.env.OSS_REGION || 'oss-cn-beijing',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.OSS_BUCKET || 'changqingxu',
    domain: process.env.OSS_DOMAIN || '',
}));
//# sourceMappingURL=oss.config.js.map