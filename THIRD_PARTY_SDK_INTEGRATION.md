# 长情许第三方 SDK 接入指南

> 本文档说明如何在微信云开发环境下接入 **腾讯云短信（SMS）**、**腾讯云人脸核身（FaceID）** 与 **微信支付（JSAPI / APIv3）**。  
> 云函数已采用 **`{模块前缀}-{函数名}`** 命名，公共工具位于 `cloudfunctions/common/utils/`。  
> 配套文档：[CLOUD_MIGRATION.md](CLOUD_MIGRATION.md)、[FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md)、[MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md)。

---

## 1. 文档范围与前置条件

| 项 | 说明 |
|----|------|
| 云环境 ID | `cloud1-d6g7211of923bfddc` |
| 运行时 | Node.js 18.15 |
| Layer | `common-layer` 挂载路径 **`/opt`** |
| 密钥存放 | 仅云函数环境变量，**禁止**写入前端或 Git |

**前置条件：**

1. Phase 0 已完成：7 个云数据库集合、JWT、`WECHAT_APPID` / `WECHAT_SECRET` 已配置。
2. 业务云函数已按 [cloudfunctions/DEPLOY_CHECKLIST.md](cloudfunctions/DEPLOY_CHECKLIST.md) 上传，且均关联 `common-layer`。
3. 前端已能调用 `auth-wechatLogin` 并绑定 `wechatOpenid`（VIP 真实支付依赖此项）。

---

## 2. 架构原则

### 2.1 密钥不下沉

所有 `TENCENT_SECRET_*`、`WECHAT_PAY_*`、`FACEID_*` 仅在 **云开发控制台 → 云函数 → 环境变量** 配置。小程序端只调用云函数，不持有 Secret。

### 2.2 逻辑集中在 Layer

第三方 SDK 封装位于公共层，业务函数通过 Layer 引用：

```
cloudfunctions/
  common/
    utils/
      tencent-sms.js    → require('/opt/utils/tencent-sms')
      faceid.js         → require('/opt/utils/faceid')
      wechat-pay.js     → require('/opt/utils/wechat-pay')
  auth-sendSms/         → 发短信 + 写 sms_codes
  auth-realName/        → 二要素实名
  auth-faceVerify/      → 活体 BizToken / 结果确认
  auth-wechatLogin/     → openid（支付前置）
  vip-createVipOrder/   → 下单 + prepay 参数
  vip-wechatPayNotify/  → HTTP 支付回调
  vip-mockPayOrder/     → 开发模拟支付
  upload-uploadAvatar/  → 云存储 fileID 换 URL
  upload-uploadImage/
  upload-uploadVoice/
```

业务函数 **不** 直接 `npm install tencentcloud-sdk-nodejs`；依赖打在 `common/package.json`，随 Layer 发布。

### 2.3 演示模式与生产模式自动降级

| 开关 | 行为 |
|------|------|
| `SMS_DEMO_MODE=1` 或未配置 SMS 密钥 | `auth-sendSms` 固定验证码 `888888`，响应可带 `code` |
| `FACEID_DEMO_MODE=1` 或未配置 FaceID | `auth-realName` / `auth-faceVerify` 跳过真实核验 |
| `WECHAT_PAY_MODE=mock` 或 live 配置不全 | `vip-createVipOrder` 返回 `paymentMode: 'mock'` |

生产上线前须逐项关闭演示开关并补齐密钥（见第 8 节对照表）。

### 2.4 响应格式统一

与 NestJS 一致，经 `wrapHandler` 包装：

```json
{
  "code": "SUCCESS",
  "message": "请求成功",
  "data": { },
  "timestamp": "2026-05-22T00:00:00.000Z"
}
```

`vip-wechatPayNotify` 为 HTTP 触发，返回微信要求的 `{ code, message }`，不走 `wrapHandler`。

---

## 3. 云函数与文件对照（前缀命名）

### 3.1 认证与第三方相关

