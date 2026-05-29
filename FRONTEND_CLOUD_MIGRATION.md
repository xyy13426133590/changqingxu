# 长情许前端云开发迁移指南

> 本文档说明 `longqingxu-frontend` 如何从 NestJS HTTP + Socket.IO 切换为 **微信云函数 + 云数据库 watch**，并保留 **`VITE_USE_CLOUD` 双模式** 便于本地对照调试。  
> 云函数命名与仓库内 [`longqingxu-frontend/src/services/cloud-api-map.ts`](longqingxu-frontend/src/services/cloud-api-map.ts) **完全一致**（`auth-register`、`user-getMe`、`chat-sendMessage` 等前缀格式）。  
> 后端映射见 [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md)，第三方密钥见 [THIRD_PARTY_SDK_INTEGRATION.md](THIRD_PARTY_SDK_INTEGRATION.md)。

---

## 第 1 章：概述与迁移目标

### 1.1 改造前（Nest 模式）

| 能力 | 实现 |
|------|------|
| API | `uni.request` → `VITE_API_BASE_URL`（如 `http://host:3000/api`） |
| 鉴权 | Header `Authorization: Bearer <token>` |
| 实时消息 | Socket.IO `VITE_WS_BASE_URL` |
| 上传 | 后端 OSS 直传 |

### 1.2 改造后（云模式）

| 能力 | 实现 |
|------|------|
| API | `wx.cloud.callFunction` → 前缀云函数名 |
| 鉴权 | `event.token`（由 `callCloud` 自动注入） |
| 实时消息 | `messages` 集合 `watch`（`message-watch.ts`） |
| 上传 | `wx.cloud.uploadFile` + `upload-upload*` 云函数 |

### 1.3 核心原则

1. **页面与 Store 不感知云函数名**：仅调用 `api-auth.ts`、`api-user.ts` 等封装。
2. **一处映射**：所有云函数名集中在 `cloud-api-map.ts`。
3. **开关切换**：`VITE_USE_CLOUD=true` 时走云；`false` 时走原 REST，便于 H5 / 本地 Nest 联调。

---

## 第 2 章：双模式与环境变量

### 2.1 环境文件

复制 [`longqingxu-frontend/.env.example`](longqingxu-frontend/.env.example) 为 `.env`：

```bash
# 是否使用微信云函数（true = callFunction，false = NestJS HTTP）
VITE_USE_CLOUD=false

# 微信云环境 ID
VITE_CLOUD_ENV=prod-love-app-d8gn9cxenfb74c1ac

# 以下仅在 VITE_USE_CLOUD=false 时使用
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000/chat
VITE_UPLOAD_DOMAIN=https://changqingxu.oss-cn-beijing.aliyuncs.com
```

### 2.2 切换步骤

| 步骤 | 云模式 | Nest 模式 |
|------|--------|-----------|
| 1 | `VITE_USE_CLOUD=true` | `VITE_USE_CLOUD=false` |
| 2 | 配置 `VITE_CLOUD_ENV` | 配置 `VITE_API_BASE_URL` 等 |
| 3 | 微信开发者工具编译 **小程序** | H5 / 模拟器连本地后端 |
| 4 | 确认云函数已部署（见 DEPLOY_CHECKLIST） | 启动 Nest + MySQL |

### 2.3 编译注意

- `callCloud`、`initCloud`、`message-watch` 使用 `// #ifdef MP-WEIXIN`，**仅微信小程序**生效。
- H5 设 `VITE_USE_CLOUD=true` 会报错「云函数仅支持微信小程序端」——H5 应保留 `false` 或单独规划。

### 2.4 运行时读取

[`cloud.ts`](longqingxu-frontend/src/services/cloud.ts)：

```typescript
export const USE_CLOUD = import.meta.env.VITE_USE_CLOUD === 'true'
export const CLOUD_ENV = import.meta.env.VITE_CLOUD_ENV || 'prod-love-app-d8gn9cxenfb74c1ac'
```

