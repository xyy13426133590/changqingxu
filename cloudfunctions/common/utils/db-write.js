/**
 * 微信云开发：collection.doc(id).set/update 的 data 中不能包含 _id。
 * 业务层返回对象可保留 _id，写入库前须 strip。
 */

function stripDocIdForWrite(doc) {
  if (!doc || typeof doc !== 'object') return {}
  const { _id, ...rest } = doc
  return rest
}

/**
 * doc(id).set — 返回带 _id 的完整文档（内存用）
 */
function prepareSetPayload(doc, id, now = new Date()) {
  const { createdAt, updatedAt, ...fields } = stripDocIdForWrite(doc)
  const data = {
    ...fields,
    createdAt: createdAt != null ? createdAt : now,
    updatedAt: updatedAt != null ? updatedAt : now,
  }
  return { id, data, record: { _id: id, ...data } }
}

/**
 * doc(id).update — 默认刷新 updatedAt，不写入 _id / createdAt
 */
function prepareUpdatePayload(doc, now = new Date()) {
  const { createdAt, updatedAt, ...fields } = stripDocIdForWrite(doc)
  return {
    data: { ...fields, updatedAt: now },
    createdAt,
  }
}

module.exports = {
  stripDocIdForWrite,
  prepareSetPayload,
  prepareUpdatePayload,
}
