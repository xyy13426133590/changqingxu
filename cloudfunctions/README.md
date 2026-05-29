# 长情许云函数部署说明

## 目录

- `common/` — 公共层，需先部署为 **云函数 Layer**（名称建议 `common-layer`）
- 其余目录 — 各业务云函数，命名 **`{模块前缀}-{函数名}`**

## 命名规范

| 前缀 | 模块 | 示例 |
|------|------|------|
| `auth-` | 认证 | `auth-register`、`auth-wechatLogin` |
| `user-` | 用户资料/推荐 | `user-getMe`、`user-updateProfile` |
| `match-` | 滑卡/互粉 | `match-likeUser`、`match-getMutualMatches` |
| `chat-` | 会话/消息 | `chat-sendMessage`、`chat-getConversations` |
| `vip-` | VIP/支付 | `vip-createVipOrder`、`vip-wechatPayNotify` |
| `upload-` | 云存储 | `upload-uploadAvatar` |

## 部署顺序

1. 创建云数据库集合（见 [../cloud-database/SETUP.md](../cloud-database/SETUP.md)）
2. 配置环境变量（见 [../CLOUD_MIGRATION.md](../CLOUD_MIGRATION.md) 与 [env.example](env.example)）
3. 打包 Layer：执行 [../scripts/package-common-layer.ps1](../scripts/package-common-layer.ps1)
4. 上传 `common/` 为 Layer `common-layer`，**挂载路径 `/opt`**
5. 按 [../MIGRATION_EXECUTION_PLAN.md](../MIGRATION_EXECUTION_PLAN.md) 分批上传业务函数
6. `vip-wechatPayNotify` 开启 HTTP 访问服务

## 引用公共层

业务函数使用 Layer 绝对路径：

```javascript
const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { getUserById } = require('/opt/lib/users')
```

`common/` 内部模块仍用相对路径；打包进 Layer 后互相引用不变。

## 云函数列表（37）

| 模块 | 云函数名 |
|------|----------|
| Auth | auth-register, auth-login, auth-smsLogin, auth-sendSms, auth-wechatLogin, auth-refreshToken, auth-realName, auth-faceVerify |
| Users | user-getMe, user-updateProfile, user-updateFilters, user-getVipStatus, user-getUserCard, user-getRecommendations, user-getDailyRecommendations, user-getUserDetail, user-reportUser |
| Matches | match-likeUser, match-passUser, match-superLikeUser, match-getMutualMatches, match-resetSwipeHistory |
| Chat | chat-getConversations, chat-createConversation, chat-deleteConversation, chat-togglePinConversation, chat-getMessages, chat-sendMessage, chat-markMessagesRead |
| VIP | vip-getVipPlans, vip-createVipOrder, vip-getVipOrder, vip-mockPayOrder, vip-wechatPayNotify |
| Upload | upload-uploadAvatar, upload-uploadImage, upload-uploadVoice |

## 注意事项

- 运行时 **Node.js 18.15**
- Layer 挂载路径必须为 **`/opt`**（不是 `/opt/common`）
- 密码哈希使用 `bcryptjs`（非 bcrypt 原生模块）
- 演示模式：`SMS_DEMO_MODE=1` 固定验证码 `888888`；`FACEID_DEMO_MODE=1` 跳过真实核验
- 生产：关闭上述 DEMO 开关并配置腾讯云 SMS / FaceID（见 [../THIRD_PARTY_SDK_INTEGRATION.md](../THIRD_PARTY_SDK_INTEGRATION.md)）
