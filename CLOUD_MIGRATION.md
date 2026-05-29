# 长情许 NestJS → 微信云函数迁移手册

本文档说明如何将 REST API 迁移至微信云开发（CloudBase），供手动上传部署与联调参考。

## 环境信息

| 配置项 | 值 |
|--------|-----|
| 云环境 ID | `prod-love-app-d8gn9cxenfb74c1ac` |
| 运行时 | Node.js 18.15 |
| 数据库 | CloudBase 云数据库（7 集合） |
| 存储 | 云存储（`avatars/`、`images/`、`voices/`） |
| 调用方式 | `wx.cloud.callFunction` |
| Layer 挂载 | `/opt`（`common/` 内容映射到 `/opt/response.js` 等） |

## 目录结构

```
cloudfunctions/          # 云函数（上传至微信开发者工具）
  common/                # 公共层 → 部署为云函数 Layer
  auth-register/         # 业务云函数（前缀命名）
  user-getMe/
  ...
cloud-database/          # 集合结构与种子数据
longqingxu-frontend/     # 前端 cloud.ts 双模式切换
```

## 接口 → 云函数映射（37 个）

云函数名格式：**`{模块前缀}-{函数名}`**，与 `cloud-api-map.ts` 一致。

### Auth（8）

| 原路由 | 云函数 | 鉴权 |
|--------|--------|------|
| POST /api/auth/register | `auth-register` | 无 |
| POST /api/auth/login | `auth-login` | 无 |
| POST /api/auth/sms-login | `auth-smsLogin` | 无 |
| POST /api/auth/send-sms | `auth-sendSms` | 无 |
| POST /api/auth/wechat-login | `auth-wechatLogin` | 无 |
| POST /api/auth/refresh-token | `auth-refreshToken` | 无 |
| POST /api/auth/real-name | `auth-realName` | JWT |
| POST /api/auth/face-verify | `auth-faceVerify` | JWT |

### Users（9）

| 原路由 | 云函数 | 鉴权 |
|--------|--------|------|
| GET /api/users/me | `user-getMe` | JWT |
| PUT /api/users/me | `user-updateProfile` | JWT |
| PUT /api/users/me/filters | `user-updateFilters` | JWT |
| GET /api/users/me/vip | `user-getVipStatus` | JWT |
| GET /api/users/me/card | `user-getUserCard` | JWT |
| GET /api/users/recommendations | `user-getRecommendations` | JWT |
| GET /api/users/daily | `user-getDailyRecommendations` | JWT |
| GET /api/users/:id | `user-getUserDetail` | JWT |
| POST /api/users/:id/report | `user-reportUser` | JWT |

### Matches（5）

| 原路由 | 云函数 | 鉴权 |
|--------|--------|------|
| POST /api/matches/like | `match-likeUser` | JWT |
| POST /api/matches/pass | `match-passUser` | JWT |
| POST /api/matches/super-like | `match-superLikeUser` | JWT |
| GET /api/matches/mutual | `match-getMutualMatches` | JWT |
| POST /api/matches/reset-swipes | `match-resetSwipeHistory` | JWT |

### Conversations（5）

| 原路由 | 云函数 | 鉴权 |
|--------|--------|------|
| GET /api/conversations | `chat-getConversations` | JWT |
| POST /api/conversations | `chat-createConversation` | JWT |
| DELETE /api/conversations/:id | `chat-deleteConversation` | JWT |
| PUT /api/conversations/:id/top | `chat-togglePinConversation` | JWT |
| GET /api/conversations/:id/messages | `chat-getMessages` | JWT |

### Messages（2）

| 原路由 | 云函数 | 鉴权 |
|--------|--------|------|
| POST /api/messages | `chat-sendMessage` | JWT |
| PUT /api/messages/read | `chat-markMessagesRead` | JWT |

### VIP / 支付（5）

| 原路由 | 云函数 | 鉴权 |
|--------|--------|------|
| GET /api/vip/plans | `vip-getVipPlans` | JWT |
| POST /api/vip/orders | `vip-createVipOrder` | JWT |
| GET /api/vip/orders/:id | `vip-getVipOrder` | JWT |
| POST /api/vip/orders/:id/mock-pay | `vip-mockPayOrder` | JWT |
| POST /api/vip/payment/wechat-notify | `vip-wechatPayNotify` | 微信签名（HTTP 触发） |

### Upload（3）

| 原路由 | 云函数 | 方案 |
|--------|--------|------|
| POST /api/upload/avatar | `upload-uploadAvatar` | 云存储直传 + 返回 fileID |
| POST /api/upload/image | `upload-uploadImage` | 同上 |
| POST /api/upload/voice | `upload-uploadVoice` | 同上 |

## 部署步骤

### 1. 云数据库

