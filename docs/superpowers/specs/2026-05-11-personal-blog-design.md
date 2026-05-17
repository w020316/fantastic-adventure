# 个人博客网站 — 设计文档

> 日期：2026-05-11
> 状态：已审核
> 仓库：https://github.com/w020316/fantastic-adventure
> 项目路径：d:\xm\wz\grbk

---

## 1. 项目概述

### 1.1 目标

构建一个以**技术作品集**为核心的个人博客网站，展示技术文章、项目经验和专业能力，作为职业发展的个人品牌。

### 1.2 核心功能

- **文章管理**：Markdown/富文本编辑、文章发布、分类、标签、搜索
- **评论互动**：访客评论、嵌套回复、点赞，支持审核机制
- **个人作品集**：个人介绍、技能展示、项目作品集、联系方式
- **数据统计**：访问量、文章热度、访客来源等数据统计

### 1.3 视觉风格

**现代动感风**：深色主背景 + 渐变强调色 + 丰富动效 + 毛玻璃质感

### 1.4 成功标准

- 博客前台可正常浏览文章、评论、作品集
- 管理后台可完成文章/分类/标签/评论/作品的 CRUD
- 页面加载首屏 < 2s
- 移动端适配良好

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                   用户浏览器                      │
│  ┌──────────────┐    ┌──────────────────────┐    │
│  │  博客前台 SPA │    │  管理后台 SPA         │    │
│  │  (Vue 3+Vite)│    │  (Vue 3+Vite)        │    │
│  └──────┬───────┘    └──────────┬───────────┘    │
└─────────┼───────────────────────┼────────────────┘
          │  API 请求             │  API 请求
          ▼                       ▼
┌─────────────────────────────────────────────────┐
│              Express 后端 API                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ 文章模块 │ │ 评论模块  │ │ 用户/认证模块    │  │
│  └────┬────┘ └────┬─────┘ └───────┬──────────┘  │
│       └───────────┼───────────────┘              │
│                   ▼                              │
│           ┌──────────────┐                       │
│           │   PostgreSQL 数据库 │                      │
│           └──────────────┘                       │
└─────────────────────────────────────────────────┘
```

### 2.2 项目结构（Monorepo）

```
grbk/
├── client/          # 博客前台（Vue 3 + Vite）
├── admin/           # 管理后台（Vue 3 + Vite + Element Plus）
├── server/          # 后端 API（Express + TypeScript）
├── shared/          # 前后端共享类型定义
├── package.json     # 根 package.json（workspace 管理）
└── README.md
```

### 2.3 架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 前后端分离 | 是 | 前台和后台独立部署，职责清晰 |
| Monorepo | npm workspace | 共享类型和工具，统一版本管理 |
| 数据库 | PostgreSQL 15+ | 稳定可靠，适合博客结构化数据 |
| 认证方式 | JWT | 无状态，前后端分离友好 |

---

## 3. 数据模型

### 3.1 ER 关系

```
users ──1:N──→ articles ──M:N──→ tags (via article_tags)
                    │
                    └──1:N──→ comments (自关联 parent_id)

categories ──1:N──→ articles

users ──1:N──→ projects

stats (独立表，记录访问日志)
```

### 3.2 表结构

#### users（用户表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | bcrypt 加密密码 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| avatar | VARCHAR(255) | | 头像 URL |
| role | ENUM('admin','visitor') | DEFAULT 'visitor' | 角色 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

#### articles（文章表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | LONGTEXT | NOT NULL | Markdown 内容 |
| summary | VARCHAR(500) | | 摘要 |
| cover_image | VARCHAR(255) | | 封面图 URL |
| category_id | INT | FK → categories.id | 分类 |
| author_id | INT | FK → users.id | 作者 |
| status | ENUM('draft','published') | DEFAULT 'draft' | 状态 |
| view_count | INT | DEFAULT 0 | 浏览数 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

#### categories（分类表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名 |
| sort_order | INT | DEFAULT 0 | 排序权重 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

#### tags（标签表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名 |
| color | VARCHAR(7) | DEFAULT '#6366f1' | 标签颜色（HEX） |

#### article_tags（文章-标签中间表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| article_id | INT | FK → articles.id | 文章 ID |
| tag_id | INT | FK → tags.id | 标签 ID |

主键：(article_id, tag_id)

#### comments（评论表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| article_id | INT | FK → articles.id | 所属文章 |
| nickname | VARCHAR(50) | NOT NULL | 昵称 |
| email | VARCHAR(100) | | 邮箱（不公开显示） |
| content | TEXT | NOT NULL | 评论内容 |
| parent_id | INT | FK → comments.id, NULLABLE | 父评论 ID（嵌套回复） |
| status | ENUM('pending','approved','hidden') | DEFAULT 'pending' | 审核状态 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

嵌套层级：最多 2 层（评论 → 回复）

#### projects（作品表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| title | VARCHAR(200) | NOT NULL | 项目名称 |
| description | TEXT | | 项目描述 |
| tech_stack | JSON | | 技术栈数组，如 ["Vue","Node.js"] |
| cover_image | VARCHAR(255) | | 封面图 URL |
| demo_url | VARCHAR(255) | | 在线演示链接 |
| repo_url | VARCHAR(255) | | 仓库链接 |
| sort_order | INT | DEFAULT 0 | 排序权重 |
| author_id | INT | FK → users.id | 作者 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

#### stats（访问统计表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| path | VARCHAR(255) | NOT NULL | 访问路径 |
| ip | VARCHAR(45) | | 访客 IP |
| referrer | VARCHAR(500) | | 来源页面 |
| user_agent | VARCHAR(500) | | 浏览器信息 |
| created_at | DATETIME | DEFAULT NOW() | 访问时间 |

---

## 4. API 设计

### 4.1 认证模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录 | 公开 |
| POST | `/api/auth/logout` | 登出 | 需登录 |
| GET | `/api/auth/profile` | 获取当前用户信息 | 需登录 |
| POST | `/api/auth/refresh` | 刷新 Token | 需登录 |

### 4.2 文章模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/articles` | 文章列表（分页/筛选） | 公开 |
| GET | `/api/articles/:id` | 文章详情 | 公开 |
| POST | `/api/articles` | 创建文章 | 需登录 |
| PUT | `/api/articles/:id` | 更新文章 | 需登录 |
| DELETE | `/api/articles/:id` | 删除文章 | 需登录 |
| POST | `/api/articles/:id/like` | 点赞 | 公开 |

