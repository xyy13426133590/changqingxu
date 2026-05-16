/**
 * 认证表单校验辅助（手机号、密码）。
 * 真实登录注册走 @/services/api-auth + 后端。
 */

const PHONE_RE = /^1[3-9]\d{9}$/

/** 与后端演示环境 DEMO_SMS_CODE 一致（见后端 auth.service） */
export const DEMO_SMS_CODE = '888888'

export function validatePhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim())
}

export function validatePassword(pwd: string): boolean {
  return pwd.length >= 6 && pwd.length <= 32
}
