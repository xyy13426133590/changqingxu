# 长情许 · 云函数功能清单

> 命名规范：`{模块前缀}-{功能名}`，例如 `auth-smsLogin`  
> 公共层：`common/` 部署为 Layer `common-layer`，挂载路径 **`/opt`**  
> 数据库集合名见 [`common/constants.js`](common/constants.js)

---

## 公共层 common（非业务云函数）

| 路径 | 说明 |
|------|------|
| `common/auth.js` | JWT 签发与鉴权（`requireAuth` / `generateTokens`） |
| `common/constants.js` | 全局常量（验证码、集合名、推荐数量等） |
| `common/db.js` | 云数据库实例 |
| `common/response.js` | 统一响应封装（`wrapHandler`） |
| `common/lib/users.js` | 用户查询、推荐列表、卡片格式化 |
| `common/lib/matches.js` | 滑卡/喜欢/超级喜欢/互粉逻辑 |
| `common/lib/conversations.js` | 会话创建、列表 enrichment |
| `common/lib/vip.js` | VIP 订单支付完成处理 |
| `common/lib/auth-helper.js` | 注册写用户、短信验证码校验 |

---

## auth- 认证（8 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `auth-register` | 手机号 + 密码 + 昵称注册 | 否 |
| `auth-login` | 手机号 + 密码登录 | 否 |
| `auth-smsLogin` | 验证码登录（无账号则自动注册） | 否 |
| `auth-sendSms` | 发送短信验证码（演示码 `888888`） | 否 |
| `auth-wechatLogin` | 微信小程序 code 换 openid 登录 | 否 |
| `auth-refreshToken` | 刷新 accessToken | 否（需 refreshToken） |
| `auth-realName` | 提交实名信息（姓名 + 身份证号） | 是 |
| `auth-faceVerify` | 人脸核身（演示模式可跳过真实核验） | 是 |

---

## user- 用户资料 / 推荐（9 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `user-getMe` | 获取当前登录用户完整资料 | 是 |
| `user-updateProfile` | 更新个人资料（昵称、头像、简介等） | 是 |
| `user-updateFilters` | 更新推荐筛选条件 | 是 |
| `user-getVipStatus` | 查询当前用户 VIP 状态与到期时间 | 是 |
| `user-getUserCard` | 获取当前用户对外展示卡片 | 是 |
| `user-getRecommendations` | 发现页推荐列表（分页，含筛选与滑卡排除） | 是 |
| `user-getDailyRecommendations` | 每日推荐横滑列表 | 是 |
| `user-getUserDetail` | 查看指定用户详情卡片 | 是 |
| `user-reportUser` | 举报用户 | 是 |

---

## match- 滑卡 / 匹配（5 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `match-likeUser` | 喜欢（右滑） | 是 |
| `match-passUser` | 跳过（左滑 / 不喜欢） | 是 |
| `match-superLikeUser` | 超级喜欢 | 是 |
| `match-getMutualMatches` | 获取互相关注（互粉）列表 | 是 |
| `match-resetSwipeHistory` | 清空当前用户滑卡记录，恢复推荐 | 是 |

---

## chat- 会话 / 消息（7 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `chat-getConversations` | 会话列表（含未读数、最后一条消息） | 是 |
| `chat-createConversation` | 与指定用户创建或获取会话 | 是 |
| `chat-deleteConversation` | 删除会话及关联消息 | 是 |
| `chat-togglePinConversation` | 置顶 / 取消置顶会话 | 是 |
| `chat-getMessages` | 分页获取会话消息记录 | 是 |
| `chat-sendMessage` | 发送文字 / 图片 / 语音等消息 | 是 |
| `chat-markMessagesRead` | 标记会话消息已读 | 是 |

---

## vip- 会员 / 支付（5 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `vip-getVipPlans` | 获取 VIP 套餐列表 | 是 |
| `vip-createVipOrder` | 创建 VIP 购买订单 | 是 |
| `vip-getVipOrder` | 查询订单详情与支付状态 | 是 |
| `vip-mockPayOrder` | 演示环境模拟支付成功 | 是 |
| `vip-wechatPayNotify` | 微信支付结果回调（HTTP 触发，非小程序 callFunction） | 否 |

---

## upload- 云存储上传（4 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `upload-uploadAvatar` | 上传头像，返回可访问 URL | 是 |
| `upload-uploadImage` | 上传图片（动态、聊天等） | 是 |
| `upload-uploadVoice` | 上传语音消息 | 是 |
| `upload-uploadVideo` | 上传短视频（≤60 秒） | 是 |

---

## moment- 动态 / 圈子（6 个）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `moment-listFeed` | 动态流列表（支持圈子、可见性过滤） | 可选 |
| `moment-createPost` | 发布动态（文字 / 图片 / 视频） | 是 |
| `moment-deletePost` | 删除自己的动态 | 是 |
| `moment-toggleLike` | 点赞 / 取消点赞 | 是 |
| `moment-listComments` | 某条动态的评论列表 | 否 |
| `moment-createComment` | 发表评论 | 是 |

---

## dev- 开发辅助（2 个，仅开发/演示）

| 云函数 | 功能说明 | 是否需要登录 |
|--------|----------|--------------|
| `dev-seedUsers` | 向 `dev_users` 批量写入演示用户 | 否 |
| `dev-diagnoseDiscover` | 诊断推荐数据（集合统计、可推荐人数） | 可选 |

---

## 云数据库集合对照

| 集合名 | 用途 |
|--------|------|
| `dev_users` | 用户资料 |
| `dev_matches` | 滑卡 / 喜欢 / 互粉记录 |
| `dev_conversations` | 聊天会话 |
| `dev_messages` | 聊天消息 |
| `dev_sms_codes` | 短信验证码 |
| `dev_vip_orders` | VIP 订单 |
| `dev_vip_plans` | VIP 套餐 |
| `moment_posts` | 动态帖子 |
| `moment_comments` | 动态评论 |
| `moment_likes` | 动态点赞 |
| `circles` | 圈子（预留） |

---

## 统计

| 模块 | 数量 |
|------|------|
| auth | 8 |
| user | 9 |
| match | 5 |
| chat | 7 |
| vip | 5 |
| upload | 4 |
| moment | 6 |
| dev | 2 |
| **业务云函数合计** | **46** |

---

## 相关文档

- [README.md](README.md) — 部署说明与 Layer 配置
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) — 部署勾选清单
- [FUNCTION_ENV_VARIABLES.md](FUNCTION_ENV_VARIABLES.md) — 环境变量配置
- [env.example](env.example) — 环境变量模板
