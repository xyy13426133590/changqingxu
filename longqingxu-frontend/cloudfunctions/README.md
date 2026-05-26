# 微信云函数（手机号注册 / 登录）

与前端 `src/services/cloud-api-map.ts` 中的命名对齐：

| 云函数名     | 说明 |
| ----------- | --- |
| `login`     | 手机号 + 密码登录 |
| `register`  | 手机号 + 密码 + 昵称注册 |

返回体与自建 Nest 后端一致：`{ code, message, data, timestamp }`，`code === 'SUCCESS'` 时 `data` 为 `{ accessToken, refreshToken, user }`。

## 部署步骤（微信开发者工具）

1. 在小程序控制台创建云开发环境（与前端 `VITE_CLOUD_ENV` / `CLOUD_ENV` 一致）。
2. 打开 **云开发 → 数据库**，新建集合 **`cq_users`**、`cq_auth_sessions`（可先按默认权限仅云函数可写）。
   - 建议为 `cq_users` 字段 `phone` 建唯一索引，避免重复注册。
3. 将本目录下 **`login` / `register` 文件夹**挂载到微信小程序项目的 **cloudfunctionRoot**（若使用 uni-app 构建产物，可把本目录拷贝到 `dist/dev/mp-weixin/cloudfunctions/` 或工具里配置的根目录）。
4. 分别右键 **`login`、`register`** → **上传并安装依赖**。
5. 前端 `.env` 设 `VITE_USE_CLOUD=true`、`VITE_CLOUD_ENV=你的环境ID`，并实现通过 `callCloud('login', …)` / `callCloud('register', …)` 发起请求（与现有 REST 网关二选一）。

## 云函数收到的事件字段

前端 `callCloud` 会把 `token` 一并塞进 `event`（可选）。业务参数：

- **register**：`phone`、`password`、`nickname`，可选 `code`（验证码占位）。
- **login**：`phone`、`password`。

## 安全提示

以下为演示可用的最小闭环；正式上线请补充：

- 短信验证码或服务端频次限制；
- IP/设备风控；
- 会话校验与 JWT/对称签名的统一策略（与其它云函数或自建 API 网关对齐）。