所有 `api-*.ts` 通过 `USE_CLOUD` 分支，**不要**在页面里直接读 `import.meta.env`。

---

## 第 3 章：云初始化 `initCloud`

### 3.1 入口

[`App.vue`](longqingxu-frontend/src/App.vue) 在 `onLaunch` 调用：

```typescript
import { initCloud } from '@/services/cloud'

onLaunch(() => {
  initCloud()
  // ...
})
```

### 3.2 `initCloud` 行为

```typescript
export function initCloud(): void {
  if (!USE_CLOUD || cloudInitialized) return
  // #ifdef MP-WEIXIN
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({
      env: CLOUD_ENV,
      traceUser: true,
    })
    cloudInitialized = true
  }
  // #endif
}
```

### 3.3 验收

- [ ] 控制台无「云开发未初始化」报错
- [ ] `wx.cloud.callFunction` 可正常调用 `auth-login`
- [ ] 环境 ID 与控制台一致：`prod-love-app-d8gn9cxenfb74c1ac`

---

## 第 4 章：`cloud-api-map.ts` 映射表

### 4.1 文件职责

路径：`longqingxu-frontend/src/services/cloud-api-map.ts`  
导出 `CLOUD_API_MAP`：REST 语义键 → **微信云函数名字符串**（带模块前缀）。

### 4.2 完整映射（与仓库一致）

以下为当前仓库中的权威定义，文档与代码冲突时 **以本文件为准**：

```typescript
/**
 * REST 路径 → 云函数名映射表
 */
export const CLOUD_API_MAP = {
  auth: {
    register: 'auth-register',
    login: 'auth-login',
    smsLogin: 'auth-smsLogin',
    sendSms: 'auth-sendSms',
    wechatLogin: 'auth-wechatLogin',
    refreshToken: 'auth-refreshToken',
    realName: 'auth-realName',
    faceVerify: 'auth-faceVerify',
  },
  users: {
    getMe: 'user-getMe',
    updateProfile: 'user-updateProfile',
    updateFilters: 'user-updateFilters',
    getVipStatus: 'user-getVipStatus',
    getUserCard: 'user-getUserCard',
    getRecommendations: 'user-getRecommendations',
    getDailyRecommendations: 'user-getDailyRecommendations',
    getUserDetail: 'user-getUserDetail',
    reportUser: 'user-reportUser',
  },
  matches: {
    like: 'match-likeUser',
    pass: 'match-passUser',
    superLike: 'match-superLikeUser',
    mutual: 'match-getMutualMatches',
    resetSwipes: 'match-resetSwipeHistory',
  },
  conversations: {
    list: 'chat-getConversations',
    create: 'chat-createConversation',
    delete: 'chat-deleteConversation',
    togglePin: 'chat-togglePinConversation',
    messages: 'chat-getMessages',
  },
  messages: {
    send: 'chat-sendMessage',
    markRead: 'chat-markMessagesRead',
  },
  vip: {
    plans: 'vip-getVipPlans',
    createOrder: 'vip-createVipOrder',
    getOrder: 'vip-getVipOrder',
    mockPay: 'vip-mockPayOrder',
  },
  upload: {
    avatar: 'upload-uploadAvatar',
    image: 'upload-uploadImage',
    voice: 'upload-uploadVoice',
  },
} as const
```

### 4.3 类型导出

同文件导出 `CloudFunctionName` 联合类型，供需要强类型的封装使用。

### 4.4 未纳入 MAP 的函数

| 云函数 | 说明 |
|--------|------|
| `vip-wechatPayNotify` | 微信支付服务器 HTTP 回调，非小程序调用 |

新增接口时：**先**在云端创建 `module-action` 目录，**再**在此表与对应 `api-*.ts` 增加一项。

---

## 第 5 章：`callCloud` 与 `api-*` 改造模式

### 5.1 `callCloud` 契约