1. 打开 [云开发控制台](https://console.cloud.tencent.com/tcb) → 数据库
2. 按 [cloud-database/SETUP.md](cloud-database/SETUP.md) 创建 7 个集合
3. 创建文档中列出的索引
4. 导入 [cloud-database/seed-vip-plans.json](cloud-database/seed-vip-plans.json) 到 `vip_plans` 集合
5. 粘贴 [cloud-database/security-rules.json](cloud-database/security-rules.json)

### 2. 云存储

创建目录前缀：`avatars/`、`images/`、`voices/`（首次上传时自动创建亦可）。

### 3. 环境变量（云函数配置）

在云开发控制台 → 云函数 → 环境变量中配置，模板见 [cloudfunctions/env.example](cloudfunctions/env.example)：

| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | JWT 密钥 |
| `JWT_EXPIRES_IN` | 默认 `7d` |
| `JWT_REFRESH_EXPIRES_IN` | 默认 `30d` |
| `WECHAT_APPID` | 小程序 AppID |
| `WECHAT_SECRET` | 小程序 Secret |
| `WECHAT_PAY_MODE` | `mock` 或 `live` |
| `WECHAT_PAY_MCHID` | 商户号 |
| `WECHAT_PAY_MERCHANT_SERIAL` | 商户证书序列号 |
| `WECHAT_PAY_API_V3_KEY` | APIv3 密钥（32 位） |
| `WECHAT_PAY_PRIVATE_KEY_PEM` | 商户私钥 PEM（`\n` 转义） |
| `WECHAT_PAY_NOTIFY_URL` | HTTP 云函数回调 URL |
| `WECHAT_PAY_PLATFORM_CERT_PEM` | 平台证书（live 验签） |
| `VIP_MOCK_PAY` | 开发模拟支付，设为 `1` |
| `SMS_DEMO_MODE` | 演示短信，固定 `888888` |
| `FACEID_DEMO_MODE` | 演示实名/人脸 |
| `NODE_ENV` | `development` / `production` |

### 4. 云函数 Layer

1. 执行 `scripts/package-common-layer.ps1` 生成 `common-layer.zip`
2. 控制台 → 云函数 → 层管理 → 新建层 `common-layer`
3. 运行时 Nodejs18.15，**挂载路径 `/opt`**
4. 业务函数内使用 `require('/opt/response')` 引用公共模块

### 5. 上传业务云函数

1. 微信开发者工具打开小程序项目
2. 关联云环境 `prod-love-app-d8gn9cxenfb74c1ac`
3. 将 `cloudfunctions/` 下各目录（如 `auth-register/`、`user-getMe/`）右键 → 上传并部署
4. 各业务函数关联 `common-layer`
5. `vip-wechatPayNotify` 需开启 **HTTP 访问服务**，将 URL 填入微信支付商户平台

详细分批清单见 [MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md)。

### 6. 前端切换

1. 复制 `longqingxu-frontend/.env.example` 为 `.env`
2. 设置 `VITE_USE_CLOUD=true`
3. 设置 `VITE_CLOUD_ENV=prod-love-app-d8gn9cxenfb74c1ac`
4. 重新编译小程序

## 前端改造清单

| 文件 | 改动 |
|------|------|
| `src/services/cloud.ts` | 云开发初始化 + `callCloud` |
| `src/services/cloud-api-map.ts` | 前缀云函数名映射表 |
| `src/services/api.ts` | 双模式路由（HTTP / 云函数） |
| `src/services/api-*.ts` | 各模块切换至 `callCloud` |
| `src/services/message-watch.ts` | 消息集合 watch（替代 Socket.IO） |
| `src/App.vue` | 启动时 `initCloud()` |

详见 [FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md)。

## 实时消息（WebSocket 替代）

NestJS 的 Socket.IO `/chat` 在小程序端改为：

1. 发消息：调用云函数 `chat-sendMessage`
2. 收消息：对 `messages` 集合 `watch({ conversationId })`

## 响应格式

与 Nest 保持一致：

```json
{
  "code": "SUCCESS",
  "message": "请求成功",
  "data": { },
  "timestamp": "2026-05-22T00:00:00.000Z"
}
```

## 分批迁移建议

| 批次 | 模块 | 验证点 |
|------|------|--------|
| 1 | Auth | 登录、注册、微信登录 |
| 2 | Users | 资料、推荐列表 |
| 3 | Matches | 滑卡、互粉 |
| 4 | Chat | 会话、消息、watch |
| 5 | VIP | 下单、支付回调 |
| 6 | Upload | 头像、语音 |

## 风险说明

- 云数据库无跨集合事务，互粉逻辑采用顺序写 + 补偿更新
- 推荐列表复杂筛选在内存中过滤，用户量大时需优化索引
- `bcryptjs` 替代 `bcrypt`（云函数兼容）
- 演示 SMS 验证码固定为 `888888`（`SMS_DEMO_MODE=1`）
- 控制台集合名若带 `dev_` 前缀，需与云函数代码统一

## 相关文档

| 文档 | 说明 |
|------|------|
| [MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md) | 分阶段执行计划与勾选清单 |
| [FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md) | 前端双模式改造与联调 |
| [THIRD_PARTY_SDK_INTEGRATION.md](THIRD_PARTY_SDK_INTEGRATION.md) | 第三方 SDK 接入（腾讯云 SMS + FaceID + 微信支付） |
| [cloudfunctions/README.md](cloudfunctions/README.md) | 云函数部署说明 |
| [cloudfunctions/DEPLOY_CHECKLIST.md](cloudfunctions/DEPLOY_CHECKLIST.md) | 上传检查清单 |
