const tencentcloud = require('tencentcloud-sdk-nodejs')

const FaceidClient = tencentcloud.faceid.v20180301.Client

function isFaceIdDemoMode() {
  return process.env.FACEID_DEMO_MODE === '1' || process.env.FACEID_DEMO_MODE === 'true'
}

function isFaceIdConfigured() {
  return Boolean(
    process.env.TENCENT_SECRET_ID &&
      process.env.TENCENT_SECRET_KEY &&
      process.env.FACEID_RULE_ID_REALNAME,
  )
}

function isLivenessConfigured() {
  return Boolean(isFaceIdConfigured() && process.env.FACEID_RULE_ID_LIVENESS)
}

function createFaceIdClient() {
  return new FaceidClient({
    credential: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: process.env.FACEID_REGION || '',
  })
}

/**
 * 身份证二要素核验
 * @param {{ name: string, idCard: string }} params
 */
async function verifyIdName({ name, idCard }) {
  if (isFaceIdDemoMode() || !isFaceIdConfigured()) {
    return { pass: true, message: 'demo' }
  }

  const client = createFaceIdClient()
  const res = await client.IdCardVerification({
    Name: name,
    IdCard: idCard,
  })
  const pass = String(res.Result) === '0'
  return {
    pass,
    message: res.Description || (pass ? '一致' : '身份信息不一致'),
  }
}

/**
 * 签发活体核身 BizToken（小程序 DetectAuth）
 * @param {{ name: string, idCard: string, userId: string }} params
 */
async function createLivenessBizToken({ name, idCard, userId }) {
  if (isFaceIdDemoMode() || !isLivenessConfigured()) {
    return `demo-${userId}-${Date.now()}`
  }

  const client = createFaceIdClient()
  const res = await client.DetectAuth({
    RuleId: process.env.FACEID_RULE_ID_LIVENESS,
    Name: name,
    IdCard: idCard,
    RedirectUrl: process.env.FACEID_REDIRECT_URL || 'https://www.qq.com',
    Extra: JSON.stringify({ userId }),
  })
  if (!res.BizToken) {
    const err = new Error('无法获取人脸核身 BizToken')
    err.statusCode = 502
    throw err
  }
  return res.BizToken
}

/**
 * 查询活体核身结果
 * @param {string} bizToken
 */
async function getLivenessResult(bizToken) {
  if (isFaceIdDemoMode() || !isLivenessConfigured() || String(bizToken).startsWith('demo-')) {
    return { success: true, message: 'demo' }
  }

  const client = createFaceIdClient()
  const res = await client.GetDetectInfoEnhanced({
    BizToken: bizToken,
    RuleId: process.env.FACEID_RULE_ID_LIVENESS,
  })
  const errCode = res.Text && res.Text.ErrCode
  const success = errCode === 0 || errCode === '0'
  return {
    success,
    message: (res.Text && res.Text.ErrMsg) || (success ? '核验通过' : '人脸核验未通过'),
  }
}

module.exports = {
  isFaceIdDemoMode,
  isFaceIdConfigured,
  isLivenessConfigured,
  verifyIdName,
  createLivenessBizToken,
  getLivenessResult,
}
