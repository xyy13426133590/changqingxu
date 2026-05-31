# 云数据库初始化步骤（Phase 0）

云环境 ID：`cloud1-d6g7211of923bfddc`

## 1. 创建集合

在云开发控制台 → 数据库，依次创建：

### 基础（7 个）

| 集合名 | 说明 |
|--------|------|
| `users` | 用户 |
| `sms_codes` | 短信验证码 |
| `matches` | 滑卡记录 |
| `conversations` | 会话 |
| `messages` | 消息 |
| `vip_plans` | VIP 套餐 |
| `vip_orders` | VIP 订单 |

### 圈子 / 动态（4 个，发布动态前必建）

| 集合名 | 说明 |
|--------|------|
| `moment_posts` | 动态帖子（`moment-createPost` 写入） |
| `moment_likes` | 点赞记录 |
| `moment_comments` | 评论 |
| `circles` | 圈子（MVP 可空集合，Feed 默认 `default_public`） |

> 若发布失败，请检查云函数是否已部署到当前环境，以及 `moment_posts` 集合 schema 是否与示例文档字段一致。

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

| 索引字段 | 是否唯一 | 说明 |
|----------|----------|------|
| `userId1` + `userId2` | **是（复合唯一）** | 同一对用户只能有一条会话；**不同**用户可与同一 `userId2` 各建一条 |
| `lastMessageAt` | 否 | 会话列表排序 |

**常见误配（会导致打招呼 E11000）：**

- ❌ 不要给 `userId2` 单独建**唯一**索引（否则全库只能有一条 `userId2 = user-demo-002` 的会话）
- ❌ 不要给 `userId1` 单独建**唯一**索引
- ✅ 只保留 `userId1 + userId2` 这一条复合唯一索引

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

### moment_posts（圈子动态）

| 索引字段 | 是否唯一 | 说明 |
|----------|----------|------|
| `createdAt` 降序 | 否 | Feed 按时间排序 |
| `circleId` + `createdAt` 降序 | 否 | 圈子内时间线 |
| `authorId` + `createdAt` 降序 | 否 | 我的动态列表 |
| `status` + `visibility` | **否（切勿唯一）** | 仅用于组合查询加速 |

> **重要：** `status` + `visibility` 必须是**普通复合索引**。若勾选「唯一」，全站只能有一条 `active` + `public` 的动态，发布会报 `E11000 duplicate key`（与集合是否创建无关）。

### moment_likes

- `postId` + `userId`（复合**唯一**，防重复点赞）

### moment_comments

- `postId` + `createdAt`（复合，非唯一）

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

- [ ] 基础 7 个集合均已创建
- [ ] 圈子相关 4 个集合（`moment_posts` 等）已创建
- [ ] 索引与 schema 文档一致
- [ ] `vip_plans` 有 3 条种子数据
- [ ] 安全规则已生效，客户端无法直接写 `users`
