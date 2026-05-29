# 37 个云函数环境变量配置清单

本文档用于在云开发控制台统一配置环境变量，并明确每个云函数实际依赖哪些变量。

## 1. 全局环境变量字典

以下变量来自 `cloudfunctions/env.example` 与 `cloudfunctions/common/*` 实际代码读取：

- `JWT_SECRET`：JWT 签名密钥（鉴权必需）
- `JWT_EXPIRES_IN`：Access Token 有效期（默认 `7d`）
- `JWT_REFRESH_EXPIRES_IN`：Refresh Token 有效期（默认 `30d`）
- `WECHAT_APPID`：小程序 AppID（微信登录、微信支付使用）
- `WECHAT_SECRET`：小程序 Secret（微信登录使用）
- `NODE_ENV`：运行环境（`vip-mockPayOrder` 使用）
- `VIP_MOCK_PAY`：是否允许模拟支付（`vip-mockPayOrder` 使用）
- `WECHAT_PAY_MODE`：支付模式（`mock` / `live`）
- `WECHAT_PAY_MCHID`：微信支付商户号（live）
- `WECHAT_PAY_MERCHANT_SERIAL`：商户证书序列号（live）
- `WECHAT_PAY_API_V3_KEY`：APIv3 密钥（32 位，live 回调解密必需）
- `WECHAT_PAY_PRIVATE_KEY_PEM`：商户私钥 PEM（`\n` 转义，live）
- `WECHAT_PAY_NOTIFY_URL`：支付回调地址（live）
- `WECHAT_PAY_PLATFORM_CERT_PEM`：微信平台证书（live 验签，建议配置）
- `SMS_DEMO_MODE`：短信演示模式（`1/true` 为演示）
- `TENCENT_SECRET_ID`：腾讯云 API 密钥 ID（短信/FaceID 生产）
- `TENCENT_SECRET_KEY`：腾讯云 API 密钥 Key（短信/FaceID 生产）
- `SMS_SDK_APP_ID`：短信应用 ID（生产）
- `SMS_SIGN_NAME`：短信签名（生产）
- `SMS_TEMPLATE_ID`：短信模板 ID（生产）
- `SMS_REGION`：短信地域（默认 `ap-guangzhou`）
- `FACEID_DEMO_MODE`：人脸核身演示模式（`1/true` 为演示）
- `FACEID_RULE_ID_REALNAME`：实名规则 ID（生产）
- `FACEID_RULE_ID_LIVENESS`：活体规则 ID（生产）
- `FACEID_REGION`：FaceID 地域（可选）
- `FACEID_REDIRECT_URL`：活体核身回跳地址（可选，默认 `https://www.qq.com`）

说明：`FACEID_MERCHANT_ID` 在 `env.example` 中存在，但当前代码未读取，不属于本清单的函数必需项。

## 2. 37 个云函数逐个配置清单

标记说明：

- `Demo`：演示/联调模式最小变量集
- `生产增量`：从 Demo 切生产时额外补齐

### A. auth（8 个）

1. `auth-register`
   - Demo：`JWT_SECRET`
   - 生产增量：建议补齐 `JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`

2. `auth-login`
   - Demo：`JWT_SECRET`
   - 生产增量：建议补齐 `JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`

3. `auth-smsLogin`
   - Demo：`JWT_SECRET`
   - 生产增量：建议补齐 `JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`

4. `auth-sendSms`
   - Demo：`SMS_DEMO_MODE`
   - 生产增量：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`SMS_SDK_APP_ID`、`SMS_SIGN_NAME`、`SMS_TEMPLATE_ID`、`SMS_REGION`

5. `auth-wechatLogin`
   - Demo：`WECHAT_APPID`、`WECHAT_SECRET`、`JWT_SECRET`
   - 生产增量：建议补齐 `JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`

6. `auth-refreshToken`
   - Demo：`JWT_SECRET`
   - 生产增量：`JWT_EXPIRES_IN`（建议同时配置 `JWT_REFRESH_EXPIRES_IN` 供其他登录函数统一）

7. `auth-realName`
   - Demo：`JWT_SECRET`、`FACEID_DEMO_MODE`
   - 生产增量：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`FACEID_RULE_ID_REALNAME`、`FACEID_REGION`

8. `auth-faceVerify`
   - Demo：`JWT_SECRET`、`FACEID_DEMO_MODE`
   - 生产增量：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`FACEID_RULE_ID_REALNAME`、`FACEID_RULE_ID_LIVENESS`、`FACEID_REGION`、`FACEID_REDIRECT_URL`

