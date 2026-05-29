const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { formatPlan } = require('/opt/lib/vip')

exports.main = wrapHandler(async (event) => {
  await requireAuth(event)
  const res = await db.collection('vip_plans')
    .where({ isActive: true })
    .orderBy('sortOrder', 'asc')
    .get()
  return { plans: res.data.map(formatPlan) }
})
