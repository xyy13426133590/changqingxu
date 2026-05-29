function success(data, message = '请求成功') {
  return {
    code: 'SUCCESS',
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

function fail(message, code = 'ERROR', statusCode = 400) {
  const err = new Error(message)
  err.code = code
  err.statusCode = statusCode
  return err
}

function wrapHandler(handler) {
  return async (event, context) => {
    try {
      const data = await handler(event, context)
      return success(data)
    } catch (e) {
      const statusCode = e.statusCode || 500
      const message = e.message || '服务器错误'
      const code = statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 404 ? 'NOT_FOUND' : 'ERROR'
      return {
        code,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        statusCode,
      }
    }
  }
}

module.exports = { success, fail, wrapHandler }