GET `/api/articles` 支持查询参数：
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）
- `category_id`：按分类筛选
- `tag_id`：按标签筛选
- `keyword`：关键词搜索（标题/摘要）
- `status`：状态筛选（仅管理员可用）

### 4.3 分类模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/categories` | 分类列表 | 公开 |
| POST | `/api/categories` | 创建分类 | 需登录 |
| PUT | `/api/categories/:id` | 更新分类 | 需登录 |
| DELETE | `/api/categories/:id` | 删除分类 | 需登录 |

### 4.4 标签模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/tags` | 标签列表 | 公开 |
| POST | `/api/tags` | 创建标签 | 需登录 |
| PUT | `/api/tags/:id` | 更新标签 | 需登录 |
| DELETE | `/api/tags/:id` | 删除标签 | 需登录 |

### 4.5 评论模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/articles/:id/comments` | 文章评论列表 | 公开 |
| POST | `/api/articles/:id/comments` | 发表评论 | 公开 |
| DELETE | `/api/comments/:id` | 删除评论 | 需登录 |
| PUT | `/api/comments/:id/status` | 审核/隐藏评论 | 需登录 |

### 4.6 作品集模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/projects` | 作品列表 | 公开 |
| POST | `/api/projects` | 创建作品 | 需登录 |
| PUT | `/api/projects/:id` | 更新作品 | 需登录 |
| DELETE | `/api/projects/:id` | 删除作品 | 需登录 |

### 4.7 统计模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/stats` | 上报访问记录 | 公开 |
| GET | `/api/stats/overview` | 总览数据 | 需登录 |
| GET | `/api/stats/trend` | 访问趋势 | 需登录 |

### 4.8 上传模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/upload` | 上传图片/文件 | 需登录 |

---

## 5. 页面设计

### 5.1 前台页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 动画 + 最新文章 + 精选项目 |
| 文章列表 | `/articles` | 分页、分类筛选、标签筛选 |
| 文章详情 | `/article/:id` | Markdown 渲染 + 目录 + 评论 |
| 作品集 | `/projects` | 项目卡片展示 |
| 关于我 | `/about` | 个人介绍、技能、联系方式 |

### 5.2 管理后台页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录 | `/login` | 管理员登录 |
| 仪表盘 | `/dashboard` | 数据统计总览 |
| 文章管理 | `/articles` | 文章 CRUD + 编辑器 |
| 文章编辑 | `/article/edit/:id?` | Markdown 编辑器 |
| 分类管理 | `/categories` | 分类 CRUD |
| 标签管理 | `/tags` | 标签 CRUD |
| 评论管理 | `/comments` | 评论审核/删除 |
| 作品管理 | `/projects` | 作品 CRUD |
| 个人设置 | `/settings` | 修改密码、头像等 |

### 5.3 前台页面流程

```
首页 ──→ 文章列表 ──→ 文章详情 ──→ 评论互动
  │                                    │
  ├──→ 作品集                          └──→ 点赞
  │
  └──→ 关于我
```

---

## 6. UI 设计规范

### 6.1 视觉风格

**现代动感风**

- **主背景**：#0a0a0f（深色）
- **强调色**：紫蓝 #6366f1 → 青色 #06b6d4（渐变）
- **文字色**：#f1f5f9（亮色主文字）、#94a3b8（次要文字）
- **卡片**：毛玻璃效果（backdrop-filter: blur）+ 微光边框
- **圆角**：12px（卡片）、8px（按钮）、20px（头像）

### 6.2 动效规范