| 云函数目录 | 原 REST | 第三方能力 |
|------------|---------|------------|
| `cloudfunctions/auth-sendSms/` | POST `/api/auth/send-sms` | 腾讯云 SMS |
| `cloudfunctions/auth-smsLogin/` | POST `/api/auth/sms-login` | 校验 `sms_codes` |
| `cloudfunctions/auth-wechatLogin/` | POST `/api/auth/wechat-login` | 微信 `jscode2session` |
| `cloudfunctions/auth-realName/` | POST `/api/auth/real-name` | FaceID 身份证二要素 |
| `cloudfunctions/auth-faceVerify/` | POST `/api/auth/face-verify` | FaceID 活体 DetectAuth |

### 3.2 VIP 与支付

| 云函数目录 | 原 REST | 说明 |
|------------|---------|------|
| `cloudfunctions/vip-getVipPlans/` | GET `/api/vip/plans` | 套餐列表 |
| `cloudfunctions/vip-createVipOrder/` | POST `/api/vip/orders` | JSAPI 下单 |
| `cloudfunctions/vip-getVipOrder/` | GET `/api/vip/orders/:id` | 订单查询 |
| `cloudfunctions/vip-mockPayOrder/` | POST `.../mock-pay` | 仅 `VIP_MOCK_PAY=1` |
| `cloudfunctions/vip-wechatPayNotify/` | POST `/api/vip/payment/wechat-notify` | **HTTP 触发** 回调 |

### 3.3 上传（云存储）

| 云函数目录 | 原 REST | 流程 |
|------------|---------|------|
| `cloudfunctions/upload-uploadAvatar/` | POST `/api/upload/avatar` | 客户端 `wx.cloud.uploadFile` → 传 `fileID` |
| `cloudfunctions/upload-uploadImage/` | POST `/api/upload/image` | 同上，`images/` |
| `cloudfunctions/upload-uploadVoice/` | POST `/api/upload/voice` | 同上，`voices/` |

---

## 4. 腾讯云短信（SMS）

### 4.1 控制台准备

