# 长情许 · 圈子动态功能设计文档

**版本：** 1.0  
**日期：** 2026-05-29  
**项目：** longqingxu-frontend（uni-app 微信小程序 + 微信云开发）

---

## 1. 背景与目标

### 背景

长情许是一款认真恋爱交友小程序，当前已有「发现（滑卡匹配）→ 消息（私聊）」的核心链路。缺乏用户自发的内容生产场域，用户黏性依赖系统推荐，难以形成社区氛围。

### 目标

在底部导航新增「圈子」Tab，提供类朋友圈的公开动态流：

- 用户可以发布图文、视频动态，展示生活状态
- 所有公开动态对游客可见，降低首次访问门槛
- 登录用户可点赞、评论，形成互动
- 通过头像、昵称、时间、位置构建真实感与信任感

### MVP 范围

| 功能 | 范围 |
|------|------|
| 圈子 Feed 列表 | 游客浏览公开动态；登录用户额外看「仅登录可见」内容 |
| 发布动态 | 图文（最多 9 张图）+ 视频（最多 1 个，60s 以内）+ 位置 + 可见性 |
| 动态卡片 | 头像、昵称、发布时间、位置、媒体内容（九宫格图 / 视频封面）、点赞数、评论数 |
| 点赞 | 登录用户点赞/取消点赞；乐观更新 |
| 评论 | 登录用户发表一级评论；评论列表展开（底部抽屉） |
| 游客引导 | 点赞/评论/发布时弹出「请登录」提示 |

### 二期（不在本文档范围）

- 私密圈子的创建、加入与管理
- 评论回复（二级评论）
- 动态搜索与话题标签
- 举报/审核后台
- @提醒通知

---

## 2. 可见性矩阵与合规

### 2.1 三级可见性

| 级别 | 字段值 | 发帖人设置 | 谁可读取 | 谁可互动 |
|------|--------|------------|----------|----------|
| 公开 | `visibility: "public"` | 默认，任何人可见 | 游客 + 所有登录用户 | 仅登录用户 |
| 仅登录可见 | `visibility: "login_only"` | 发帖时可选 | 仅登录用户 | 登录用户 |
| 私密圈成员 | `visibility: "circle_members"` + `circleId` | 二期，私密圈成员 | 该圈子成员 | 成员（需登录） |

### 2.2 服务端过滤规则

游客（无有效 token）请求 `moment-listFeed` 时，云函数执行：

```
WHERE visibility = 'public'
  AND status = 'active'
```

登录用户执行：

```
WHERE status = 'active'
  AND (
    visibility = 'public'
    OR visibility = 'login_only'
    OR (visibility = 'circle_members' AND circleId IN viewer.joinedCircleIds)
  )
```

**关键原则：**

- **过滤在云函数内完成**，客户端不参与可见性决策
- `login_only` 帖子对游客返回占位卡片（`{ masked: true, content: null, media: [] }`），不暴露正文与媒体 fileID
- 私密圈帖子绝不出现在非成员的返回结果中（不存在 masked 版本，直接跳过）

### 2.3 合规预留字段

- `status: "active" | "hidden" | "deleted"` — 后台审核下架用
- `auditStatus: "pending" | "passed" | "rejected"` — 预留，MVP 默认 `passed`，内容过多后接入机器审核

---

## 3. 数据模型与索引

云环境：`prod-love-app-d8gn9cxenfb74c1ac`（与 `.env` 中 `VITE_CLOUD_ENV` 一致）

### 3.1 集合 `circles`

