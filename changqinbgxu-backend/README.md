# 长情许交友小程序后端

基于 **NestJS + MySQL + Redis + WebSocket** 的社交交友后端服务。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20.x LTS | 运行环境 |
| NestJS | 10.x | 后端框架 |
| TypeORM | 0.3.x | ORM 框架 |
| MySQL | 8.0 | 关系型数据库 |
| Redis | 7.x | 缓存服务 |
| WebSocket | Socket.IO | 实时消息 |
| JWT | - | 身份认证 |
| 阿里云 OSS | - | 文件存储 |

## 目录结构

```
changqinbgxu-backend/
├── src/
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证模块（登录/注册/微信）
│   │   ├── users/           # 用户模块
│   │   ├── matches/         # 匹配模块
│   │   ├── conversations/   # 会话模块
│   │   ├── messages/        # 消息模块（WebSocket）
│   │   ├── vip/             # VIP 会员模块
│   │   └── upload/          # 文件上传模块
│   ├── common/              # 公共代码
│   ├── config/              # 配置文件
│   ├── database/            # 数据库实体
│   └── utils/               # 工具函数
├── docs/                    # 文档
├── docker/                  # Docker 配置
└── test/                    # 测试文件
```

## 快速开始

### 1. 安装依赖

```bash
cd changqinbgxu-backend
npm install
```

### 2. 本地 MySQL / Redis（Navicat 可选）

1. MySQL 8+ 在本机启动后，可用 **Navicat** 连接 `127.0.0.1:3306`。打开「查询」执行 [`docs/database.sql`](docs/database.sql) 全文，创建库 `changqingxu` 与各表。
2. 安装并启动 **Redis**（默认 `6379`），`.env` 中 `REDIS_HOST=localhost`，否则后端启动会卡在 Redis 重连。
3. `.env` 里 `DB_*` 与实际库一致；纯本地调试设 `DB_SSL=false`。

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，并填写配置：

```bash
cp .env.example .env
```

关键配置项：

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=changqingxu

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key

# 阿里云 OSS
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=xxx
OSS_ACCESS_KEY_SECRET=xxx
OSS_BUCKET=changqingxu

# 微信小程序
WECHAT_APPID=xxx
WECHAT_SECRET=xxx
```

### 4. 初始化数据库（若未执行 Navicat 脚本）

```bash
# 创建数据库并导入表结构
mysql -u root -p < docs/database.sql
```

### 5. 联调种子数据（可选）

在 `.env` 已配置且 MySQL/Redis 可连的前提下，可插入一批演示账号（密码均为 `test888`）：

```bash
pnpm run seed:dev
```

### 6. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后访问：
- API 文档: http://localhost:3000/docs
- API 地址: http://localhost:3000/api

## API 接口列表

### 认证模块
- `POST /api/auth/register` - 手机号注册
- `POST /api/auth/login` - 手机号+密码登录
- `POST /api/auth/sms-login` - 手机号+验证码登录
- `POST /api/auth/send-sms` - 发送短信验证码
- `POST /api/auth/wechat-login` - 微信登录
- `POST /api/auth/real-name` - 实名认证
- `POST /api/auth/face-verify` - 人脸核验

### 用户模块
- `GET /api/users/me` - 获取当前用户资料
- `PUT /api/users/me` - 更新用户资料
- `GET /api/users/recommendations` - 获取推荐用户
- `GET /api/users/daily` - 获取每日推荐
- `GET /api/users/:id` - 获取用户详情

### 匹配模块
- `POST /api/matches/like` - 喜欢用户
- `POST /api/matches/pass` - 不喜欢用户
- `POST /api/matches/super-like` - 超级喜欢
- `GET /api/matches/mutual` - 获取互相喜欢的人

### 会话模块
- `GET /api/conversations` - 获取会话列表
- `POST /api/conversations` - 创建会话
- `DELETE /api/conversations/:id` - 删除会话
- `PUT /api/conversations/:id/top` - 置顶/取消置顶

### 消息模块
- WebSocket: `ws://localhost:3000/chat`
- `POST /api/messages` - 发送消息（REST 备选）
- `PUT /api/messages/read` - 标记已读

### VIP 模块
- `GET /api/vip/plans` - 获取套餐列表
- `POST /api/vip/orders` - 创建订单
- `GET /api/vip/orders/:id` - 查询订单

### 上传模块
- `POST /api/upload/avatar` - 上传头像
- `POST /api/upload/image` - 上传图片
- `POST /api/upload/voice` - 上传语音

## 前端对接

前端项目位于同级目录 `longqingxu-frontend`：

- HTTP 统一响应：`src/services/api.ts`（成功时 `code === 'SUCCESS'`）。
- 认证与资料：`stores/user.ts` 对接 `/api/auth/*` 与 `GET/PUT /users/me`。
- 实时聊天：**H5 / App** 使用 `socket.io-client`，命名空间 `/chat`（`src/services/chat-socket.ts`）。**微信小程序**与 Engine.IO / Socket.IO 握手协议不同，联调期以 **REST** 收发为主；上线实时能力需配置合法 `wss` 域名并选用可行的小程序 Socket.IO 适配方案。

## Docker 部署

```bash
# 构建镜像
docker build -t changqingxu-backend .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name changqingxu-backend \
  changqingxu-backend
```

## 开发规范

### Git 提交规范

```
feat: 新增功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 NestJS 编码规范
- 接口必须使用 DTO 进行参数校验
- 所有 API 必须有 Swagger 文档注释

## 许可证

UNLICENSED
