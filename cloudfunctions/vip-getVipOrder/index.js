const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { formatOrderResponse } = require('/opt/lib/vip')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const orderId = event.orderId || event.id
  assertRequired({ orderId }, ['orderId'])

  const orderRes = await db.collection('vip_orders').doc(orderId).get()
  const order = orderRes.data
  if (!order) {
    const err = new Error('订单不存在')
    err.statusCode = 404
    throw err
  }
  if (order.userId !== userId) {
    const err = new Error('无权查看此订单')
    err.statusCode = 403
    throw err
  }

  let plan
  try {
    const planRes = await db.collection('vip_plans').doc(order.planId).get()
    plan = planRes.data
  } catch {
    plan = null
  }

  return formatOrderResponse(order, plan)
})
