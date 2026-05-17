import * as crypto from 'crypto';

const AUTH_TAG_LENGTH = 16;

/**
 * 解密微信支付 v3 通知 resource（APIv3Key 须为 32 字节）
 */
export function decryptNotifyResource(
  apiV3Key: string,
  ciphertextB64: string,
  nonce: string,
  associatedData: string,
): string {
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

export function verifyWechatPayNotify(
  platformCertPem: string,
  _serial: string,
  timestamp: string,
  nonce: string,
  body: string,
  signatureB64: string,
): boolean {
  if (!platformCertPem?.trim()) {
    return false;
  }
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(message);
  try {
    return verifier.verify(platformCertPem, signatureB64, 'base64');
  } catch {
    return false;
  }
}

export function buildRequestAuthorization(
  mchid: string,
  merchantSerial: string,
  privateKeyPem: string,
  method: string,
  urlPath: string,
  body: string,
): { authorization: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
  const sign = crypto.createSign('RSA-SHA256').update(message).sign(privateKeyPem, 'base64');
  const authorization = `WECHAPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${merchantSerial}",signature="${sign}"`;
  return { authorization };
}

export function buildMiniProgramPaySign(
  appId: string,
  timeStamp: string,
  nonceStr: string,
  pkg: string,
  privateKeyPem: string,
): string {
  const message = `${appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`;
  return crypto.createSign('RSA-SHA256').update(message).sign(privateKeyPem, 'base64');
}

export function randomOutTradeNo(): string {
  return crypto.randomBytes(16).toString('hex');
}