```json
{
  "_id": "default_public",
  "name": "全站广场",
  "type": "public",
  "memberIds": [],
  "ownerId": "system",
  "createdAt": "2026-05-29T00:00:00.000Z"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | string | 是 | 圈子 ID，`default_public` 为系统广场 |
| `name` | string | 是 | 圈子名称 |
| `type` | `"public" \| "private"` | 是 | 公开或私密 |
| `memberIds` | string[] | 是 | 私密圈成员 userId 列表；公开圈为 `[]` |
| `ownerId` | string | 是 | 创建者 userId，系统圈为 `"system"` |
| `createdAt` | ISO 8601 | 是 | |

**索引：** `type`（单字段）

### 3.2 集合 `moment_posts`

```json
{
  "_id": "post_abc123",
  "authorId": "user_xyz",
  "circleId": "default_public",
  "visibility": "public",
  "content": "今天天气真好，出门散步了～",
  "media": [
    {
      "type": "image",
      "fileID": "cloud://prod.xxx/moments/images/user_xyz/1234567890_abc.jpg",
      "width": 1080,
      "height": 720
    }
  ],
  "location": {
    "name": "北京市朝阳区",
    "latitude": 39.9087,
    "longitude": 116.3975
  },
  "likeCount": 12,
  "commentCount": 3,
  "status": "active",
  "auditStatus": "passed",
  "createdAt": "2026-05-29T10:00:00.000Z",
  "updatedAt": "2026-05-29T10:00:00.000Z"
}
```

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `authorId` | string | 是 | 关联 `users._id` |
| `circleId` | string | 否 | 空则默认全站广场 |
| `visibility` | enum | 是 | `public / login_only / circle_members` |
| `content` | string | 否 | 最长 500 字；纯图片帖可为空 |
| `media` | array | 否 | 图片最多 9 张；视频最多 1 个；两者互斥（MVP 简化：可混排图片，或单独视频） |
| `media[].type` | `"image" \| "video"` | 是 | |
| `media[].fileID` | string | 是 | 微信云存储 `cloud://` fileID |
| `media[].duration` | number | 视频必填 | 秒数，不超过 60 |
| `location.name` | string | 否 | 用户选择或手动输入的位置文案 |
| `likeCount` / `commentCount` | number | 是 | 冗余计数，通过云函数 `inc` 更新 |
| `status` | enum | 是 | `active / hidden / deleted` |

**索引：**

- `{ createdAt: -1 }` — Feed 主排序
- `{ circleId: 1, createdAt: -1 }` — 圈子内时间线
- `{ authorId: 1, createdAt: -1 }` — 个人主页动态（二期）
- `{ status: 1, visibility: 1 }` — 过滤组合

### 3.3 集合 `moment_likes`

```json
{
  "_id": "like_abc",
  "postId": "post_abc123",
  "userId": "user_xyz",
  "createdAt": "2026-05-29T11:00:00.000Z"
}
```

**索引：** `{ postId: 1, userId: 1 }` 复合唯一 — 防重复点赞

### 3.4 集合 `moment_comments`

```json
{
  "_id": "comment_abc",
  "postId": "post_abc123",
  "userId": "user_xyz",
  "content": "太美了！",
  "replyToCommentId": null,
  "createdAt": "2026-05-29T11:30:00.000Z"
}
```

**索引：** `{ postId: 1, createdAt: 1 }` — 评论时间线

### 3.5 安全规则（追加到 `security-rules.json`）

```json
{
  "circles": {
    ".read": true,
    ".write": false
  },
  "moment_posts": {
    ".read": false,
    ".write": false
  },
  "moment_likes": {
    ".read": false,
    ".write": false
  },
  "moment_comments": {
    ".read": false,
    ".write": false
  }
}
```

> `circles` 设为公开只读，方便客户端直接查圈子名称；帖子/点赞/评论全部走云函数。

---

## 4. 云函数 API 契约

所有云函数遵循现有公共层规范：

- 公共层挂载 `/opt`：`response.js`（`wrapHandler / success / fail`）、`auth.js`（`requireAuth / optionalAuth`）、`validate.js`（`assertRequired`）
- 响应格式：`{ code: "SUCCESS", message, data, timestamp }`
- 错误码：`UNAUTHORIZED(401) / FORBIDDEN(403) / NOT_FOUND(404) / ERROR(400/500)`

### 4.1 `moment-listFeed` — 动态流列表

**鉴权：** 可选（有 token 则用，无则游客模式）

**请求：**

```json
{
  "token": "...",       // 可选
  "circleId": "default_public",  // 可选，不传则全站
  "page": 1,
  "limit": 10           // 最大 20
}
```

**响应 data：**

```json
{
  "posts": [
    {
      "id": "post_abc123",
      "author": {
        "id": "user_xyz",
        "nickname": "小林",
        "avatar": "cloud://..."
      },
      "content": "今天天气真好～",
      "media": [
        { "type": "image", "fileID": "cloud://...", "width": 1080, "height": 720 }
      ],
      "location": { "name": "北京市朝阳区" },
      "likeCount": 12,
      "commentCount": 3,
      "isLiked": false,      // 游客始终 false
      "visibility": "public",
      "createdAt": "2026-05-29T10:00:00.000Z",
      "masked": false        // login_only 对游客返回 true，同时 content/media 置空
    }
  ],
  "total": 86,
  "hasMore": true,
  "page": 1
}
```

### 4.2 `moment-createPost` — 发布动态

**鉴权：** JWT 必填

**请求：**

```json
{
  "token": "...",
  "circleId": "default_public",
  "visibility": "public",
  "content": "今天天气真好～",
  "media": [
    { "type": "image", "fileID": "cloud://...", "width": 1080, "height": 720 }
  ],
  "location": { "name": "北京市朝阳区", "latitude": 39.9087, "longitude": 116.3975 }
}
```

