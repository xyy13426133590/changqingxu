const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertRequired } = require('/opt/validate')
const { generateTokens, formatAuthUser } = require('/opt/auth')
const { getUserByOpenid } = require('/opt/lib/users')
const { createUser, updateLastLogin } = require('/opt/lib/auth-helper')

exports.main = wrapHandler(async (event) => {
  const { code } = event
  assertRequired({ code }, ['code'])

  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID

  if (!openid && code) {
    const appid = process.env.WECHAT_APPID
    const secret = process.env.WECHAT_SECRET
    if (!appid || !secret) {
      const err = new Error('微信配置不完整')
      err.statusCode = 500
      throw err
    }
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    const res = await fetch(url)
    const data = await res.json()
    if (data.errcode) {
      const err = new Error(`微信登录失败: ${data.errmsg}`)
      err.statusCode = 401
      throw err
    }
    openid = data.openid
    var unionid = data.unionid
  }

  if (!openid) {
    const err = new Error('微信登录失败，请重试')
    err.statusCode = 401
    throw err
  }

  let user = await getUserByOpenid(openid)
  if (!user) {
    user = await createUser({
      wechatOpenid: openid,
      wechatUnionid: unionid || '',
      nickname: '微信用户',
    })
  }

  const tokens = await generateTokens(user)
  await updateLastLogin(user._id)

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: formatAuthUser(user),
  }
})
