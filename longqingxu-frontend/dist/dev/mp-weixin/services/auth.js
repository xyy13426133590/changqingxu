"use strict";
const PHONE_RE = /^1[3-9]\d{9}$/;
const DEMO_SMS_CODE = "888888";
function validatePhone(phone) {
  return PHONE_RE.test(phone.trim());
}
function validatePassword(pwd) {
  return pwd.length >= 6 && pwd.length <= 32;
}
exports.DEMO_SMS_CODE = DEMO_SMS_CODE;
exports.validatePassword = validatePassword;
exports.validatePhone = validatePhone;
