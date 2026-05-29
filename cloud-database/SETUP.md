# 云数据库初始化步骤（Phase 0）

云环境 ID：`cloud1-d6g7211of923bfddc`

## 1. 创建集合（7 个）

在云开发控制台 → 数据库，依次创建：

| 集合名 | 说明 |
|--------|------|
| `users` | 用户 |
| `sms_codes` | 短信验证码 |
| `matches` | 滑卡记录 |
| `conversations` | 会话 |
| `messages` | 消息 |
| `vip_plans` | VIP 套餐 |
| `vip_orders` | VIP 订单 |

字段定义见 [collections-schema.md](collections-schema.md)。

> **注意：** 若控制台集合名带 `dev_` 前缀（如 `dev_users`），需与云函数 `db.collection()` 保持一致——要么改集合名为无前缀，要么批量修改云函数中的集合名，并同步更新 [security-rules.json](security-rules.json) 的 key。

## 2. 创建索引

在各自集合 → 索引管理，按 schema 文档创建：

### users

- `phone`（唯一）
- `wechatOpenid`（唯一）
- `status`

### sms_codes

- `phone` + `type`（复合）
- `expiresAt`

### matches

- `userId` + `targetUserId`（复合唯一）
- `userId` + `isMutual`（复合）

### conversations

- `userId1` + `userId2`（复合唯一）
- `lastMessageAt`

### messages

- `conversationId` + `createdAt`（复合）
- `receiverId` + `isRead`（复合）

### vip_plans

- `isActive` + `sortOrder`（复合）

### vip_orders

- `userId`
- `outTradeNo`（唯一）
- `wechatTransactionId`（唯一）
- `status`

## 3. 导入种子数据

1. 打开 `vip_plans` 集合 → 导入
2. 选择 [seed-vip-plans.json](seed-vip-plans.json)
3. 确认导入 3 条套餐记录

## 4. 配置安全规则

控制台 → 数据库 → 权限设置 → 自定义安全规则，**整份粘贴** [security-rules.json](security-rules.json) 内容。

> 写操作一律走云函数；客户端仅允许只读 `vip_plans` 与会话/消息的 watch 读规则。

## 5. 云存储

确认云存储为私有读写；头像/图片/语音通过云函数或 `getTempFileURL` 访问。

## 验收

- [ ] 7 个集合均已创建
- [ ] 索引与 schema 文档一致
- [ ] `vip_plans` 有 3 条种子数据
- [ ] 安全规则已生效，客户端无法直接写 `users`
