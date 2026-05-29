const path = require('path')

/**
 * 加载公共模块：优先 Layer 挂载路径 /opt，其次相对路径（本地开发）
 */
function load(moduleName) {
  const candidates = [
    path.join('/opt', moduleName),
    path.join(__dirname, moduleName),
  ]
  for (const p of candidates) {
    try {
      return require(p)
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') throw e
    }
  }
  throw new Error(`Cannot load common module: ${moduleName}`)
}

module.exports = { load }
