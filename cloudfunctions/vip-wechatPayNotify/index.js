const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { db } = require('/opt/db')
const { parseAndDecryptNotify } = require('/opt/utils/wechat-pay')
const { finalizeOrderPaid } = require('/opt/lib/vip')

/**
 * HTTP 触发云函数 — 微信支付回调
 * 返回格式须符合微信要求 { code, message }
 */
exports.main = async (event) => {
  try {
    const bodyStr = event.body || (typeof event === 'string' ? event : JSON.stringify(event))
    const headers = event.headers || {}

    const plain = parseAndDecryptNotify(bodyStr, headers)
    if (plain.trade_state !== 'SUCCESS') {
      return { code: 'SUCCESS', message: '成功' }
    }

    const outNo = plain.out_trade_no
    const txId = plain.transaction_id
    if (!outNo) {
      return { code: 'FAIL', message: '无商户单号' }
    }

    const res = await db.collection('vip_orders').where({ outTradeNo: outNo }).limit(1).get()
    const order = res.data[0]
    if (!order) {
      console.warn(`通知订单未找到: ${outNo}`)
      return { code: 'SUCCESS', message: '成功' }
    }

    const planRes = await db.collection('vip_plans').doc(order.planId).get()
    await finalizeOrderPaid(order, planRes.data, txId || null)
    return { code: 'SUCCESS', message: '成功' }
  } catch (e) {
    console.error('支付通知处理失败', e)
    return { code: 'FAIL', message: e.message || '处理失败' }
  }
}
