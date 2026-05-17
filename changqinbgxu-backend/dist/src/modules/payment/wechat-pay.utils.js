"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptNotifyResource = decryptNotifyResource;
exports.verifyWechatPayNotify = verifyWechatPayNotify;
exports.buildRequestAuthorization = buildRequestAuthorization;
exports.buildMiniProgramPaySign = buildMiniProgramPaySign;
exports.randomOutTradeNo = randomOutTradeNo;
const crypto = require("crypto");
const AUTH_TAG_LENGTH = 16;
function decryptNotifyResource(apiV3Key, ciphertextB64, nonce, associatedData) {
    const key = Buffer.from(apiV3Key, 'utf8');
    if (key.length !== 32) {
        throw new Error('WECHAT_PAY_API_V3_KEY 须为 32 位字符');
    }
    const buffer = Buffer.from(ciphertextB64, 'base64');
    if (buffer.length < AUTH_TAG_LENGTH) {
        throw new Error('ciphertext too short');
    }
    const authTag = buffer.subarray(buffer.length - AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(0, buffer.length - AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'));
    if (associatedData) {
        decipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
function verifyWechatPayNotify(platformCertPem, _serial, timestamp, nonce, body, signatureB64) {
    if (!platformCertPem?.trim()) {
        return false;
    }
    const message = `${timestamp}\n${nonce}\n${body}\n`;
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(message);
    try {
        return verifier.verify(platformCertPem, signatureB64, 'base64');
    }
    catch {
        return false;
    }
}
function buildRequestAuthorization(mchid, merchantSerial, privateKeyPem, method, urlPath, body) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
    const sign = crypto.createSign('RSA-SHA256').update(message).sign(privateKeyPem, 'base64');
    const authorization = `WECHAPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${merchantSerial}",signature="${sign}"`;
    return { authorization };
}
function buildMiniProgramPaySign(appId, timeStamp, nonceStr, pkg, privateKeyPem) {
    const message = `${appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`;
    return crypto.createSign('RSA-SHA256').update(message).sign(privateKeyPem, 'base64');
}
function randomOutTradeNo() {
    return crypto.randomBytes(16).toString('hex');
}
//# sourceMappingURL=wechat-pay.utils.js.map