```typescript
export function callCloud<T>(
  name: string,                              // 如 CLOUD_API_MAP.auth.login
  data: Record<string, unknown> = {},
  options: { skipAuth?: boolean } = {},
): Promise<T>
```

行为摘要：

1. 非云模式：reject `VITE_USE_CLOUD 未启用`。
2. 自动附加 `token`（除非 `skipAuth: true`）。
3. 解析 `res.result` 为 `ApiResponse<T>`；`code === 'SUCCESS'` 时返回 `data`。
4. `UNAUTHORIZED` / 401：清 token 并 `reLaunch` 登录页。

### 5.2 标准 `api-*` 模板

以 [`api-auth.ts`](longqingxu-frontend/src/services/api-auth.ts) 为例：

```typescript
import { post, setToken } from './api'
import { USE_CLOUD, callCloud } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

export async function apiRegister(params: {
  phone: string
  password: string
  nickname: string
  code?: string
}): Promise<AuthResponse> {
  if (USE_CLOUD) {
    const data = await callCloud<AuthResponse>(
      CLOUD_API_MAP.auth.register,
      params,
      { skipAuth: true },
    )
    return saveAuthResponse(data)
  }
  const data = await post<AuthResponse>('/auth/register', params)
  return saveAuthResponse(data)
}
```

### 5.3 鉴权分类

| 类型 | `skipAuth` | 示例 |
|------|------------|------|
| 公开 | `true` | `auth-register`、`auth-login`、`auth-sendSms` |
| 需登录 | 默认 `false` | `user-getMe`、`chat-sendMessage` |

### 5.4 已改造服务文件

| 文件 | 模块 | 使用的 MAP 键 |
|------|------|----------------|
| `api-auth.ts` | 认证 | `auth.*` |
| `api-user.ts` | 用户 | `users.*` |
| `api-match.ts` | 滑卡 | `matches.*` |
| `api-conversation.ts` | 会话/消息 | `conversations.*`、`messages.*` |
| `api-vip.ts` | VIP | `vip.*` |
| `api-upload.ts` | 上传 | `upload.*` |

页面 **禁止** 写 `callCloud('getMe')` 等无前缀旧名。

### 5.5 参数差异注意

| API | 云模式 event | REST |
|-----|--------------|------|
| 用户详情 | `{ userId }` 或 `{ id }` | `GET /users/:id` |
| VIP 订单 | `{ orderId }` | `GET /orders/:id` |
| 人脸核验 | `{ action, bizToken }` | 旧版可能用 `faceImage` |

以各 `api-*.ts` 内传参为准。

### 5.6 上传双模式

云模式流程：

1. `cloudUploadFile(cloudPath, localPath)` → `fileID`
2. `callCloud(CLOUD_API_MAP.upload.avatar, { fileID, ext })` → 业务 URL

Nest 模式仍走 `post('/upload/avatar', formData)` 与 OSS 域名拼接。

---

## 第 6 章：实时消息 `message-watch`

### 6.1 背景

Nest 使用 Socket.IO namespace `/chat`。云模式改为监听云数据库 `messages` 集合。

### 6.2 API

文件：[`message-watch.ts`](longqingxu-frontend/src/services/message-watch.ts)

```typescript
import { USE_CLOUD, CLOUD_ENV } from './cloud'

export function startMessageWatch(
  conversationId: string,
  onNewMessage: (message: Message) => void,
): void

export function stopMessageWatch(): void
```

### 6.3 使用方式（聊天页）

```typescript
import { startMessageWatch, stopMessageWatch } from '@/services/message-watch'
import { apiSendMessage } from '@/services/api-conversation'

// onLoad / 进入会话
startMessageWatch(conversationId, (msg) => {
  // 追加到列表
})

// onUnload
stopMessageWatch()

// 发送仍走 API 封装
await apiSendMessage({ conversationId, content, type: 'text' })
// 云模式下内部 → callCloud(CLOUD_API_MAP.messages.send, ...) → chat-sendMessage
```

### 6.4 与云函数配合