| 区域 | 动效 | ReactBits 组件 |
|------|------|---------------|
| Hero 区 | 全屏渐变背景 + 动态粒子 + 打字机效果标语 | Aurora / Line Waves / Soft Aurora（背景）+ Shiny Text / Gradient Text（标题） |
| 文章卡片 | 毛玻璃卡片 + 封面图 + 悬浮上浮 + 渐变边框光效 | Tilted Card / Spotlight Card |
| 文章详情 | 深色阅读背景 + 代码块语法高亮 + 目录侧边栏吸顶 | — |
| 作品集 | 网格卡片 + 技术栈标签 + 悬浮展示 Demo 预览 | Tilted Card / Spotlight Card / Orbit Images |
| 关于我 | 时间轴布局 + 技能雷达图 + 社交链接图标 | Count Up（数字动效） |
| 鼠标交互 | 全局鼠标跟随特效 | Blob Cursor / Splash Cursor |
| 导航栏 | 底部/侧边动态导航 | Dock / Magnet Lines |
| 页面切换 | Vue Router 过渡动画（fade + slide） | — |
| 滚动 | 视差效果 + 元素入场动画（Intersection Observer） | — |

### 6.3 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| 移动端 | < 640px | 单列，汉堡菜单 |
| 平板 | 640px - 1024px | 双列，侧边栏折叠 |
| 桌面 | > 1024px | 三列/全宽，侧边栏常驻 |

---

## 7. 技术选型

### 7.1 前台

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | SPA 框架 |
| Vite | ^5.x | 构建工具 |
| Vue Router 4 | ^4.x | 路由 |
| Pinia | ^2.x | 状态管理 |
| Tailwind CSS | ^3.x | 样式系统 |
| @vueuse/core | ^10.x | 动效工具（鼠标跟踪、滚动等） |
| markdown-it | ^14.x | Markdown 渲染 |
| highlight.js | ^11.x | 代码语法高亮 |
| animate.css | ^4.x | 入场动画 |
| ReactBits | latest | 创意动效组件库（reactbits.dev） |

### 7.2 管理后台

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | SPA 框架 |
| Vite | ^5.x | 构建工具 |
| Element Plus | ^2.x | UI 组件库 |
| md-editor-v3 | ^4.x | Markdown 编辑器 |
| ECharts | ^5.x | 统计图表 |
| Vue Router 4 | ^4.x | 路由 |
| Pinia | ^2.x | 状态管理 |

### 7.3 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | ^4.x | Web 框架 |
| TypeScript | ^5.x | 类型安全 |
| pg | ^8.x | PostgreSQL 驱动 |
| jsonwebtoken | ^9.x | JWT 认证 |
| bcryptjs | ^2.x | 密码加密 |
| multer | ^1.x | 文件上传 |
| cors | ^2.x | 跨域处理 |
| helmet | ^7.x | 安全头 |
| express-validator | ^7.x | 参数校验 |

### 7.4 数据库

PostgreSQL 15+

### 7.5 共享

| 技术 | 用途 |
|------|------|
| TypeScript 类型定义 | 前后端 API 类型同步 |

---

## 8. 认证流程

```
1. 管理员登录 → POST /api/auth/login { username, password }
2. 后端验证密码（bcrypt.compare）→ 生成 JWT
   - access_token: 有效期 2h
   - refresh_token: 有效期 7d
3. 前端存储 token（localStorage）→ 请求头携带 Authorization: Bearer <access_token>
4. 后端 auth 中间件验证 JWT → 放行或拒绝
5. access_token 过期 → 用 refresh_token 调用 /api/auth/refresh 自动刷新
6. refresh_token 过期 → 跳转登录页
```

---

## 9. 错误处理

### 9.1 后端错误响应格式

```json
{
  "code": 400,
  "message": "参数校验失败",
  "errors": [
    { "field": "title", "message": "标题不能为空" }
  ]
}
```

### 9.2 HTTP 状态码规范

| 状态码 | 场景 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 参数校验失败 |
| 401 | 未登录 / Token 过期 |
| 403 | 无权限操作 |
| 404 | 资源不存在 |
| 500 | 服务端异常（不暴露堆栈） |

### 9.3 前端错误处理

- 全局 Axios 拦截器统一处理错误响应
- 401 自动跳转登录页
- 网络错误提示用户并提供重试
- 表单校验错误在对应字段下方显示

---

## 10. 部署方案

| 组件 | 方案 |
|------|------|
| 前端（client + admin） | Vercel / Netlify 自动部署 |
| 后端（server） | 云服务器 Node.js + PM2 |
| 数据库 | 云 PostgreSQL（Supabase / Neon / Render PostgreSQL） |
| 文件存储 | 服务器本地 / OSS |
| CI/CD | GitHub Actions 自动构建部署 |

---

## 11. 非功能性需求

| 维度 | 要求 |
|------|------|
| 首屏加载 | < 2s |
| SEO | 前台页面需设置合理的 meta 标签 |
| 安全 | JWT 认证、bcrypt 加密、helmet 安全头、XSS/CSRF 防护 |
| 可访问性 | 语义化 HTML、键盘导航、ARIA 标签 |
| 浏览器兼容 | Chrome、Firefox、Safari、Edge 最新2个版本 |
| 移动端适配 | 响应式布局，移动端优先 |
