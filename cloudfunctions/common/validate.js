function assertPhone(phone) {
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    const err = new Error('手机号格式错误')
    err.statusCode = 400
    throw err
  }
}

function assertRequired(obj, fields) {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      const err = new Error(`缺少必填参数: ${field}`)
      err.statusCode = 400
      throw err
    }
  }
}

module.exports = { assertPhone, assertRequired }