| 操作 | 云函数名 |
|------|----------|
| 发送 | `chat-sendMessage` |
| 历史 | `chat-getMessages` |
| 已读 | `chat-markMessagesRead` |

### 6.5 验收

- [ ] A 发消息，B 页面 watch 收到（无需 Socket）
- [ ] 离开会话 `stopMessageWatch`，无重复监听
- [ ] `VITE_USE_CLOUD=false` 时仍用原 WebSocket（若已实现）

---

## 第 7 章：REST → 云函数对照表（前缀名）

> 第三列为 `CLOUD_API_MAP` 或云函数名字符串；与 [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md) 一致。

### 7.1 Auth

| REST | 方法 | 云函数名 |
|------|------|----------|
| `/auth/register` | POST | `auth-register` |
| `/auth/login` | POST | `auth-login` |
| `/auth/sms-login` | POST | `auth-smsLogin` |
| `/auth/send-sms` | POST | `auth-sendSms` |
| `/auth/wechat-login` | POST | `auth-wechatLogin` |
| `/auth/refresh-token` | POST | `auth-refreshToken` |
| `/auth/real-name` | POST | `auth-realName` |
| `/auth/face-verify` | POST | `auth-faceVerify` |

### 7.2 Users

| REST | 方法 | 云函数名 |
|------|------|----------|
| `/users/me` | GET | `user-getMe` |
| `/users/me` | PUT | `user-updateProfile` |
| `/users/me/filters` | PUT | `user-updateFilters` |
| `/users/me/vip` | GET | `user-getVipStatus` |
| `/users/me/card` | GET | `user-getUserCard` |
| `/users/recommendations` | GET | `user-getRecommendations` |
| `/users/daily` | GET | `user-getDailyRecommendations` |
| `/users/:id` | GET | `user-getUserDetail` |
| `/users/:id/report` | POST | `user-reportUser` |

### 7.3 Matches

| REST | 方法 | 云函数名 |
|------|------|----------|
| `/matches/like` | POST | `match-likeUser` |
| `/matches/pass` | POST | `match-passUser` |
| `/matches/super-like` | POST | `match-superLikeUser` |
| `/matches/mutual` | GET | `match-getMutualMatches` |
| `/matches/reset-swipes` | POST | `match-resetSwipeHistory` |

### 7.4 Conversations & Messages

| REST | 方法 | 云函数名 |
|------|------|----------|
| `/conversations` | GET | `chat-getConversations` |
| `/conversations` | POST | `chat-createConversation` |
| `/conversations/:id` | DELETE | `chat-deleteConversation` |
| `/conversations/:id/top` | PUT | `chat-togglePinConversation` |
| `/conversations/:id/messages` | GET | `chat-getMessages` |
| `/messages` | POST | `chat-sendMessage` |
| `/messages/read` | PUT | `chat-markMessagesRead` |

### 7.5 VIP

| REST | 方法 | 云函数名 |
|------|------|----------|
| `/vip/plans` | GET | `vip-getVipPlans` |
| `/vip/orders` | POST | `vip-createVipOrder` |
| `/vip/orders/:id` | GET | `vip-getVipOrder` |
| `/vip/orders/:id/mock-pay` | POST | `vip-mockPayOrder` |
| `/vip/payment/wechat-notify` | POST | `vip-wechatPayNotify`（HTTP，非前端） |

### 7.6 Upload

| REST | 方法 | 云函数名 |
|------|------|----------|
| `/upload/avatar` | POST | `upload-uploadAvatar` |
| `/upload/image` | POST | `upload-uploadImage` |
| `/upload/voice` | POST | `upload-uploadVoice` |

---

## 第 8 章：联调检查清单

### 8.1 工程配置

- [ ] `.env` 中 `VITE_USE_CLOUD=true`、`VITE_CLOUD_ENV` 正确
- [ ] `App.vue` 已调用 `initCloud()`
- [ ] 微信开发者工具已关联云环境
- [ ] `cloud-api-map.ts` 中名称与云端函数目录一致（带 `auth-`、`user-` 等前缀）

