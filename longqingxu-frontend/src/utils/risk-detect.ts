/**
 * 风险内容检测工具
 * 用于检测聊天内容中的第三方导流、诈骗等风险信息
 */

// 风险关键词规则
const RISK_PATTERNS = {
  // 联系方式导流
  contact: [
    /微信号?[:：]?\s*[a-zA-Z0-9_-]+/i,
    /微信[:：]?\s*[a-zA-Z0-9_-]+/i,
    /加微[:：]?\s*[a-zA-Z0-9_-]+/i,
    /手机号?[:：]?\s*1[3-9]\d{9}/,
    /电话[:：]?\s*1[3-9]\d{9}/,
    /QQ[:：]?\s*\d{5,11}/i,
    /q[:：]?\s*\d{5,11}/i,
  ],
  // 外部平台导流
  platform: [
    /去\s*(微信|QQ|钉钉|飞书|微博|抖音|快手|小红书)/,
    /加\s*(微信|QQ|钉钉|飞书)/,
    /关注\s*(微博|抖音|快手|小红书)/,
    /扫码/,
    /二维码/,
  ],
  // 资金相关诈骗
  money: [
    /转账/,
    /汇款/,
    /投资/,
    /理财/,
    /炒股/,
    /基金/,
    /充值/,
    /提现/,
    /手续费/,
    /保证金/,
    /押金/,
    /刷单/,
    /返利/,
    /赚钱/,
    /兼职/,
    /高薪/,
    /日入\d+/,
    /月入\d+/,
    /轻松赚/,
  ],
  // 诱导下载
  download: [
    /下载\s*APP/i,
    /下载\s*应用/,
    /安装\s*软件/,
    /点击链接/,
    /打开网址/,
    /访问网站/,
  ],
  // 个人信息收集
  privacy: [
    /身份证号?/,
    /银行卡/,
    /信用卡/,
    /支付宝/,
    /密码/,
    /验证码/,
    /短信验证/,
    /人脸识别/,
  ],
}

export interface RiskDetectResult {
  hasRisk: boolean
  level: 'low' | 'medium' | 'high'
  type: string[]
  message: string
}

/**
 * 检测文本中的风险内容
 */
export function detectRisk(content: string): RiskDetectResult {
  const result: RiskDetectResult = {
    hasRisk: false,
    level: 'low',
    type: [],
    message: '',
  }

  if (!content || content.trim().length === 0) {
    return result
  }

  let riskScore = 0
  const detectedTypes: string[] = []

  // 检测各类风险
  for (const [category, patterns] of Object.entries(RISK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        riskScore++
        if (!detectedTypes.includes(category)) {
          detectedTypes.push(category)
        }
        break
      }
    }
  }

  if (detectedTypes.length > 0) {
    result.hasRisk = true
    result.type = detectedTypes

    // 根据风险类型和数量确定等级
    if (detectedTypes.includes('money') || detectedTypes.includes('privacy')) {
      result.level = 'high'
      result.message = '⚠️ 检测到高风险内容，可能涉及诈骗或隐私泄露，请勿轻信！'
    } else if (detectedTypes.includes('contact') && detectedTypes.includes('platform')) {
      result.level = 'high'
      result.message = '⚠️ 检测到第三方导流内容，请谨慎添加陌生联系方式！'
    } else if (riskScore >= 3) {
      result.level = 'medium'
      result.message = '⚠️ 检测到可疑内容，建议先通过平台沟通确认身份。'
    } else {
      result.level = 'low'
      result.message = '💡 建议先通过平台站内沟通，确认身份后再添加联系方式。'
    }
  }

  return result
}

/**
 * 检测是否包含加微信等导流内容
 */
export function hasContactInfo(content: string): boolean {
  return RISK_PATTERNS.contact.some(pattern => pattern.test(content)) ||
         RISK_PATTERNS.platform.some(pattern => pattern.test(content))
}

/**
 * 检测是否包含资金相关风险
 */
export function hasMoneyRisk(content: string): boolean {
  return RISK_PATTERNS.money.some(pattern => pattern.test(content))
}

/**
 * 安全内容过滤（替换敏感信息）
 */
export function sanitizeContent(content: string): string {
  let sanitized = content

  // 过滤手机号
  sanitized = sanitized.replace(/1[3-9]\d{9}/g, '[手机号]')

  // 过滤微信号格式
  sanitized = sanitized.replace(/微信号?[:：]?\s*[a-zA-Z0-9_-]+/gi, '[微信号]')

  // 过滤QQ号
  sanitized = sanitized.replace(/QQ[:：]?\s*\d{5,11}/gi, '[QQ号]')

  return sanitized
}

export default {
  detectRisk,
  hasContactInfo,
  hasMoneyRisk,
  sanitizeContent,
}