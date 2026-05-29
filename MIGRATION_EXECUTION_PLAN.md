# 长情许 CloudBase 迁移执行计划

> 按阶段勾选进度。详细接口映射见 [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md)，前端改造见 [FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md)，第三方接入见 [THIRD_PARTY_SDK_INTEGRATION.md](THIRD_PARTY_SDK_INTEGRATION.md)。

| 项目 | 值 |
|------|-----|
| 云环境 ID | `cloud1-d6g7211of923bfddc` |
| Layer 挂载 | `/opt` |
| 负责人 | |
| 计划开始 | |
| 计划上线 | |

---

## 进度总览

| Phase | 名称 | 状态 | 完成日期 |
|-------|------|------|----------|
| 0 | 云基础设施 | ☐ | |
| 1 | Auth 联调 | ☐ | |
| 2 | Users 资料推荐 | ☐ | |
| 3 | Matches 滑卡 | ☐ | |
| 4 | Chat 消息 Watch | ☐ | |
| 5 | Upload 云存储 | ☐ | |
| 6 | VIP 支付 | ☐ | |
| 7 | 第三方生产化 | ☐ | |
| 8 | 全量切流收尾 | ☐ | |

---

## Phase 0：云基础设施（0.5–1 天）

**目标：** 数据库、存储、公共 Layer、基础环境变量就绪。

### 操作清单

- [ ] 微信开发者工具关联云环境 `cloud1-d6g7211of923bfddc`
- [ ] 按 [cloud-database/SETUP.md](cloud-database/SETUP.md) 创建 7 个集合与索引
- [ ] 导入 [cloud-database/seed-vip-plans.json](cloud-database/seed-vip-plans.json)
- [ ] 粘贴 [cloud-database/security-rules.json](cloud-database/security-rules.json) 安全规则
- [ ] 确认云存储权限（私有 + 云函数/临时 URL 访问）
- [ ] 执行 `scripts/package-common-layer.ps1`（或 `.sh`）打包 Layer
- [ ] 控制台创建 Layer `common-layer`（Nodejs18.15，挂载 **`/opt`**）
- [ ] 配置 [cloudfunctions/env.example](cloudfunctions/env.example) 中 Phase 0 变量（JWT、微信 AppID/Secret）

### 验收

- [ ] 7 集合可见，`vip_plans` 有 3 条数据
- [ ] 任选 1 个云函数挂载 Layer 后部署无模块缺失

---

## Phase 1：Auth 联调（1 天）

**依赖：** Phase 0

### 部署云函数（8 个）

`auth-register` · `auth-login` · `auth-smsLogin` · `auth-sendSms` · `auth-wechatLogin` · `auth-refreshToken` · `auth-realName` · `auth-faceVerify`

### 前端

- [ ] `.env` 设置 `VITE_USE_CLOUD=true`
- [ ] 重新编译小程序，确认 `App.vue` 执行 `initCloud()`

### 验收

- [ ] 手机号注册 → `users` 新增
- [ ] 密码登录 → token 写入本地
- [ ] `auth-sendSms`（演示码 888888，`SMS_DEMO_MODE=1`）→ `auth-smsLogin` 成功
- [ ] 微信登录 → openid 绑定
- [ ] `auth-refreshToken` 正常

---

## Phase 2：Users 资料与推荐（1 天）

**依赖：** Phase 1

### 部署云函数（9 个）

`user-getMe` · `user-updateProfile` · `user-updateFilters` · `user-getVipStatus` · `user-getUserCard` · `user-getRecommendations` · `user-getDailyRecommendations` · `user-getUserDetail` · `user-reportUser`

### 验收

- [ ] 编辑资料 → `users` 更新
- [ ] 筛选条件保存
- [ ] 推荐/每日推荐有数据（需 2+ 测试用户）
- [ ] 用户详情、举报正常

---

## Phase 3：Matches 滑卡（0.5 天）

**依赖：** Phase 2

### 部署云函数（5 个）

`match-likeUser` · `match-passUser` · `match-superLikeUser` · `match-getMutualMatches` · `match-resetSwipeHistory`

### 验收

- [ ] like/pass 写入 `matches`
- [ ] 双向 like → 互粉列表
- [ ] Super Like 逻辑（含 VIP 限制）

---

## Phase 4：Chat 会话与 Watch（1–1.5 天）

**依赖：** Phase 3

### 部署云函数（7 个）

`chat-getConversations` · `chat-createConversation` · `chat-deleteConversation` · `chat-togglePinConversation` · `chat-getMessages` · `chat-sendMessage` · `chat-markMessagesRead`

### 验收

- [ ] 互粉后创建会话
- [ ] 发文字 → 对方 `messages` watch 实时收到
- [ ] 已读、置顶、删除会话

---

## Phase 5：Upload 云存储（0.5 天）

**依赖：** Phase 0 存储；聊天语音依赖本阶段

### 部署云函数（3 个）

`upload-uploadAvatar` · `upload-uploadImage` · `upload-uploadVoice`

### 验收

