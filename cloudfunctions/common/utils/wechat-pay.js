const crypto = require('crypto')

const AUTH_TAG_LENGTH = 16

function decryptNotifyResource(apiV3Key, ciphertextB64, nonce, associatedData) {
  const key = Buffer.from(apiV3Key, 'utf8')
  if (key.length !== 32) {
    throw new Error('WECHAT_PAY_API_V3_KEY 须为 32 位字符')
  }
  const buffer = Buffer.from(ciphertextB64, 'base64')
  if (buffer.length < AUTH_TAG_LENGTH) {
    throw new Error('ciphertext too short')
  }
  const authTag = buffer.subarray(buffer.length - AUTH_TAG_LENGTH)
  const encrypted = buffer.subarray(0, buffer.length - AUTH_TAG_LENGTH)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'))
  if (associatedData) {
    decipher.setAAD(Buffer.from(associatedData, 'utf8'))
  }
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

function verifyWechatPayNotify(platformCertPem, _serial, timestamp, nonce, body, signatureB64) {
  if (!platformCertPem?.trim()) return false
  const message = `${timestamp}\n${nonce}\n${body}\n`
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(message)
  try {
    return verifier.verify(platformCertPem, signatureB64, 'base64')
  } catch {
    return false
  }
}

function buildRequestAuthorization(mchid, merchantSerial, privateKeyPem, method, urlPath, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(16).toString('hex')
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`
  const sign = crypto.createSign('RSA-SHA256').update(message).sign(privateKeyPem, 'base64')
  const authorization = `WECHAPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${merchantSerial}",signature="${sign}"`
  return { authorization }
}

function buildMiniProgramPaySign(appId, timeStamp, nonceStr, pkg, privateKeyPem) {
  const message = `${appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`
  return crypto.createSign('RSA-SHA256').update(message).sign(privateKeyPem, 'base64')
}

function randomOutTradeNo() {
  return crypto.randomBytes(16).toString('hex')
}

function getMerchantPrivateKeyPem() {
  const inline = process.env.WECHAT_PAY_PRIVATE_KEY_PEM
  if (inline) return inline.replace(/\\n/g, '\n')
  return null
}

function isWechatPayLiveReady() {
  const mode = (process.env.WECHAT_PAY_MODE || 'mock').toLowerCase()
  if (mode !== 'live') return false
  const pem = getMerchantPrivateKeyPem()
  return !!(
    pem &&
    process.env.WECHAT_PAY_MCHID &&
    process.env.WECHAT_PAY_MERCHANT_SERIAL &&
    process.env.WECHAT_PAY_API_V3_KEY?.length === 32 &&
    process.env.WECHAT_PAY_NOTIFY_URL?.startsWith('https://') &&
    process.env.WECHAT_APPID
  )
}

async function createJsapiTransaction(params) {
  const pem = getMerchantPrivateKeyPem()
  const mchid = process.env.WECHAT_PAY_MCHID
  const merchantSerial = process.env.WECHAT_PAY_MERCHANT_SERIAL
  const notifyUrl = process.env.WECHAT_PAY_NOTIFY_URL
  const appid = process.env.WECHAT_APPID
  if (!pem || !mchid || !merchantSerial || !appid) {
    throw new Error('微信支付 live 配置不完整')
  }
  const bodyObj = {
    appid,
    mchid,
    description: params.description.slice(0, 127),
    out_trade_no: params.outTradeNo,
    notify_url: notifyUrl,
    amount: { total: Math.round(params.amountYuan * 100), currency: 'CNY' },
    payer: { openid: params.openid },
  }
  const body = JSON.stringify(bodyObj)
  const urlPath = '/v3/pay/transactions/jsapi'
  const { authorization } = buildRequestAuthorization(mchid, merchantSerial, pem, 'POST', urlPath, body)
  const res = await fetch(`https://api.mch.weixin.qq.com${urlPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authorization,
      'User-Agent': 'changqingxu-cloud',
    },
    body,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`微信下单响应异常: ${text.slice(0, 200)}`)
  }
  if (!res.ok || !json.prepay_id) {
    throw new Error(json.message || json.code || '微信下单失败')
  }
  return json.prepay_id
}

function buildMiniProgramPayment(prepayId) {
  const appid = process.env.WECHAT_APPID
  const pem = getMerchantPrivateKeyPem()
  if (!appid || !pem) throw new Error('无法生成支付签名')
  const timeStamp = String(Math.floor(Date.now() / 1000))
  const nonceStr = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  const pkg = `prepay_id=${prepayId}`
  const paySign = buildMiniProgramPaySign(appid, timeStamp, nonceStr, pkg, pem)
  return { timeStamp, nonceStr, package: pkg, signType: 'RSA', paySign }
}

function parseAndDecryptNotify(bodyStr, headers) {
  const mode = (process.env.WECHAT_PAY_MODE || 'mock').toLowerCase()
  const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY
  const platformCertPem = process.env.WECHAT_PAY_PLATFORM_CERT_PEM?.replace(/\\n/g, '\n')
  const serial = String(headers['wechatpay-serial'] || headers['Wechatpay-Serial'] || '')
  const sig = String(headers['wechatpay-signature'] || headers['Wechatpay-Signature'] || '')
  const ts = String(headers['wechatpay-timestamp'] || headers['Wechatpay-Timestamp'] || '')
  const nonce = String(headers['wechatpay-nonce'] || headers['Wechatpay-Nonce'] || '')
  if (mode === 'live' && platformCertPem) {
    const ok = verifyWechatPayNotify(platformCertPem, serial, ts, nonce, bodyStr, sig)
    if (!ok) throw new Error('微信支付通知验签失败')
  }
  const body = JSON.parse(bodyStr)
  const resource = body.resource
  if (!resource?.ciphertext || !resource.nonce || !apiV3Key) {
    throw new Error('通知体无 resource')
  }
  const plaintext = decryptNotifyResource(
    apiV3Key,
    resource.ciphertext,
    resource.nonce,
    resource.associated_data || '',
  )
  return JSON.parse(plaintext)
}

module.exports = {
  decryptNotifyResource,
  verifyWechatPayNotify,
  buildRequestAuthorization,
  buildMiniProgramPaySign,
  randomOutTradeNo,
  isWechatPayLiveReady,
  createJsapiTransaction,
  buildMiniProgramPayment,
  parseAndDecryptNotify,
  getMerchantPrivateKeyPem,
}