**校验：**

- `content` 与 `media` 至少一个不为空
- `media` 图片不超过 9 张；视频不超过 1 个，`duration` 不超过 60
- `fileID` 必须是 `cloud://` 开头的合法 fileID

**响应 data：** 创建成功的帖子对象（同 listFeed 单条格式）

### 4.3 `moment-toggleLike` — 点赞/取消点赞

**鉴权：** JWT 必填

**请求：**

```json
{ "token": "...", "postId": "post_abc123" }
```

**响应 data：**

```json
{ "liked": true, "likeCount": 13 }
```

**实现：** 用事务检查 `moment_likes` 是否存在同 `postId+userId` 文档；存在则删除并 `likeCount - 1`，不存在则插入并 `likeCount + 1`。

### 4.4 `moment-listComments` — 评论列表

**鉴权：** 可选

**请求：**

```json
{ "postId": "post_abc123", "page": 1, "limit": 20 }
```

**响应 data：**

```json
{
  "comments": [
    {
      "id": "comment_abc",
      "author": { "id": "user_xyz", "nickname": "小林", "avatar": "cloud://..." },
      "content": "太美了！",
      "createdAt": "2026-05-29T11:30:00.000Z"
    }
  ],
  "total": 3,
  "hasMore": false
}
```

### 4.5 `moment-createComment` — 发表评论

**鉴权：** JWT 必填

**请求：**

```json
{ "token": "...", "postId": "post_abc123", "content": "太美了！" }
```

**校验：** `content` 1–200 字，不含违禁词（MVP 跳过，后台人工）

**响应 data：** 新建评论对象

### 4.6 `moment-deletePost` — 删除动态

**鉴权：** JWT 必填，且 `authorId == viewer`

**请求：**

```json
{ "token": "...", "postId": "post_abc123" }
```

**实现：** 软删除，将 `status` 改为 `"deleted"`

### 4.7 `upload-uploadVideo` — 视频上传

**鉴权：** JWT 必填

**请求：**（与 `upload-uploadImage` 一致）

```json
{ "token": "...", "fileID": "cloud://...", "ext": "mp4", "duration": 25 }
```

**实现：** 校验 `duration <= 60`；云路径 `moments/videos/{userId}/{timestamp}_{hash}.mp4`；返回 `{ fileID, url, fileName }`

---

## 5. 前端页面与组件

### 5.1 Tab 导航变更

原 4 Tab：发现 | 筛选 | 消息 | 我的  
新 5 Tab：发现 | 筛选 | **圈子** | 消息 | 我的

修改文件：

- `pages.json` — `tabBar.list` 插入圈子项；`pages` 数组增加 `circle/index` 和 `circle/publish`
- `TabBar.vue` — `tabs` 数组插入 `{ name: 'circle', pagePath: '/pages/circle/index', text: '圈子' }`；`TabName` 类型增加 `'circle'`
- `TabNavSvg.vue` — 增加 `circle` 分支，图标为同心圆光圈（与紫色渐变一致）

### 5.2 页面清单

| 页面 | 路径 | Tab | 说明 |
|------|------|-----|------|
| 圈子首页 | `pages/circle/index` | 是 | Feed 列表 + 顶栏 + 右下角发布 FAB |
| 发布页 | `pages/circle/publish` | 否 | `navigateTo`；选图/视频、文案、位置、可见性 |
| 动态详情 | `pages/circle/detail` | 否 | `navigateTo`；完整评论列表（MVP 可用底部抽屉代替） |

### 5.3 组件清单

| 组件 | 路径 | 说明 |
|------|------|------|
| `MomentCard` | `components/MomentCard.vue` | 单条动态卡片；接收 `post` prop；内部处理 masked 态 |
| `MomentMediaGrid` | `components/MomentMediaGrid.vue` | 九宫格图片 / 单视频封面 |
| `MomentCommentSheet` | `components/MomentCommentSheet.vue` | 底部弹层评论列表 + 输入框 |
| `VisibilityPicker` | `components/VisibilityPicker.vue` | 发布时选择可见性的单选组件 |

### 5.4 服务层

新建 `src/services/api-moment.ts`：

```typescript
// 遵循现有双模式结构
export function apiListFeed(params: ListFeedParams): Promise<FeedResult> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.moments.listFeed, params)
  return get('/moments/feed', params)
}
// ... toggleLike / createPost / listComments / createComment / deletePost
```

`cloud-api-map.ts` 新增：

