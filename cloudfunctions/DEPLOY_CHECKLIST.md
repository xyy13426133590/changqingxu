# 云端部署清单（前缀命名后）

Layer 挂载路径：**`/opt`**。每个业务函数需关联 Layer `common-layer`。

## 全部 37 个云函数

### auth-（8）

- [ ] auth-register
- [ ] auth-login
- [ ] auth-smsLogin
- [ ] auth-sendSms
- [ ] auth-wechatLogin
- [ ] auth-refreshToken
- [ ] auth-realName
- [ ] auth-faceVerify

### user-（9）

- [ ] user-getMe
- [ ] user-updateProfile
- [ ] user-updateFilters
- [ ] user-getVipStatus
- [ ] user-getUserCard
- [ ] user-getRecommendations
- [ ] user-getDailyRecommendations
- [ ] user-getUserDetail
- [ ] user-reportUser

### match-（5）

- [ ] match-likeUser
- [ ] match-passUser
- [ ] match-superLikeUser
- [ ] match-getMutualMatches
- [ ] match-resetSwipeHistory

### chat-（7）

- [ ] chat-getConversations
- [ ] chat-createConversation
- [ ] chat-deleteConversation
- [ ] chat-togglePinConversation
- [ ] chat-getMessages
- [ ] chat-sendMessage
- [ ] chat-markMessagesRead

### vip-（5）

- [ ] vip-getVipPlans
- [ ] vip-createVipOrder
- [ ] vip-getVipOrder
- [ ] vip-mockPayOrder
- [ ] vip-wechatPayNotify（需 HTTP 访问）

### upload-（3）

- [ ] upload-uploadAvatar
- [ ] upload-uploadImage
- [ ] upload-uploadVoice

## 可删除的旧名函数（若云端仍存在）

上传新函数并验证通过后，删除无 `auth-` / `user-` 等前缀的旧函数，例如：`register`、`getMe`、`sendMessage`、`wechatPayNotify`。
