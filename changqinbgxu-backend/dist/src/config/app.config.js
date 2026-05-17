"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
exports.appConfig = (0, config_1.registerAs)('app', () => {
    const portParsed = parseInt(process.env.PORT || '3000', 10);
    const port = Number.isFinite(portParsed) ? portParsed : 3000;
    const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${port}`)
        .replace(/\/+$/, '');
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port,
        apiPrefix: process.env.API_PREFIX || 'api',
        publicBaseUrl,
        logLevel: process.env.LOG_LEVEL || 'debug',
        logFormat: process.env.LOG_FORMAT || 'combined',
    };
});
//# sourceMappingURL=app.config.js.map