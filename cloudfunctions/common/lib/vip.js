const { db } = require('/opt/db')
const { getUserById } = require('./users')

function formatPlan(plan) {
  return {
    id: plan._id,
    name: plan.name,
    durationMonths: plan.durationMonths,
    price: Number(plan.price),
    originalPrice: plan.originalPrice ? Number(plan.originalPrice) : undefined,
    features: plan.features || [],
    tag: plan.tag,
    sortOrder: plan.sortOrder,
  }
}

function formatOrderResponse(order, plan) {
  return {
    id: order._id,
    userId: order.userId,
    planId: order.planId,
    amount: Number(order.amount),
    status: order.status,
    payMethod: order.payMethod,
    payTime: order.payTime,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    plan: plan ? formatPlan(plan) : undefined,
  }
}

async function finalizeOrderPaid(order, plan, wechatTransactionId) {
  if (order.status === 'paid') return order
  if (order.status !== 'pending') {
    const err = new Error('订单状态不允许支付')
    err.statusCode = 403
    throw err
  }
  if (wechatTransactionId) {
    const dup = await db.collection('vip_orders')
      .where({ wechatTransactionId })
      .limit(1)
      .get()
    if (dup.data[0] && dup.data[0]._id !== order._id) {
      const err = new Error('重复的交易号')
      err.statusCode = 400
      throw err
    }
  }
  const user = await getUserById(order.userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }
  const now = new Date()
  let base = now
  if (user.isVip && user.vipExpiry && new Date(user.vipExpiry) > now) {
    base = new Date(user.vipExpiry)
  }
  const expiresAt = new Date(base)
  expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths)
  await db.collection('vip_orders').doc(order._id).update({
    data: {
      status: 'paid',
      payTime: now,
      expiresAt,
      wechatTransactionId: wechatTransactionId || order.wechatTransactionId,
      updatedAt: now,
    },
  })
  await db.collection('users').doc(order.userId).update({
    data: { isVip: true, vipExpiry: expiresAt, updatedAt: now },
  })
  const refreshed = await db.collection('vip_orders').doc(order._id).get()
  return refreshed.data
}

module.exports = {
  formatPlan,
  formatOrderResponse,
  finalizeOrderPaid,
}
