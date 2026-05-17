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
var WechatPayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPayService = void 0;
const fs_1 = require("fs");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const wechat_pay_utils_1 = require("./wechat-pay.utils");
let WechatPayService = WechatPayService_1 = class WechatPayService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(WechatPayService_1.name);
        this.merchantPrivateKeyPem = null;
        const pay = this.configService.get('wechatPay');
        const path = pay?.privateKeyPath;
        const inline = pay?.privateKeyPem;
        if (path && (0, fs_1.existsSync)(path)) {
            this.merchantPrivateKeyPem = (0, fs_1.readFileSync)(path, 'utf8');
        }
        else if (inline) {
            this.merchantPrivateKeyPem = inline.replace(/\\n/g, '\n');
        }
    }
    isLiveReady() {
        const mode = (this.configService.get('wechatPay.mode') || 'mock').toLowerCase();
        if (mode !== 'live') {
            return false;
        }
        const pay = this.configService.get('wechatPay');
        const wx = this.configService.get('wechat');
        return !!(this.merchantPrivateKeyPem &&
            pay?.mchid &&
            pay?.merchantSerial &&
            pay?.apiV3Key?.length === 32 &&
            pay?.notifyUrl?.startsWith('https://') &&
            wx?.appid);
    }
    async createJsapiTransaction(params) {
        const pay = this.configService.get('wechatPay');
        const wx = this.configService.get('wechat');
        if (!this.merchantPrivateKeyPem || !pay?.mchid || !pay?.merchantSerial || !wx?.appid) {
            throw new common_1.BadRequestException('微信支付 live 配置不完整');
        }
        const bodyObj = {
            appid: wx.appid,
            mchid: pay.mchid,
            description: params.description.slice(0, 127),
            out_trade_no: params.outTradeNo,
            notify_url: pay.notifyUrl,
            amount: {
                total: Math.round(params.amountYuan * 100),
                currency: 'CNY',
            },
            payer: { openid: params.openid },
        };
        const body = JSON.stringify(bodyObj);
        const urlPath = '/v3/pay/transactions/jsapi';
        const { authorization } = (0, wechat_pay_utils_1.buildRequestAuthorization)(pay.mchid, pay.merchantSerial, this.merchantPrivateKeyPem, 'POST', urlPath, body);
        const res = await fetch(`https://api.mch.weixin.qq.com${urlPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: authorization,
                'User-Agent': 'changqingxu-nestjs',
            },
            body,
        });
        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        }
        catch {
            throw new common_1.BadRequestException(`微信下单响应异常: ${text.slice(0, 200)}`);
        }
        if (!res.ok || !json.prepay_id) {
            this.logger.warn(`JSAPI 下单失败: ${text}`);
            throw new common_1.BadRequestException(json.message || json.code || '微信下单失败');
        }
        return json.prepay_id;
    }
    buildMiniProgramPayment(prepayId) {
        const wx = this.configService.get('wechat');
        if (!wx?.appid || !this.merchantPrivateKeyPem) {
            throw new common_1.BadRequestException('无法生成支付签名');
        }
        const timeStamp = String(Math.floor(Date.now() / 1000));
        const nonceStr = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const pkg = `prepay_id=${prepayId}`;
        const paySign = (0, wechat_pay_utils_1.buildMiniProgramPaySign)(wx.appid, timeStamp, nonceStr, pkg, this.merchantPrivateKeyPem);
        return {
            timeStamp,
            nonceStr,
            package: pkg,
            signType: 'RSA',
            paySign,
        };
    }
    parseAndDecryptNotify(bodyStr, headers) {
        const pay = this.configService.get('wechatPay');
        const mode = (this.configService.get('wechatPay.mode') || 'mock').toLowerCase();
        const serial = String(headers['wechatpay-serial'] ?? '');
        const sig = String(headers['wechatpay-signature'] ?? '');
        const ts = String(headers['wechatpay-timestamp'] ?? '');
        const nonce = String(headers['wechatpay-nonce'] ?? '');
        if (mode === 'live' && pay?.platformCertPem) {
            const ok = (0, wechat_pay_utils_1.verifyWechatPayNotify)(pay.platformCertPem, serial, ts, nonce, bodyStr, sig);
            if (!ok) {
                throw new common_1.BadRequestException('微信支付通知验签失败');
            }
        }
        else if (mode === 'live' && !pay?.platformCertPem) {
            this.logger.warn('未配置 WECHAT_PAY_PLATFORM_CERT_PEM，跳过验签（不推荐生产环境）');
        }
        const body = JSON.parse(bodyStr);
        const resource = body.resource;
        if (!resource?.ciphertext || !resource.nonce || !pay?.apiV3Key) {
            throw new common_1.BadRequestException('通知体无 resource');
        }
        const plaintext = (0, wechat_pay_utils_1.decryptNotifyResource)(pay.apiV3Key, resource.ciphertext, resource.nonce, resource.associated_data ?? '');
        return JSON.parse(plaintext);
    }
};
exports.WechatPayService = WechatPayService;
exports.WechatPayService = WechatPayService = WechatPayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WechatPayService);
//# sourceMappingURL=wechat-pay.service.js.map