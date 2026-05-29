const crypto = require('crypto')

function generateRandomString(length = 32) {
  return crypto.randomBytes(length / 2).toString('hex')
}

function generateUUID() {
  return crypto.randomUUID()
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

function generateSmsCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

module.exports = {
  generateRandomString,
  generateUUID,
  sha256,
  md5,
  generateSmsCode,
}
