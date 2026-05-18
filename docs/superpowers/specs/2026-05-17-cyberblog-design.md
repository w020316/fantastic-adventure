# CyberBlog - 赛博朋克个人博客系统设计文档

> 日期: 2026-05-17
> 仓库: https://github.com/w020316/fantastic-adventure
> 定位: 综合型个人博客（技术文章 + 生活随笔 + 作品展示），开源项目，简历项目

## 1. 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 15.x | App Router + RSC + API Routes |
| 语言 | TypeScript | 5.x | 全栈类型安全 |
| 数据库 | PostgreSQL (Neon) | - | Serverless PG |
| ORM | Prisma | 6.x | Schema建模 + 迁移 + 查询 |
| 认证 | NextAuth.js | v5 | GitHub OAuth + Credentials |
| 样式 | Tailwind CSS | 4.x | 赛博朋克主题 |
| 动画 | tsParticles + Framer Motion | - | 粒子爆聚 + 页面过渡 |
| Markdown | react-markdown + rehype | - | 文章渲染 + 代码高亮 |
| 部署 | Vercel + Neon | - | 前后端一体部署 |

## 2. 视觉设计 - 赛博朋克风

### 2.1 配色系统

```
--cyber-bg:        #0a0a0f       深空黑（主背景）
--cyber-surface:   #12121a       暗面（卡片/面板）
--cyber-border:    #1e1e2e       边框
--cyber-neon:      #00ff9f       霓虹绿（主强调色）
--cyber-neon-pink: #ff0080       霓虹粉（次强调色）
--cyber-neon-blue: #00d4ff       霓虹蓝（信息色）
--cyber-neon-yellow:#ffe600      霓虹黄（警告色）
--cyber-text:      #e0e0e0       主文字
--cyber-text-dim:  #6b7280       次文字
--cyber-glow:      rgba(0,255,159,0.15) 霓虹辉光
```

### 2.2 字体

- 标题: `Orbitron` (科幻感无衬线)
- 正文: `Inter` (清晰易读)
- 代码: `JetBrains Mono` (等宽)

### 2.3 视觉特效

- 霓虹辉光边框 (box-shadow + text-shadow)
- 故障艺术文字效果 (clip-path + transform)
- 扫描线叠加 (repeating-linear-gradient)
- 玻璃拟态面板 (backdrop-filter: blur)
- 矩阵网格背景 (CSS grid pattern)

## 3. 开场动画 - 粒子爆聚

### 3.1 动画序列

1. **Phase 1 (0-1s)**: 全屏黑色，数百个霓虹粒子从屏幕四周飞入
2. **Phase 2 (1-2s)**: 粒子在屏幕中心汇聚，越来越密集
3. **Phase 3 (2-2.5s)**: 中心爆发闪光，粒子散开
4. **Phase 4 (2.5-3.5s)**: 闪光消散，网站标题以故障艺术效果显现
5. **Phase 5 (3.5-4s)**: 整个开场层淡出，主页内容淡入

### 3.2 技术实现

- tsParticles 引擎，自定义粒子行为
- sessionStorage 控制只显示一次
- CSS transition 处理淡入淡出

## 4. 数据库设计

