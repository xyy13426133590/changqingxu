/**
 * 本地模拟认证（无后端时用于联调 UI）。
 * 注册数据存于 uni.storage；生产环境请替换为真实 API。
 */

const REGISTRY_KEY = 'cqx_mock_auth_users'

/** 演示用固定账号（本地 mock，无真实后端）；首次读取注册表时自动并入，无需先注册 */
export const DEMO_TEST_PHONE = '13800138000'
export const DEMO_TEST_PASSWORD = 'test888'
const DEMO_TEST_NICKNAME = '演示用户'

export interface MockAuthUser {
  id: string
  phone: string
  /** 演示用明文存储，切勿用于生产 */
  password: string
  nickname: string
  createdAt: number
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function withBuiltInDemoUser(map: Record<string, MockAuthUser>): Record<string, MockAuthUser> {
  if (map[DEMO_TEST_PHONE]) return map
  return {
    ...map,
    [DEMO_TEST_PHONE]: {
      id: 'u_demo_builtin',
      phone: DEMO_TEST_PHONE,
      password: DEMO_TEST_PASSWORD,
      nickname: DEMO_TEST_NICKNAME,
      createdAt: 0,
    },
  }
}

/** 仅读本地存储的注册表（不含虚拟演示账号），用于注册判重与写入 */
function readStorageRegistry(): Record<string, MockAuthUser> {
  try {
    const raw = uni.getStorageSync(REGISTRY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw as string) as Record<string, MockAuthUser>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (_e) {
    return {}
  }
}

/** 读存储并合并演示账号（仅用于登录查询）；本地若已有同号记录，仍以存储为准，演示密码走下方特判 */
function readRegistry(): Record<string, MockAuthUser> {
  return withBuiltInDemoUser({ ...readStorageRegistry() })
}

function writeRegistry(map: Record<string, MockAuthUser>) {
  uni.setStorageSync(REGISTRY_KEY, JSON.stringify(map))
}

const PHONE_RE = /^1[3-9]\d{9}$/

export function validatePhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim())
}

export function validatePassword(pwd: string): boolean {
  return pwd.length >= 6 && pwd.length <= 32
}

/** 登录页据此弹出「去注册」引导（勿改文案，登录页依赖此常量） */
export const LOGIN_ERR_ACCOUNT_NOT_FOUND = 'LOGIN_ERR_ACCOUNT_NOT_FOUND'

function makeToken(userId: string) {
  return `mock_${userId}_${Date.now()}`
}

export async function authRegister(params: {
  phone: string
  password: string
  nickname: string
}): Promise<{ token: string; user: MockAuthUser }> {
  await delay(280)
  const phone = params.phone.trim()
  if (!validatePhone(phone)) throw new Error('请输入正确的11位手机号')
  if (!validatePassword(params.password)) throw new Error('密码为 6～32 位')
  const nick = params.nickname.trim()
  if (nick.length < 2 || nick.length > 16) throw new Error('昵称为 2～16 个字符')

  const map = readStorageRegistry()
  if (map[phone]) throw new Error('该手机号已注册，请直接登录')

  const user: MockAuthUser = {
    id: `u_${Date.now()}`,
    phone,
    password: params.password,
    nickname: nick,
    createdAt: Date.now(),
  }
  map[phone] = user
  writeRegistry(map)

  return { token: makeToken(user.id), user }
}

export async function authLogin(params: {
  phone: string
  password: string
}): Promise<{ token: string; user: MockAuthUser }> {
  await delay(260)
  const phone = params.phone.trim()
  if (!validatePhone(phone)) throw new Error('请输入正确的11位手机号')
  if (!params.password) throw new Error('请输入密码')

  // 演示号 + 演示密码：始终可登录（避免本地曾用同号注册过其他密码导致无法登）
  if (phone === DEMO_TEST_PHONE && params.password === DEMO_TEST_PASSWORD) {
    const merged = readRegistry()
    const existing = merged[DEMO_TEST_PHONE]
    const user: MockAuthUser = {
      id: existing != null && existing.id != null ? existing.id : 'u_demo_builtin',
      phone: DEMO_TEST_PHONE,
      password: DEMO_TEST_PASSWORD,
      nickname: existing != null && existing.nickname != null ? existing.nickname : DEMO_TEST_NICKNAME,
      createdAt: existing != null && existing.createdAt ? existing.createdAt : Date.now(),
    }
    return { token: makeToken(user.id), user }
  }

  const map = readRegistry()
  const user = map[phone]
  if (!user) throw new Error(LOGIN_ERR_ACCOUNT_NOT_FOUND)
  if (user.password !== params.password) throw new Error('密码错误')

  return { token: makeToken(user.id), user }
}

