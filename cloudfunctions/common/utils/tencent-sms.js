const tencentcloud = require('tencentcloud-sdk-nodejs')

const SmsClient = tencentcloud.sms.v20210111.Client

function isSmsDemoMode() {
  return process.env.SMS_DEMO_MODE === '1' || process.env.SMS_DEMO_MODE === 'true'
}

function isSmsConfigured() {
  return Boolean(
    process.env.TENCENT_SECRET_ID &&
      process.env.TENCENT_SECRET_KEY &&
      process.env.SMS_SDK_APP_ID &&
      process.env.SMS_SIGN_NAME &&
      process.env.SMS_TEMPLATE_ID,
  )
}

function createSmsClient() {
  return new SmsClient({
    credential: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: process.env.SMS_REGION || 'ap-guangzhou',
  })
}

/**
 * @param {string} phone 11 位手机号
 * @param {string} code 验证码
 */
async function sendTencentSms(phone, code) {
  const client = createSmsClient()
  const res = await client.SendSms({
    SmsSdkAppId: process.env.SMS_SDK_APP_ID,
    SignName: process.env.SMS_SIGN_NAME,
    TemplateId: process.env.SMS_TEMPLATE_ID,
    PhoneNumberSet: [`+86${phone}`],
    TemplateParamSet: [code, '5'],
  })
  const status = res.SendStatusSet && res.SendStatusSet[0]
  if (status && status.Code !== 'Ok') {
    const err = new Error(status.Message || '短信发送失败')
    err.statusCode = 502
    throw err
  }
  return res
}

module.exports = {
  isSmsDemoMode,
  isSmsConfigured,
  sendTencentSms,
}
