"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
function normalizeErrorMessage(raw, fallback) {
    if (raw == null)
        return fallback;
    if (typeof raw === 'string')
        return raw;
    if (Array.isArray(raw)) {
        return raw
            .map((item) => typeof item === 'string' ? item : JSON.stringify(item))
            .filter(Boolean)
            .join('; ');
    }
    if (typeof raw === 'object') {
        return JSON.stringify(raw);
    }
    return String(raw);
}
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = '服务器内部错误';
        let code = 'INTERNAL_ERROR';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null) {
                const body = exceptionResponse;
                message = normalizeErrorMessage(body.message, exception.message);
                if (body.code != null && typeof body.code === 'string') {
                    code = body.code;
                }
                else {
                    code = 'HTTP_ERROR';
                }
            }
            else {
                message = exception.message;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        this.logger.error(`${request.method} ${request.url} ${status} - ${message}`, exception instanceof Error ? exception.stack : '');
        response.status(status).json({
            code,
            message,
            status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map