// —— 验证码登录（本地 mock，与原型「手机号+验证码」一致）——

const SMS_META_KEY = 'cqx_mock_sms_meta'

interface SmsMeta {
  phone: string
  code: string
  expireAt: number
  lastSentAt: number
}

/** 演示环境固定验证码，便于联调 */
export const DEMO_SMS_CODE = '888888'

function readSmsMeta(): SmsMeta | null {
  try {
    const raw = uni.getStorageSync(SMS_META_KEY) as string
    if (!raw) return null
    return JSON.parse(raw) as SmsMeta
  } catch (_e) {
    return null
  }
}

function writeSmsMeta(m: SmsMeta) {
  uni.setStorageSync(SMS_META_KEY, JSON.stringify(m))
}

/** 发送短信验证码（演示：无真实短信，仅冷却与本地记录） */
export async function sendSmsCode(phone: string): Promise<void> {
  await delay(220)
  const p = phone.trim()
  if (!validatePhone(p)) throw new Error('请输入正确手机号')
  const now = Date.now()
  const prev = readSmsMeta()
  if (prev && prev.phone === p && now - prev.lastSentAt < 55_000) {
    const wait = Math.ceil((55_000 - (now - prev.lastSentAt)) / 1000)
    throw new Error(`${wait} 秒后可重新获取`)
  }
  writeSmsMeta({
    phone: p,
    code: DEMO_SMS_CODE,
    expireAt: now + 5 * 60 * 1000,
    lastSentAt: now,
  })
}

/** 验证码登录：未注册手机号将自动创建本地账号 */
export async function authLoginBySms(phone: string, code: string): Promise<{ token: string; user: MockAuthUser }> {
  await delay(260)
  const p = phone.trim()
  const c = code.trim()
  if (!validatePhone(p)) throw new Error('请输入正确手机号')
  if (!/^\d{4,6}$/.test(c)) throw new Error('请输入 4～6 位验证码')

  const meta = readSmsMeta()
  const ok =
    c === DEMO_SMS_CODE ||
    (!!meta && meta.phone === p && meta.code === c && Date.now() <= meta.expireAt)
  if (!ok) throw new Error('验证码错误或已过期')

  const map = readStorageRegistry()
  let user = map[p]
  if (!user) {
    user = {
      id: `u_${Date.now()}`,
      phone: p,
      password: '__sms_only__',
      nickname: `用户${p.slice(-4)}`,
      createdAt: Date.now(),
    }
    map[p] = user
    writeRegistry(map)
  }

  return { token: makeToken(user.id), user }
}

// —— 微信登录（演示：无后端换票，仅模拟成功；真机小程序需对接服务端）——

const WX_DEMO_PHONE = '13900001999'
const WX_DEMO_NICK = '微信用户'

export async function authLoginWechatMock(): Promise<{ token: string; user: MockAuthUser }> {
  await delay(360)
  // #ifdef MP-WEIXIN
  try {
    await uni.login({ provider: 'weixin' })
  } catch (_e) {
    /* 开发者工具未配置 AppID 时可能失败，仍走演示账号 */
  }
  // #endif
  const user: MockAuthUser = {
    id: 'u_wx_demo',
    phone: WX_DEMO_PHONE,
    password: '__wx_demo__',
    nickname: WX_DEMO_NICK,
    createdAt: Date.now(),
  }
  return { token: makeToken(user.id), user }
}
