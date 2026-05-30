const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { finalizeOrderPaid, formatOrderResponse } = require('/opt/lib/vip')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const orderId = event.orderId || event.id
  assertRequired({ orderId }, ['orderId'])

  if (process.env.NODE_ENV !== 'development' && process.env.VIP_MOCK_PAY !== '1') {
    const err = new Error('仅开发环境且 VIP_MOCK_PAY=1 时可用')
    err.statusCode = 403
    throw err
  }

  const orderRes = await db.collection('dev_vip_orders').doc(orderId).get()
  const order = orderRes.data
  if (!order || order.userId !== userId) {
    const err = new Error('订单不存在')
    err.statusCode = 404
    throw err
  }

  const planRes = await db.collection('dev_vip_plans').doc(order.planId).get()
  const plan = planRes.data
  await finalizeOrderPaid(order, plan, 'mock_tx_' + order._id)

  const refreshed = await db.collection('dev_vip_orders').doc(orderId).get()
  return formatOrderResponse(refreshed.data, plan)
})