```typescript
moments: {
  listFeed: 'moment-listFeed',
  getPost: 'moment-getPost',
  createPost: 'moment-createPost',
  deletePost: 'moment-deletePost',
  toggleLike: 'moment-toggleLike',
  listComments: 'moment-listComments',
  createComment: 'moment-createComment',
},
circles: {
  list: 'circle-list',
},
```

Pinia Store：`src/stores/circle.ts`

- 管理 Feed 分页（`posts`、`page`、`hasMore`、`loading`）
- 点赞乐观更新（先改 `isLiked`/`likeCount`，失败后回滚）
- 评论局部加载（按 `postId` 存储）

### 5.5 全局样式新增

在 `index.scss` 末尾追加圈子模块区块：

```scss
/* ==================== 圈子模块专用样式 ==================== */
.circle-header { /* 顶栏 */ }
.moment-card { /* 动态卡片 */ }
.moment-author-row { /* 头像+昵称+时间+位置行 */ }
.moment-media-grid { /* 九宫格图 */ }
.moment-actions { /* 点赞/评论行 */ }
.circle-publish-fab { /* 右下角发布按钮 */ }
.moment-comment-sheet { /* 评论底部抽屉 */ }
```

---

## 6. 错误码与用户提示

| 场景 | 云函数返回 | 前端展示 |
|------|----------|----------|
| 游客点赞/评论 | 不调用（前端拦截） | 弹窗「请先登录」，跳转登录页 |
| 帖子不存在 | `NOT_FOUND` | toast「动态已删除」 |
| 无权删除 | `FORBIDDEN` | toast「无权操作」 |
| 评论内容为空 | `ERROR(400)` | toast「评论不能为空」 |
| 视频超时长 | `ERROR(400)` | toast「视频不超过 60 秒」 |
| 媒体为空且文案为空 | `ERROR(400)` | toast「请添加内容或图片」 |
| 网络异常 | 前端 catch | toast「网络异常，请重试」 |

---

## 7. MVP 范围对照

### 本次实现（P1–P4）

- [x] `circles` / `moment_posts` / `moment_likes` / `moment_comments` 四个集合
- [x] 安全规则更新
- [x] `moment-listFeed / createPost / deletePost / toggleLike / listComments / createComment`
- [x] `upload-uploadVideo`
- [x] 圈子 Tab + `pages/circle/index`（Feed）
- [x] `pages/circle/publish`（发布页）
- [x] `MomentCard / MomentMediaGrid / MomentCommentSheet / VisibilityPicker` 组件
- [x] `api-moment.ts` + `stores/circle.ts`
- [x] 游客引导登录

### 二期（本文档不实现）

- 私密圈创建/加入（`circle-create / circle-join`）
- 二级评论（`replyToCommentId`）
- 内容审核后台
- 话题标签 / 搜索
- 发布成功后 @好友通知
- 个人主页展示自己的动态

---

## 8. 测试用例清单

### 可见性

- [ ] 游客请求 `moment-listFeed`：仅返回 `visibility=public` 的帖子
- [ ] 游客请求包含 `login_only` 帖子时：返回 `masked:true`，`content/media` 为空
- [ ] 登录用户：可见 `public` 和 `login_only` 帖子
- [ ] `login_only` 帖子对登录用户展示完整内容

### 发布

- [ ] 仅文案（无媒体）：成功
- [ ] 仅图片（1–9 张）：成功
- [ ] 仅视频（1 个 ≤60s）：成功
- [ ] 视频超 60s：返回 400 错误
- [ ] 文案和媒体均为空：返回 400 错误
- [ ] 游客发布：前端拦截，弹出登录提示

### 点赞

- [ ] 未点赞时点赞：`liked=true`，`likeCount+1`
- [ ] 已点赞时取消：`liked=false`，`likeCount-1`
- [ ] 并发点赞同一帖子：`moment_likes` 复合唯一索引保证不重复

### 评论

- [ ] 发表评论：成功，评论列表更新
- [ ] 空内容评论：400 错误
- [ ] 评论列表分页：`hasMore` 正确
- [ ] 游客评论：前端拦截

### 删除

- [ ] 作者删除自己的帖：软删除（status=deleted），Feed 不再出现
- [ ] 非作者删除他人帖：403 错误

---

## 附：实现阶段划分

| 阶段 | 内容 | 依赖 |
|------|------|------|
| P0 | 本文档 + HTML 原型 | — |
| P1 | 云库集合 + 安全规则 + 云函数 | P0 审批 |
| P2 | 圈子 Tab + Feed 页面 + api-moment + 全局样式 | P1 |
| P3 | 发布页 + 上传 + 视频播放 | P2 |
| P4 | 点赞 + 评论 + 游客引导 | P3 |
