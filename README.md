# XIAO/WU — 个人数字品牌作品集

> 用代码把想法真正实现出来。

在校大学生周末（Cris）的个人数字品牌作品集系统。既是博客，也是职业名片，通过网站本身证明设计审美、工程能力与产品思维。

## 项目简介

本项目从"赛博朋克博客系统"升级为**极简高级科技风格个人作品集**，采用深黑底 + 荧光绿品牌色，融合鼠标跟随光斑、3D 倾斜卡片、无限跑马灯等高级交互，打造可写进简历的个人数字品牌。

- **线上地址**：[https://fantastic-adventure-gilt.vercel.app](https://fantastic-adventure-gilt.vercel.app)（Vercel，海外）/ Zeabur 部署后更新国内地址
- **GitHub**：[w020316/fantastic-adventure](https://github.com/w020316/fantastic-adventure)

## 安全特性

| 特性 | 说明 |
|------|------|
| 路由级鉴权 | `middleware.ts` 保护所有 `/admin/*` 页面（登录页除外），非 ADMIN token 重定向到登录页 |
| API 鉴权 | 写操作（POST/PATCH/DELETE）均由 `requireAdmin()` 校验 session，contact GET 不再裸奔 |
| 输入校验 | Zod schema 校验所有 API 入参（articles/categories/tags/comments/contact） |
| XSS 防护 | 评论内容、联系表单均经 `sanitizeText` / `escapeHtml` 转义，邮件 HTML 拼接也转义 |
| 限流 | 评论 5次/分钟、联系表单 5次/小时，Map 带大小上限（1000-2000）防内存泄漏 |
| 反垃圾 | 联系表单 honeypot 字段（前端 + 后端双重校验） |
| 密码安全 | bcryptjs 哈希存储，JWT session（7天） |

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) / React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| 数据库 | PostgreSQL (Neon) + Prisma ORM 6 |
| 认证 | NextAuth.js |
| 动画 | Framer Motion / CSS Animations |
| 邮件 | Resend |
| 部署 | Vercel（海外）/ Zeabur（国内访问优化） |
| 图标 | 内联 SVG |

## 核心功能

### 前台

| 页面 | 功能说明 |
|------|----------|
| `/` 首页 | 单页滚动作品集：Hero(鼠标光斑名称切换) → About → Capability(3D Tilt) → Projects(量化指标) → Articles → Contact(表单) |
| `/about` | 职业叙事：价值主张、数据指标、能力列表、职业时间轴、社交链接 |
| `/projects` | 项目展示：接入扩展字段（subtitle/impact/metrics），支持详情页 |
| `/articles` | 技术博客：Markdown 渲染、代码高亮、分类标签筛选 |
| `/articles/[slug]` | 文章详情：点赞、评论、书签、阅读历史 |
| `/bookmarks` | 书签收藏 |
| `/history` | 阅读历史 |

### 管理后台 `/admin`

| 模块 | 功能 |
|------|------|
| 仪表盘 | 站点统计概览 |
| 文章管理 | CRUD、Markdown 编辑、分类标签 |
| 分类标签 | 分类与标签管理 |
| 评论审核 | 评论审核与管理 |
| 项目管理 | 项目 CRUD，含 subtitle/impact/metrics 扩展字段 |
| 联系消息 | 联系表单提交记录查看、状态管理（新/已读/已回复/归档） |
| 站点资料 | 品牌信息、数据指标、社交链接、主题配置（品牌色/光斑开关） |
| 系统设置 | 密码修改 |

### API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/articles` | GET/POST | 文章列表与创建 |
| `/api/articles/[id]` | GET/PUT/DELETE | 文章详情与操作 |
| `/api/articles/[id]/like` | POST | 文章点赞 |
| `/api/projects` | GET/POST | 项目列表与创建 |
| `/api/projects/[id]` | GET/PUT/DELETE | 项目详情与操作 |
| `/api/contact` | POST/GET | 联系表单提交（Resend 邮件 + 入库）/ 消息列表 |
| `/api/contact/[id]` | PATCH/GET | 联系消息状态更新 / 单条详情 |
| `/api/profile` | GET/PUT | 站点资料获取与更新 |
| `/api/categories` | GET/POST | 分类管理 |
| `/api/tags` | GET/POST | 标签管理 |
| `/api/comments` | GET/POST | 评论管理 |
| `/api/auth/* | - | NextAuth 认证 |
| `/api/ai` | POST | AI 智能对话 |
| `/api/stats` | GET | 站点统计 |
| `/api/github` | GET | GitHub 数据 |
| `/feed.xml` | GET | RSS 订阅 |

## 数据模型

```
User          用户（管理员）
Article       文章
Category      分类
Tag           标签
Comment       评论
Project       项目（含 subtitle/impact/metrics/caseStudyUrl 扩展字段）
Capability    能力卡片（首页 Capability 区块）
ContactMessage 联系表单消息（NEW/READ/REPLIED/ARCHIVED）
SiteProfile   站点资料（品牌名/作者/定位/社交链接/主题配置）
```

## 设计系统

| Token | 值 | 用途 |
|-------|-----|------|
| 主背景 | `#0a0a0a` | 纯粹深黑 |
| 品牌色 | `#ccff00` | 荧光绿 |
| 卡片 | 半透明黑 + 细边框 | 轻盈高级 |
| 圆角 | 16px | 现代柔和 |
| 字体 | system-ui / mono | 系统字体回退 |

### 核心交互

- **鼠标跟随光斑**：全局荧光绿圆形光斑跟随鼠标（`SpotlightCursor`）
- **Hero 名称切换**：鼠标接近姓名时，中文名"周末"渐变为英文名"Cris"
- **3D 倾斜卡片**：Capability 区卡片随鼠标 3D 倾斜（`TiltCard`）
- **数字增长动画**：项目指标滚动入视口时数字递增（`CountUp`）
- **滚动入场**：各区块淡入+上滑（`SectionReveal`）
- **底部跑马灯**：Footer 技能标签无限滚动
- **减少运动偏好**：所有动画支持 `prefers-reduced-motion`

## 本地开发

### 环境要求

- Node.js 18+
- npm
- PostgreSQL 数据库（推荐 Neon）

### 环境变量

参考 `.env.example`，创建 `.env` 文件（生产环境在部署平台配置）：

```env
# 数据库（Neon / Supabase / Zeabur 内置 PostgreSQL）
DATABASE_URL="postgresql://用户名:密码@主机:5432/数据库名?sslmode=require"

# NextAuth 认证（必填）
NEXTAUTH_SECRET="用 openssl rand -base64 32 生成"
NEXTAUTH_URL="http://localhost:3000"

# 邮件服务（可选，不配置则联系表单仅入库）
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="onboarding@resend.dev"
CONTACT_EMAIL="1181264839@qq.com"
```

### 启动

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 推送数据库 Schema
npx prisma db push

# 填充种子数据
npx prisma db seed

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

### 管理员登录

- 地址：`/admin/login`
- 邮箱：`admin@xiaowu.dev`
- 密码：`admin123`
- **生产环境请立即修改密码**

## 部署

### 方案一：Vercel（海外访问，国内较慢）

1. Fork 或推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 配置环境变量（同上 `.env`）
4. 部署，Vercel 会自动执行 `prisma generate && next build`

### 方案二：Zeabur（国内访问优化，推荐）

Vercel 在国内访问速度慢且手机未翻墙可能打不开，Zeabur 有香港/东京节点，国内可直连。

1. 注册 [Zeabur](https://zeabur.com)（可用 GitHub 登录）
2. New Project → 选择 `fantastic-adventure` 仓库
3. Zeabur 自动识别 Next.js 框架，无需额外配置
4. 在服务的 Variables 页配置环境变量（同 `.env`）：
   - `DATABASE_URL`：可创建 Zeabur 内置 PostgreSQL，或继续用 Neon
   - `NEXTAUTH_SECRET`：生成随机密钥
   - `NEXTAUTH_URL`：改为 Zeabur 分配的域名（如 `https://xxx.zeabur.app`）
   - 可选：`RESEND_API_KEY` / `CONTACT_EMAIL` 等
5. 数据库初始化（在 Zeabur 的 Shell 中执行）：
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
6. 部署完成后用 Zeabur 分配的 `xxx.zeabur.app` 域名访问，国内速度显著优于 Vercel

> **数据库选择**：Zeabur 内置 PostgreSQL（免费额度）或 [Neon](https://neon.tech)（免费 0.5GB，冷启动快）均可，二选一。

### 数据库

推荐使用 [Neon](https://neon.tech) PostgreSQL，免费额度足够个人作品集使用。

## 项目结构

```
src/
├── app/
│   ├── (main)/           # 前台路由组（含 Header/Footer/AIChat）
│   │   ├── about/        # 关于我
│   │   ├── articles/     # 文章列表与详情
│   │   ├── bookmarks/    # 书签
│   │   ├── history/      # 阅读历史
│   │   ├── home/         # 已重定向到 /
│   │   ├── projects/     # 项目展示
│   │   └── skills/       # 技能展示
│   ├── admin/            # 管理后台
│   │   ├── articles/     # 文章管理
│   │   ├── categories/   # 分类管理
│   │   ├── comments/     # 评论审核
│   │   ├── messages/     # 联系消息
│   │   ├── profile/      # 站点资料
│   │   ├── projects/     # 项目管理
│   │   └── settings/     # 系统设置
│   ├── api/              # API 路由
│   ├── layout.tsx        # 根布局
│   ├── page.tsx          # 首页（单页作品集）
│   ├── globals.css       # 全局样式与设计系统
│   ├── sitemap.ts        # 站点地图
│   ├── not-found.tsx     # 404 页面
│   └── robots.ts         # 爬虫规则
├── components/
│   ├── landing/          # 首页区块组件
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── CapabilitySection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ArticlesSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── SpotlightCursor.tsx
│   ├── ui/               # 通用 UI 组件
│   │   ├── TiltCard.tsx
│   │   ├── CountUp.tsx
│   │   └── SectionReveal.tsx
│   └── layout/           # 布局组件
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── prisma.ts         # Prisma 客户端
│   ├── api.ts            # API 工具函数
│   ├── auth-guard.ts     # requireAdmin 鉴权工具
│   ├── validations.ts    # Zod 校验 schema
│   └── utils.ts          # 通用工具
└── middleware.ts         # 路由鉴权中间件（保护 /admin/*）
prisma/
├── schema.prisma         # 数据模型
└── seed.ts               # 种子数据
.env.example              # 环境变量示例
```

## 真实项目展示

本作品集展示了以下真实项目：

| 项目 | 技术栈 | 链接 |
|------|--------|------|
| 个人数字品牌作品集（本站） | Next.js 15 / React 19 / Prisma | [GitHub](https://github.com/w020316) |
| YOLO 食品安全检测系统 | Python / YOLO / OpenCV | [Demo](https://w020316.github.io/YOLO-/) / [GitHub](https://github.com/w020316/YOLO-) |
| 情侣日记 xiaoling-rij | Next.js / TypeScript / Prisma | [Demo](https://xiaoling-rij.vercel.app) / [GitHub](https://github.com/w020316/xiaoling-rij) |

## 版本历史

- **v2.0** — 重构为 XIAO/WU 个人数字品牌作品集（极简高级科技风格）
- **v1.0** — CyberBlog 赛博朋克博客系统

## License

MIT
