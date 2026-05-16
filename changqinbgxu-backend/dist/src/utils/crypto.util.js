"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = generateRandomString;
exports.generateUUID = generateUUID;
exports.sha256 = sha256;
exports.md5 = md5;
exports.generateSmsCode = generateSmsCode;
const crypto = require("crypto");
function generateRandomString(length = 32) {
    return crypto.randomBytes(length / 2).toString('hex');
}
function generateUUID() {
    return crypto.randomUUID();
}
function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}
function generateSmsCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
//# sourceMappingURL=crypto.util.js.map