1. 登录 [短信控制台](https://console.cloud.tencent.com/smsv2)。
2. 创建 **短信应用**（`SMS_SDK_APP_ID`）。
3. 申请 **签名**（`SMS_SIGN_NAME`）与 **模板**（`SMS_TEMPLATE_ID`），模板变量需包含验证码与有效期（当前实现传 `[code, '5']` 表示 5 分钟）。
4. 在 [访问管理](https://console.cloud.tencent.com/cam) 创建 API 密钥：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`。

### 4.2 代码路径

- 工具：`cloudfunctions/common/utils/tencent-sms.js`
- 入口：`cloudfunctions/auth-sendSms/index.js`

核心流程：

1. `assertPhone(phone)` 校验手机号。
2. `isSmsDemoMode()` 或 `!isSmsConfigured()` → 使用常量 `DEMO_SMS_CODE`（`888888`，见 `common/constants.js`）。
3. 否则 `sendTencentSms(phone, code)` 调用 API。
4. 写入集合 `sms_codes`（字段：`phone`、`code`、`type`、`expiresAt`、`isUsed`）。
5. 演示模式下响应 `data.code` 便于联调；**生产必须不返回验证码**。

### 4.3 环境变量

```bash
SMS_DEMO_MODE=0
TENCENT_SECRET_ID=AKIDxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxx
SMS_SDK_APP_ID=1400xxxxxx
SMS_SIGN_NAME=长情许
SMS_TEMPLATE_ID=1234567
SMS_REGION=ap-guangzhou
```

### 4.4 联调步骤

1. 部署 `auth-sendSms`、`auth-smsLogin`，Layer 已挂载。
2. 演示：`SMS_DEMO_MODE=1`，前端调用 `CLOUD_API_MAP.auth.sendSms` → `auth-sendSms`，使用 `888888` 登录。
3. 生产：关闭 `SMS_DEMO_MODE`，真机收短信，确认接口响应 **无** `code` 字段。
4. 检查 `sms_codes` 文档 `expiresAt` 约 5 分钟后过期。

### 4.5 常见问题

| 现象 | 处理 |
|------|------|
| `SendStatusSet[0].Code !== 'Ok'` | 检查签名/模板审核、余额、手机号格式（实现为 `+86` 前缀） |
| 仍返回 `888888` | 确认 `SMS_DEMO_MODE` 已关且六项 SMS 变量齐全 |
| 验证码无效 | 确认 `auth-smsLogin` 与 `type` 一致；查 `sms_codes.isUsed` |

---

## 5. 腾讯云 FaceID（实名 + 活体）

### 5.1 控制台准备

1. 开通 [人脸核身 FaceID](https://console.cloud.tencent.com/faceid)。
2. 创建规则：**实名二要素** → `FACEID_RULE_ID_REALNAME`（代码使用 `IdCardVerification` API）。
3. 创建规则：**活体核身** → `FACEID_RULE_ID_LIVENESS`（`DetectAuth` / `GetDetectInfoEnhanced`）。
4. 复用 SMS 同一对 `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY`。

### 5.2 实名：`auth-realName`

- 路径：`cloudfunctions/auth-realName/index.js`
- 工具：`cloudfunctions/common/utils/faceid.js` → `verifyIdName({ name, idCard })`
- 鉴权：JWT（`requireAuth`）
- 成功：更新 `users`：`legalName`、`idCardMasked`、`isRealName: true`

请求体示例（云函数 `event`）：

```json
{
  "token": "<JWT>",
  "legalName": "张三",
  "idCard": "110101199001011234"
}
```

### 5.3 人脸：`auth-faceVerify`

- 路径：`cloudfunctions/auth-faceVerify/index.js`
- 两阶段 `action`：
  - `getToken`：返回 `bizToken`（演示模式为 `demo-{userId}-{timestamp}`）
  - `confirm`（默认）：传 `bizToken`，`getLivenessResult` 通过后设 `isFaceVerified: true`

**小程序端（生产）：**

1. 先完成 `auth-realName`。
2. 调用 `auth-faceVerify` `action: 'getToken'` 取 `bizToken`。
3. 使用微信 FaceID 插件 / `wx.startFacialRecognitionVerify`（按微信文档接入）完成活体。
4. 再调 `auth-faceVerify` 传 `bizToken` 确认。

前端映射见 [FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md) 中 `CLOUD_API_MAP.auth.faceVerify`。

### 5.4 环境变量

```bash
FACEID_DEMO_MODE=0
TENCENT_SECRET_ID=AKIDxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxx
FACEID_RULE_ID_REALNAME=1
FACEID_RULE_ID_LIVENESS=2
FACEID_REGION=ap-guangzhou
# 可选
FACEID_REDIRECT_URL=https://www.qq.com
```

### 5.5 演示 vs 生产

| 模式 | `FACEID_DEMO_MODE` | `auth-realName` | `auth-faceVerify` |
|------|-------------------|-----------------|-------------------|
| 演示 | `1` | 任意姓名证件通过 | `demo-*` token 直接通过 |
| 生产 | `0` + 规则 ID | 真实二要素 | 真实 DetectAuth 链路 |

---

## 6. 微信支付（JSAPI + APIv3）

### 6.1 依赖关系

```
auth-wechatLogin  →  users.wechatOpenid
        ↓
vip-createVipOrder  →  微信统一下单 prepay_id
        ↓
小程序 wx.requestPayment
        ↓
vip-wechatPayNotify (HTTP)  →  vip_orders 已支付 + 延长 VIP
```

### 6.2 代码路径

| 文件 | 职责 |
|------|------|
| `cloudfunctions/common/utils/wechat-pay.js` | 下单、签名、回调解密验签 |
| `cloudfunctions/vip-createVipOrder/index.js` | 创建 `vip_orders`，返回 `payment` 或 `paymentMode: 'mock'` |
| `cloudfunctions/vip-wechatPayNotify/index.js` | 解析通知、`finalizeOrderPaid` |
| `cloudfunctions/vip-mockPayOrder/index.js` | 开发环境模拟到账 |

### 6.3 Mock 流程（推荐先做）

环境变量：

```bash
WECHAT_PAY_MODE=mock
VIP_MOCK_PAY=1
```

步骤：

1. 前端 `apiCreateVipOrder` → `vip-createVipOrder`，得到 `paymentMode: 'mock'`。
2. VIP 页调用 `vip-mockPayOrder`（映射 `CLOUD_API_MAP.vip.mockPay`）。
3. 确认 `users` VIP 字段与 `vip_orders.status` 已更新。

### 6.4 Live 流程

1. 商户平台配置 JSAPI 支付、APIv3 密钥、商户证书。
2. 部署 `vip-wechatPayNotify`，开启 **HTTP 访问服务**，获得 URL 形如：  
   `https://xxx.service.tcloudbase.com/vip-wechatPayNotify`
3. 将该 URL 填入 `WECHAT_PAY_NOTIFY_URL` 与微信商户平台「支付通知 URL」。
4. 配置环境变量（见 `cloudfunctions/env.example`）：

```bash
WECHAT_PAY_MODE=live
WECHAT_PAY_MCHID=16xxxxxxxxx
WECHAT_PAY_MERCHANT_SERIAL=xxxxxxxx
WECHAT_PAY_API_V3_KEY=32位APIv3密钥
WECHAT_PAY_PRIVATE_KEY_PEM=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
WECHAT_PAY_NOTIFY_URL=https://xxx.tcb.qcloud.la/vip-wechatPayNotify
WECHAT_PAY_PLATFORM_CERT_PEM=-----BEGIN CERTIFICATE-----\n...
WECHAT_APPID=wx________________
VIP_MOCK_PAY=0
```

5. `vip-createVipOrder` 在 `isWechatPayLiveReady()` 为真时返回：

```json
{
  "order": { },
  "payment": {
    "timeStamp": "...",
    "nonceStr": "...",
    "package": "prepay_id=...",
    "signType": "RSA",
    "paySign": "..."
  },
  "paymentMode": "live"
}
```

6. 小程序 `wx.requestPayment` 使用上述字段。
7. 支付成功后微信 POST 至 `vip-wechatPayNotify`；函数验签、解密 `resource`，更新订单。

### 6.5 HTTP 回调注意事项

- 函数名部署为 **`vip-wechatPayNotify`**（非旧名 `wechatPayNotify`）。
- 返回 `{ code: 'SUCCESS', message: '成功' }` 否则微信会重试。
- 日志中「订单未找到」仍返回 SUCCESS，避免重复通知风暴（见 `index.js`）。

### 6.6 微信支付 FAQ

| 问题 | 说明 |
|------|------|
| 提示先微信登录 | `vip-createVipOrder` 要求 `users.wechatOpenid`，先走 `auth-wechatLogin` |
| 下单失败 | 检查商户号、证书序列号、私钥 PEM 换行（`\n` 转义） |
| 回调不到账 | 核对 HTTP 触发 URL、APIv3 密钥、平台证书；查云函数日志 |
| 验签失败 | `WECHAT_PAY_PLATFORM_CERT_PEM` 需为微信支付平台证书，非商户证 |

---

## 7. 微信登录（支付前置）

| 云函数 | 说明 |
|--------|------|
| `cloudfunctions/auth-wechatLogin/` | `code` 换 openid；新用户 `createUser`；返回 JWT |

环境变量：`WECHAT_APPID`、`WECHAT_SECRET`。  
云函数内优先使用 `cloud.getWXContext().OPENID`；本地调试可回退 `jscode2session`。

前端：`CLOUD_API_MAP.auth.wechatLogin` → `'auth-wechatLogin'`。

---

## 8. 演示模式 vs 生产模式总表

| 能力 | 演示配置 | 生产配置 | 关键云函数 |
|------|----------|----------|------------|
| 短信 | `SMS_DEMO_MODE=1` | `SMS_DEMO_MODE=0` + 腾讯云 SMS 六变量 | `auth-sendSms` |
| 实名 | `FACEID_DEMO_MODE=1` | `FACEID_DEMO_MODE=0` + `FACEID_RULE_ID_REALNAME` | `auth-realName` |
| 活体 | 同上 | + `FACEID_RULE_ID_LIVENESS` + 小程序插件 | `auth-faceVerify` |
| 支付 | `WECHAT_PAY_MODE=mock` 或 `VIP_MOCK_PAY=1` | `WECHAT_PAY_MODE=live` + 全套 `WECHAT_PAY_*` | `vip-createVipOrder`、`vip-wechatPayNotify` |
| 上传 | 云存储直传 | 同左，注意存储权限规则 | `upload-uploadAvatar` 等 |

---

## 9. Layer 打包与 utils 引用

1. 执行 `scripts/package-common-layer.ps1`（或 `.sh`）生成 `common-layer.zip`。
2. 控制台创建层 `common-layer`，运行时 Nodejs18.15，挂载 **`/opt`**。
3. 业务函数内引用示例：

```javascript
const { sendTencentSms } = require('/opt/utils/tencent-sms')
const { verifyIdName } = require('/opt/utils/faceid')
const { createJsapiTransaction } = require('/opt/utils/wechat-pay')
```

修改 `common/utils/*.js` 后须 **重新上传 Layer**，并重新部署依赖该层的业务函数。

---

## 10. 上线检查清单（Phase 7）

- [ ] `SMS_DEMO_MODE=0`，真机短信不含 `code` 字段
- [ ] `FACEID_DEMO_MODE=0`，错误证件被拒绝
- [ ] 活体全流程 `isFaceVerified=true`
- [ ] `WECHAT_PAY_MODE=live`，`VIP_MOCK_PAY=0`
- [ ] `vip-wechatPayNotify` HTTP URL 与商户平台一致
- [ ] 0.01 元真机支付 → `vip_orders` 已支付
- [ ] 云函数日志无 Secret 明文打印
- [ ] 删除云端旧名函数（`sendSms`、`wechatPayNotify` 等无前缀版本）

---

## 11. 环境变量速查（完整模板）

详见 [cloudfunctions/env.example](cloudfunctions/env.example)。按阶段启用：

| 阶段 | 变量组 |
|------|--------|
| Phase 0 | `JWT_*`、`WECHAT_APPID`、`WECHAT_SECRET`、`NODE_ENV` |
| Phase 6 | `WECHAT_PAY_*`、`VIP_MOCK_PAY` |
| Phase 7 | `SMS_*`、`FACEID_*`、`TENCENT_SECRET_*` |

---

## 12. FAQ 汇总

**Q：能否只改业务函数不改 Layer？**  
A：utils 在 Layer 内。改 `tencent-sms.js` / `faceid.js` / `wechat-pay.js` 必须重传 Layer。

**Q：为何云函数名要带 `auth-`、`vip-` 前缀？**  
A：与 `longqingxu-frontend/src/services/cloud-api-map.ts` 及微信控制台函数名一致，避免与旧版无前缀函数冲突。详见 [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md)。

**Q：H5 能否走 FaceID 插件？**  
A：活体依赖微信小程序能力；H5 需单独规划或仅保留 Nest 后端路径（`VITE_USE_CLOUD=false`）。

**Q：`TENCENT_SECRET` 与短信、FaceID 是否共用？**  
A：是，同一对 SecretId/SecretKey，不同产品 API 由 `tencentcloud-sdk-nodejs` 各 Client 调用。

**Q：上传还要调 Nest 的 OSS 吗？**  
A：云模式下：客户端 `cloudUploadFile` → 云函数 `upload-uploadAvatar` 等用 `fileID` 换临时 URL，不再走阿里云 OSS。

**Q：支付回调能否用普通云函数而非 HTTP？**  
A：微信服务器需公网 HTTPS POST，必须使用 `vip-wechatPayNotify` 的 HTTP 触发。

---

## 13. 相关文档索引

| 文档 | 内容 |
|------|------|
| [CLOUD_MIGRATION.md](CLOUD_MIGRATION.md) | 37 个云函数 REST 映射 |
| [FRONTEND_CLOUD_MIGRATION.md](FRONTEND_CLOUD_MIGRATION.md) | `VITE_USE_CLOUD`、`CLOUD_API_MAP`、watch |
| [MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md) | Phase 0–8 执行勾选 |
| [cloudfunctions/README.md](cloudfunctions/README.md) | Layer 部署顺序 |
| [cloudfunctions/DEPLOY_CHECKLIST.md](cloudfunctions/DEPLOY_CHECKLIST.md) | 37 函数上传清单 |

---

## 14. 生产切换步骤（推荐顺序）

按以下顺序可降低联调风险，与 [MIGRATION_EXECUTION_PLAN.md](MIGRATION_EXECUTION_PLAN.md) Phase 7 一致：

1. **短信**：保持 `SMS_DEMO_MODE=1` 完成 Auth 全链路 → 配置腾讯云 SMS → 关闭演示 → 仅真机验证（勿在响应中打印 `code`）。
2. **实名**：`FACEID_DEMO_MODE=1` 跑通资料页 → 配置 `FACEID_RULE_ID_REALNAME` → 关闭演示 → 抽检错误证件。
3. **活体**：配置 `FACEID_RULE_ID_LIVENESS` + 小程序插件 → `auth-faceVerify` 全流程。
4. **支付**：先 `vip-mockPayOrder` → 再 `WECHAT_PAY_MODE=live` + HTTP 回调 → 0.01 元实付。
5. **收尾**：删除云端无前缀旧函数；前端 `VITE_USE_CLOUD=true` 体验版回归。

---

## 15. 监控与配额

| 产品 | 建议监控 | 控制台入口 |
|------|----------|------------|
| SMS | 发送成功率、日配额 | 短信 → 统计分析 |
| FaceID | 调用量、失败原因 | 人脸核身 → 数据统计 |
| 微信支付 | 回调失败日志 | 云函数 `vip-wechatPayNotify` 日志 |
| 云函数 | 超时、内存 | 云开发 → 运营分析 |

告警：对 `502` 类短信/FaceID 错误设置日志关键词告警；支付回调连续 `FAIL` 需人工介入。

---

## 16. `auth-smsLogin` 与验证码集合

短信发送仅负责写库；登录校验在 **`cloudfunctions/auth-smsLogin/`**：

1. 查询 `sms_codes`：`phone` + `code` + `type` + `isUsed: false` + 未过期。
2. 标记 `isUsed: true`。
3. 查找或创建用户，返回 JWT。

演示模式下 `auth-sendSms` 与 `auth-smsLogin` 均使用 `888888`，无需真实短信即可验收 Phase 1。

---

## 17. 密钥轮换备忘

| 密钥 | 轮换影响 | 操作 |
|------|----------|------|
| `JWT_SECRET` | 全部用户需重新登录 | 低峰期更换并通知 |
| `TENCENT_SECRET_*` | SMS + FaceID 同时失效 | CAM 新建密钥后更新环境变量 |
| `WECHAT_PAY_API_V3_KEY` | 旧回调解密失败 | 商户平台轮换后同步云函数 |
| 商户私钥 | 无法下单 | 更新 `WECHAT_PAY_PRIVATE_KEY_PEM` |

轮换后须重新部署 **未** 缓存旧环境变量的函数实例（可在控制台「更新配置」触发）。

---

*文档版本：与前缀命名云函数及 `cloudfunctions/common/utils/` 布局同步。*
