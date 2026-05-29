const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { generateUUID } = require('/opt/utils/crypto')
const { randomOutTradeNo, isWechatPayLiveReady, createJsapiTransaction, buildMiniProgramPayment } = require('/opt/utils/wechat-pay')
const { getUserById } = require('/opt/lib/users')
const { formatOrderResponse } = require('/opt/lib/vip')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { planId, payMethod = 'wechat' } = event
  assertRequired({ planId }, ['planId'])

  const planRes = await db.collection('vip_plans').doc(planId).get()
  const plan = planRes.data
  if (!plan || !plan.isActive) {
    const err = new Error('套餐不存在或已下架')
    err.statusCode = 404
    throw err
  }

  const user = await getUserById(userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }
  if (!user.wechatOpenid?.trim()) {
    const err = new Error('请先使用微信小程序登录后再开通 VIP')
    err.statusCode = 400
    throw err
  }

  const outTradeNo = randomOutTradeNo()
  const now = new Date()
  const orderId = generateUUID()
  const order = {
    _id: orderId,
    userId,
    planId,
    amount: plan.price,
    status: 'pending',
    payMethod,
    outTradeNo,
    createdAt: now,
    updatedAt: now,
  }
  await db.collection('vip_orders').doc(orderId).set({ data: order })

  const mode = (process.env.WECHAT_PAY_MODE || 'mock').toLowerCase()
  if (mode === 'mock' || !isWechatPayLiveReady()) {
    return {
      order: formatOrderResponse(order, plan),
      paymentMode: 'mock',
    }
  }

  try {
    const prepayId = await createJsapiTransaction({
      outTradeNo,
      description: `VIP-${plan.name}`,
      amountYuan: Number(plan.price),
      openid: user.wechatOpenid.trim(),
    })
    await db.collection('vip_orders').doc(orderId).update({
      data: { wechatPrepayId: prepayId, updatedAt: new Date() },
    })
    order.wechatPrepayId = prepayId
    return {
      order: formatOrderResponse(order, plan),
      payment: buildMiniProgramPayment(prepayId),
      paymentMode: 'live',
    }
  } catch (e) {
    const err = new Error(e.message || '微信支付下单失败')
    err.statusCode = 400
    throw err
  }
})