- [ ] 头像上传 → 资料页显示
- [ ] 聊天发图片/语音 → 对方可播放
- [ ] 历史消息媒体 URL 正常

---

## Phase 6：VIP 与微信支付（1 天）

**依赖：** Phase 1

### 部署云函数（5 个）

`vip-getVipPlans` · `vip-createVipOrder` · `vip-getVipOrder` · `vip-mockPayOrder` · `vip-wechatPayNotify`

### 6a Mock（先做）

- [ ] `WECHAT_PAY_MODE=mock` 或 `VIP_MOCK_PAY=1`
- [ ] vip-center 页面 mock 支付流程

### 6b Live（商户号就绪后）

- [ ] 商户平台 JSAPI + APIv3 密钥/证书
- [ ] `vip-wechatPayNotify` 开启 HTTP 访问，URL 填入商户平台
- [ ] 配置完整 `WECHAT_PAY_*`
- [ ] 真机 0.01 元测试 + 回调更新 `vip_orders`

### 验收

- [ ] mock：下单 → 模拟支付 → VIP 状态变更
- [ ] live：真实支付 → 回调到账

---

## Phase 7：第三方生产化（2–3 天）

**依赖：** Phase 1

**详细步骤：** [THIRD_PARTY_SDK_INTEGRATION.md](THIRD_PARTY_SDK_INTEGRATION.md)

### 7.1 腾讯云 SMS

- [ ] 控制台签名 + 模板审核通过
- [ ] 配置 `TENCENT_SECRET_*`、`SMS_*`
- [ ] 关闭 `SMS_DEMO_MODE`
- [ ] 手机收到真实验证码（响应不含 code）

### 7.2 FaceID 二要素

- [ ] 开通 FaceID，配置 `FACEID_RULE_ID_REALNAME`
- [ ] 关闭 `FACEID_DEMO_MODE`
- [ ] 错误身份证拒绝，正确通过 → `isRealName=true`

### 7.3 FaceID 活体

- [ ] 配置 `FACEID_RULE_ID_LIVENESS`
- [ ] manifest 声明 FaceID 插件
- [ ] 插件活体 → `isFaceVerified=true`

### 7.4 微信支付 live

- [ ] 与 Phase 6b 合并验收

---

## Phase 8：全量切流与收尾（0.5–1 天）

**依赖：** Phase 1–7

### 切流

- [ ] 体验版/正式版 `VITE_USE_CLOUD=true`
- [ ] H5 策略确认（保留 Nest 或另行规划）

### 安全

- [ ] 复查数据库安全规则
- [ ] 确认 Secret 未进前端 `.env`
- [ ] 关闭 `SMS_DEMO_MODE`、`VIP_MOCK_PAY`
- [ ] 监控云函数日志与 SMS/FaceID 配额

### 文档

- [ ] 填写本文档「完成日期」列
- [ ] 记录上线日期

---

## 每阶段通用步骤

1. 微信开发者工具 → 上传并部署本阶段云函数（挂载 `common-layer`，路径 `/opt`）
2. 控制台核对 [cloudfunctions/env.example](cloudfunctions/env.example) 对应变量
3. 前端 `.env` 保持 `VITE_USE_CLOUD=true`，重新编译
4. **真机**跑验收清单
5. 勾选本表，进入下一阶段

---

## 云函数分批部署速查

| Phase | 函数 |
|-------|------|
| 1 | auth-register, auth-login, auth-smsLogin, auth-sendSms, auth-wechatLogin, auth-refreshToken, auth-realName, auth-faceVerify |
| 2 | user-getMe, user-updateProfile, user-updateFilters, user-getVipStatus, user-getUserCard, user-getRecommendations, user-getDailyRecommendations, user-getUserDetail, user-reportUser |
| 3 | match-likeUser, match-passUser, match-superLikeUser, match-getMutualMatches, match-resetSwipeHistory |
| 4 | chat-getConversations, chat-createConversation, chat-deleteConversation, chat-togglePinConversation, chat-getMessages, chat-sendMessage, chat-markMessagesRead |
| 5 | upload-uploadAvatar, upload-uploadImage, upload-uploadVoice |
| 6 | vip-getVipPlans, vip-createVipOrder, vip-getVipOrder, vip-mockPayOrder, vip-wechatPayNotify |

---

## 时间线参考

| 阶段 | 预估 |
|------|------|
| Phase 0 | 0.5–1 天 |
| Phase 1–6 | 约 5 天 |
| Phase 7 | 2–3 天（含审核） |
| Phase 8 | 0.5–1 天 |
| **合计** | **约 8–10 个工作日** |

---

## 相关文档

| 文档 | 用途 |
|------|------|
| [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md) | 37 接口映射、部署步骤 |
| [FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md) | 前端双模式改造 |
| [THIRD_PARTY_SDK_INTEGRATION.md](THIRD_PARTY_SDK_INTEGRATION.md) | SMS / FaceID / 支付 |
| [cloud-database/SETUP.md](cloud-database/SETUP.md) | 数据库初始化 |
| [cloudfunctions/env.example](cloudfunctions/env.example) | 环境变量模板 |