### B. user（9 个）

以下函数均通过 `/opt/auth` 鉴权，最小必需：`JWT_SECRET`。

1. `user-getMe`
2. `user-updateProfile`
3. `user-updateFilters`
4. `user-getVipStatus`
5. `user-getUserCard`
6. `user-getRecommendations`
7. `user-getDailyRecommendations`
8. `user-reportUser`
9. `user-getUserDetail`

生产建议统一补齐：`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`（与登录签发策略一致）。

### C. match（5 个）

以下函数均通过 `/opt/auth` 鉴权，最小必需：`JWT_SECRET`。

1. `match-likeUser`
2. `match-passUser`
3. `match-superLikeUser`
4. `match-getMutualMatches`
5. `match-resetSwipeHistory`

生产建议统一补齐：`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`。

### D. chat（7 个）

以下函数均通过 `/opt/auth` 鉴权，最小必需：`JWT_SECRET`。

1. `chat-getConversations`
2. `chat-createConversation`
3. `chat-deleteConversation`
4. `chat-togglePinConversation`
5. `chat-getMessages`
6. `chat-sendMessage`
7. `chat-markMessagesRead`

生产建议统一补齐：`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`。

### E. upload（3 个）

以下函数均通过 `/opt/auth` 鉴权，最小必需：`JWT_SECRET`。

1. `upload-uploadAvatar`
2. `upload-uploadImage`
3. `upload-uploadVoice`

生产建议统一补齐：`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`。

### F. vip（5 个）

1. `vip-getVipPlans`
   - Demo：`JWT_SECRET`
   - 生产增量：建议补齐 `JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`

2. `vip-getVipOrder`
   - Demo：`JWT_SECRET`
   - 生产增量：建议补齐 `JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`

3. `vip-mockPayOrder`
   - Demo：`JWT_SECRET`、`NODE_ENV`、`VIP_MOCK_PAY`
   - 生产增量：无（生产通常设置 `VIP_MOCK_PAY=0`，并改用真实支付）

4. `vip-createVipOrder`
   - Demo：`JWT_SECRET`、`WECHAT_PAY_MODE`（通常 `mock`）
   - 生产增量：`WECHAT_PAY_MODE=live`、`WECHAT_PAY_MCHID`、`WECHAT_PAY_MERCHANT_SERIAL`、`WECHAT_PAY_API_V3_KEY`、`WECHAT_PAY_PRIVATE_KEY_PEM`、`WECHAT_PAY_NOTIFY_URL`、`WECHAT_APPID`，建议同时配置 `WECHAT_PAY_PLATFORM_CERT_PEM`

5. `vip-wechatPayNotify`
   - Demo：`WECHAT_PAY_MODE`（`mock`）
   - 生产增量：`WECHAT_PAY_MODE=live`、`WECHAT_PAY_API_V3_KEY`，建议配置 `WECHAT_PAY_PLATFORM_CERT_PEM`（开启回调验签）

## 3. 一次性配置建议（按阶段）

### Phase 0（基础必配）

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `WECHAT_APPID`
- `WECHAT_SECRET`
- `NODE_ENV`

### Phase 6（VIP 支付）

- `WECHAT_PAY_MODE`
- `VIP_MOCK_PAY`
- 生产 live 再补：`WECHAT_PAY_MCHID`、`WECHAT_PAY_MERCHANT_SERIAL`、`WECHAT_PAY_API_V3_KEY`、`WECHAT_PAY_PRIVATE_KEY_PEM`、`WECHAT_PAY_NOTIFY_URL`、`WECHAT_PAY_PLATFORM_CERT_PEM`

### Phase 7（短信 + FaceID）

- `SMS_DEMO_MODE`
- `FACEID_DEMO_MODE`
- 生产再补：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`SMS_SDK_APP_ID`、`SMS_SIGN_NAME`、`SMS_TEMPLATE_ID`、`SMS_REGION`、`FACEID_RULE_ID_REALNAME`、`FACEID_RULE_ID_LIVENESS`、`FACEID_REGION`、`FACEID_REDIRECT_URL`

## 4. 控制台配置注意事项

- 所有 Secret 仅配置在“云函数环境变量”，不要放前端 `.env`。
- `WECHAT_PAY_PRIVATE_KEY_PEM`、`WECHAT_PAY_PLATFORM_CERT_PEM` 需将换行写成 `\\n`。
- 切 `live` 前请先确保 `vip-wechatPayNotify` HTTP 访问地址已配置到 `WECHAT_PAY_NOTIFY_URL`，且微信商户平台回调地址一致。
