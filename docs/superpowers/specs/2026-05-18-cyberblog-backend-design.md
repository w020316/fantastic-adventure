# CyberBlog 第二部分 — 后端 API + 管理后台 设计规格

> 日期: 2026-05-18
> 状态: 已批准
> 前置: 第一部分（前台页面 + 赛博朋克 UI 系统）已完成

## 1. 范围

| 子系统 | 内容 | 依赖 |
|--------|------|------|
| A. 数据库层 | Neon PostgreSQL + Prisma 6 迁移 + 种子数据 | Neon 账号 |
| B. API 层 | 13 个 RESTful 端点 + 认证中间件 | A |
| C. 管理后台 | 7 个页面 + Markdown 编辑器 | B |
| D. 测试+文档 | API 路由测试 + 构建验证 | B |

## 2. 数据库

- 平台: Neon Serverless PostgreSQL
- ORM: Prisma 6 (已配置)
- 迁移: `prisma migrate dev`
- 种子: `prisma db seed` 创建默认管理员 + 示例数据

## 3. API 端点

### 公开接口
| 端点 | 方法 | 功能 | 查询参数 |
|------|------|------|----------|
| `/api/articles` | GET | 文章列表 | page, limit, category, tag, search, sort |
| `/api/articles/[id]` | GET | 文章详情 | - |
| `/api/articles/[id]/like` | POST | 点赞 | body: {} (IP去重) |
| `/api/categories` | GET | 分类列表 | - |
| `/api/tags` | GET | 标签列表 | - |
| `/api/comments` | POST | 提交评论 | body: { content, nickname, email?, articleId, parentId? } |
| `/api/projects` | GET | 项目列表 | - |
| `/api/stats` | POST | 访问统计 | body: { path, referrer? } |

### 管理接口 (需 ADMIN 认证)
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/articles` | POST | 创建文章 |
| `/api/articles/[id]` | PATCH | 更新文章 |
| `/api/articles/[id]` | DELETE | 删除文章 |
| `/api/comments/[id]` | PATCH | 审核评论 |
| `/api/comments/[id]` | DELETE | 删除评论 |
| `/api/projects` | POST | 创建项目 |
| `/api/projects/[id]` | PATCH/DELETE | 更新/删除项目 |

## 4. 认证

- NextAuth v4 Credentials Provider (已有)
- JWT 策略 + 7天过期
- 管理接口通过 `getServerSession` + role=ADMIN 验证
- 种子脚本创建默认管理员: admin@cyberblog.dev / admin123

## 5. 管理后台

| 路由 | 功能 |
|------|------|
| `/admin/login` | 登录页 |
| `/admin` | 仪表盘 (统计概览) |
| `/admin/articles` | 文章列表管理 |
| `/admin/articles/new` | Markdown 编辑器新建 |
| `/admin/articles/[id]/edit` | 编辑文章 |
| `/admin/comments` | 评论审核 |
| `/admin/projects` | 项目管理 |

## 6. 测试

- 框架: Vitest
- 范围: API 路由测试 (13个端点)
- Mock: Prisma 客户端隔离
- 目标覆盖率: ≥ 80%

## 7. 技术决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 编辑器 | Markdown 文本编辑器 | 轻量、适合技术博客、代码量少 |
| 数据库 | Neon PostgreSQL | 直接连接、部署时无需迁移 |
| 测试 | API 路由测试 | 性价比最高、确保后端逻辑正确 |
| 认证 | Credentials Provider | 简单直接、适合个人博客 |
