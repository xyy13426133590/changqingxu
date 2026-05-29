const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db, _ } = require('/opt/db')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const res = await db.collection('matches').where({ userId }).get()
  if (res.data.length === 0) return { deleted: 0 }

  const ids = res.data.map((m) => m._id)
  await db.collection('matches').where({ _id: _.in(ids) }).remove()
  return { deleted: ids.length }
})