### 8.2 分模块验收

| 批次 | 前端 API | 云函数 | 验证点 |
|------|----------|--------|--------|
| 1 | `apiRegister` / `apiLogin` / `apiSendSms` | `auth-*` | token 落库、短信 888888（演示） |
| 2 | `apiGetMe` / 资料编辑 | `user-*` | 资料读写 |
| 3 | `apiLikeUser` 等 | `match-*` | 互粉列表 |
| 4 | `apiSendMessage` + watch | `chat-*` | 实时收消息 |
| 5 | 头像上传 | `upload-uploadAvatar` | 头像显示 |
| 6 | VIP 页 | `vip-createVipOrder`、`vip-mockPayOrder` | mock 支付 |

### 8.3 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `FunctionName parameter could not be found` | 云端仍是旧名 `login` | 部署 `auth-login` 并删旧函数 |
| `Cannot find module '/opt/response'` | Layer 未挂载或路径错误 | 挂载 `/opt`，非 `/opt/common` |
| 云函数无响应 | 未 init 或环境 ID 错误 | 检查 `initCloud` 与 `VITE_CLOUD_ENV` |
| 401 循环跳转 | token 过期 | `auth-refreshToken` 或重新登录 |
| H5 报仅支持小程序 | 正常限制 | H5 用 `VITE_USE_CLOUD=false` |

### 8.4 上线前

- [ ] 体验版/正式版构建使用 `VITE_USE_CLOUD=true`
- [ ] 关闭前端 `.env` 中的测试 Secret（本不应存在）
- [ ] 与 [MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md) Phase 8 切流项对齐
- [ ] 生产关闭 `SMS_DEMO_MODE`、`VIP_MOCK_PAY`（云函数侧，见第三方文档）

### 8.5 相关文件速查

```
longqingxu-frontend/
  .env.example
  src/
    App.vue                 # initCloud()
    services/
      cloud.ts              # USE_CLOUD, callCloud, cloudUploadFile
      cloud-api-map.ts      # CLOUD_API_MAP（前缀云函数名）
      message-watch.ts      # messages watch
      api.ts                # HTTP 基础（Nest 模式）
      api-auth.ts
      api-user.ts
      api-match.ts
      api-conversation.ts
      api-vip.ts
      api-upload.ts
```

---

## 附录 A：`callCloud` 与响应示例

请求（内部）：

```javascript
wx.cloud.callFunction({
  name: 'user-getMe',
  data: { token: '<accessToken>' },
})
```

成功响应 `result`：

```json
{
  "code": "SUCCESS",
  "message": "请求成功",
  "data": { "id": "...", "nickname": "..." },
  "timestamp": "2026-05-26T00:00:00.000Z"
}
```

`callCloud` 仅向业务代码返回 `data` 部分。

---

## 附录 B：从旧无前缀名迁移

若本地仍引用 `register`、`sendMessage` 等：

1. 全局替换为 `CLOUD_API_MAP` 对应值。
2. 微信控制台删除旧函数，保留 [DEPLOY_CHECKLIST.md](cloudfunctions/DEPLOY_CHECKLIST.md) 中 37 个前缀函数。
3. 参考 `scripts/restore-cloudfunctions.js` 中的 `RENAME_MAP` 对照。

---

## 附录 C：文档索引

| 文档 | 用途 |
|------|------|
| [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md) | 服务端 37 接口映射与部署 |
| [THIRD_PARTY_SDK_INTEGRATION.md](THIRD_PARTY_SDK_INTEGRATION.md) | SMS / FaceID / 微信支付 |
| [MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md) | 分阶段勾选 |
| [cloudfunctions/DEPLOY_CHECKLIST.md](cloudfunctions/DEPLOY_CHECKLIST.md) | 云函数上传清单 |

---

*本文档与 `cloud-api-map.ts` 前缀命名同步维护。*