### 4.1 Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?
  role          Role      @default(USER)
  avatar        String?
  bio           String?
  articles      Article[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

model Article {
  id            String       @id @default(cuid())
  title         String
  slug          String       @unique
  excerpt       String?
  content       String       @db.Text
  coverImage    String?
  status        PublishStatus @default(DRAFT)
  author        User         @relation(fields: [authorId], references: [id])
  authorId      String
  category      Category?    @relation(fields: [categoryId], references: [id])
  categoryId    String?
  tags          ArticleTag[]
  comments      Comment[]
  likes         Int          @default(0)
  views         Int          @default(0)
  publishedAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([status, publishedAt])
  @@index([authorId])
}

enum PublishStatus {
  DRAFT
  PUBLISHED
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  articles    Article[]
  createdAt   DateTime  @default(now())
}

model Tag {
  id        String       @id @default(cuid())
  name      String       @unique
  slug      String       @unique
  articles  ArticleTag[]
  createdAt DateTime     @default(now())
}

model ArticleTag {
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId String
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId     String

  @@id([articleId, tagId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  nickname  String
  email     String?
  avatar    String?
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId String
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  parentId  String?
  replies   Comment[] @relation("CommentReplies")
  ip        String?
  status    CommentStatus @default(PENDING)
  createdAt DateTime @default(now())

  @@index([articleId, status])
}

enum CommentStatus {
  PENDING
  APPROVED
  HIDDEN
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  coverImage  String?
  demoUrl     String?
  repoUrl     String?
  techStack   String[]
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteStats {
  id        String   @id @default(cuid())
  path      String
  ip        String?
  referrer  String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([createdAt])
}

model SiteConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
}
```

## 5. 页面结构

### 5.1 前台页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 英雄区 + 最新文章 + 精选项目 + 统计 |
| `/articles` | 文章列表 | 分页 + 分类筛选 + 标签筛选 + 搜索 |
| `/articles/[slug]` | 文章详情 | Markdown渲染 + TOC + 评论 + 点赞 |
| `/projects` | 作品集 | 项目卡片网格 + 技术栈标签 |
| `/about` | 关于我 | 个人介绍 + 技能 + 联系方式 |
| `/guestbook` | 留言板 | 访客留言（独立于文章评论） |

### 5.2 管理后台

| 路由 | 页面 | 说明 |
|------|------|------|
| `/admin` | 仪表盘 | 统计概览 + 快捷操作 |
| `/admin/articles` | 文章管理 | CRUD + Markdown编辑器 |
| `/admin/articles/new` | 新建文章 | 富文本编辑 + 实时预览 |
| `/admin/categories` | 分类管理 | CRUD |
| `/admin/tags` | 标签管理 | CRUD |
| `/admin/comments` | 评论管理 | 审核/隐藏/删除 |
| `/admin/projects` | 项目管理 | CRUD |
| `/admin/settings` | 站点设置 | 站点信息/SEO/主题 |

### 5.3 API Routes

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | * | NextAuth认证 |
| `/api/articles` | GET/POST | 文章列表/创建 |
| `/api/articles/[id]` | GET/PATCH/DELETE | 文章详情/更新/删除 |
| `/api/articles/[id]/like` | POST | 点赞 |
| `/api/categories` | GET/POST | 分类列表/创建 |
| `/api/tags` | GET/POST | 标签列表/创建 |
| `/api/comments` | GET/POST | 评论列表/创建 |
| `/api/comments/[id]` | PATCH/DELETE | 评论审核/删除 |
| `/api/projects` | GET/POST | 项目列表/创建 |
| `/api/projects/[id]` | PATCH/DELETE | 项目更新/删除 |
| `/api/upload` | POST | 图片上传 |
| `/api/stats` | POST/GET | 访问统计 |
| `/api/settings` | GET/PATCH | 站点配置 |

## 6. 项目目录结构

```
cyberblog/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── fonts/
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局(字体+主题+认证Provider)
│   │   ├── page.tsx            # 首页
│   │   ├── globals.css         # 赛博朋克主题CSS
│   │   ├── articles/
│   │   │   ├── page.tsx        # 文章列表
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 文章详情
│   │   ├── projects/
│   │   │   └── page.tsx        # 作品集
│   │   ├── about/
│   │   │   └── page.tsx        # 关于我
│   │   ├── guestbook/
│   │   │   └── page.tsx        # 留言板
│   │   ├── admin/
│   │   │   ├── layout.tsx      # 管理后台布局
│   │   │   ├── page.tsx        # 仪表盘
│   │   │   ├── articles/
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── comments/
│   │   │   ├── projects/
│   │   │   └── settings/
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── articles/route.ts
│   │       ├── articles/[id]/route.ts
│   │       ├── categories/route.ts
│   │       ├── tags/route.ts
│   │       ├── comments/route.ts
│   │       ├── comments/[id]/route.ts
│   │       ├── projects/route.ts
│   │       ├── projects/[id]/route.ts
│   │       ├── upload/route.ts
│   │       ├── stats/route.ts
│   │       └── settings/route.ts
│   ├── components/
│   │   ├── ui/                 # 通用UI组件
│   │   │   ├── CyberButton.tsx
│   │   │   ├── CyberCard.tsx
│   │   │   ├── NeonText.tsx
│   │   │   ├── GlitchText.tsx
│   │   │   ├── Scanline.tsx
│   │   │   └── GlassPanel.tsx
│   │   ├── layout/             # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── blog/               # 博客组件
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── animation/          # 动画组件
│   │   │   ├── ParticleIntro.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── FloatingParticles.tsx
│   │   └── admin/              # 管理组件
│   │       ├── DashboardStats.tsx
│   │       ├── ArticleEditor.tsx
│   │       └── AdminTable.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma客户端单例
│   │   ├── auth.ts             # NextAuth配置
│   │   ├── utils.ts            # 工具函数
│   │   └── validations.ts      # Zod schemas
│   └── hooks/
│       ├── useParticleIntro.ts
│       └── useScrollSpy.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 7. 核心交互效果

### 7.1 页面过渡动画
- 路由切换时: 故障艺术闪烁 → 新页面滑入
- Framer Motion AnimatePresence 控制

### 7.2 文章卡片悬停
- 霓虹边框从底部向上扫描
- 卡片微微上浮 + 辉光增强
- 标签以打字机效果逐个显现

### 7.3 代码块
- 终端风格标题栏 (文件名 + 三个霓虹圆点)
- 复制按钮点击后显示"已复制 ✓"
- 语法高亮使用霓虹配色

### 7.4 评论系统
- 新评论以扫描线效果从上到下显现
- 回复展开时有故障艺术微动画

### 7.5 滚动效果
- 视差背景 (矩阵网格缓慢移动)
- 元素进入视口时从下方滑入 + 辉光闪烁

## 8. 部署方案

| 服务 | 平台 | 免费额度 |
|------|------|----------|
| 应用 | Vercel | 100GB带宽/月, Serverless Functions |
| 数据库 | Neon | 0.5GB存储, 100K读/天 |
| 图片 | Vercel Blob / Cloudflare R2 | 250MB免费 |
| 域名 | Vercel 子域名 | .vercel.app 免费 |

### 环境变量

```
DATABASE_URL=            # Neon PostgreSQL 连接串
NEXTAUTH_SECRET=         # NextAuth 加密密钥
NEXTAUTH_URL=            # 站点URL
GITHUB_ID=               # GitHub OAuth App ID
GITHUB_SECRET=           # GitHub OAuth App Secret
ADMIN_EMAIL=             # 管理员邮箱
BLOB_READ_WRITE_TOKEN=   # Vercel Blob token
```

## 9. 开发里程碑

| 阶段 | 内容 | 交付物 |
|------|------|--------|
| M1 | 项目初始化 + Prisma Schema + NextAuth | 可运行的空壳 |
| M2 | 赛博朋克UI系统 + 粒子爆聚动画 | 视觉完整的前台 |
| M3 | 博客核心功能 (文章/评论/标签) | 可用的博客 |
| M4 | 管理后台 (文章编辑/评论审核) | 完整CMS |
| M5 | 部署 + SEO + 性能优化 | 上线运行 |
