/**
 * 技术文章种子数据
 * 覆盖前端、后端、全栈、AI 四个方向
 * 运行方式: npx tsx prisma/seed-articles.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(' 开始导入技术文章...')

  // 确保管理员存在
  const admin = await prisma.user.findUnique({ where: { email: 'admin@xiaowu.dev' } })
  if (!admin) {
    console.error('❌ 管理员账号不存在，请先运行 seed.ts')
    process.exit(1)
  }

  // 确保分类存在
  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: { name: '技术', slug: 'tech', description: '技术文章与教程' },
  })

  // 确保标签存在
  const tagNames = [
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'React', slug: 'react' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Tailwind CSS', slug: 'tailwindcss' },
    { name: 'Prisma', slug: 'prisma' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'Vue', slug: 'vue' },
    { name: 'CSS', slug: 'css' },
    { name: 'Python', slug: 'python' },
    { name: 'AI', slug: 'ai' },
    { name: 'RAG', slug: 'rag' },
    { name: 'LLM', slug: 'llm' },
    { name: 'YOLO', slug: 'yolo' },
    { name: 'OpenCV', slug: 'opencv' },
    { name: 'Java', slug: 'java' },
    { name: 'Spring Boot', slug: 'springboot' },
    { name: 'MySQL', slug: 'mysql' },
    { name: 'Docker', slug: 'docker' },
    { name: 'GitHub Actions', slug: 'github-actions' },
    { name: 'Vercel', slug: 'vercel' },
    { name: 'Fly.io', slug: 'flyio' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'Redis', slug: 'redis' },
    { name: 'JWT', slug: 'jwt' },
    { name: 'Zod', slug: 'zod' },
    { name: 'Framer Motion', slug: 'framer-motion' },
    { name: 'Vite', slug: 'vite' },
    { name: 'Pinia', slug: 'pinia' },
    { name: 'PyTorch', slug: 'pytorch' },
    { name: 'ChromaDB', slug: 'chromadb' },
  ]

  const tags = await Promise.all(
    tagNames.map((t) =>
      prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })
    )
  )
  console.log(`✅ 标签: ${tags.length}`)

  const articlesData = [
    // ===== 前端方向 =====
    {
      title: 'React 19 新特性实战：use() Hook 与 Server Actions',
      slug: 'react-19-new-features',
      excerpt: '深入解析 React 19 带来的 use() Hook、Server Actions、useOptimistic 等新特性，结合项目实战演示如何落地使用。',
      content: `# React 19 新特性实战

React 19 带来了多项重要更新，本文结合项目实战逐一解析。

## use() Hook

\`use()\` 是 React 19 新增的 Hook，可以在渲染期间读取 Promise 和 Context。

\`\`\`typescript
function ArticleDetail({ id }: { id: string }) {
  const article = use(fetchArticle(id))
  return <div>{article.title}</div>
}
\`\`\`

### 使用注意事项

1. \`use()\` 只能在组件顶层或条件语句之前调用
2. 配合 Suspense 使用，自动处理加载状态
3. 错误边界会捕获 \`use()\` 抛出的异常

## Server Actions

Server Actions 让客户端组件可以直接调用服务端函数：

\`\`\`typescript
// app/actions.ts
'use server'

export async function likeArticle(id: string) {
  await db.article.update({
    where: { id },
    data: { likes: { increment: 1 } },
  })
}

// 客户端组件
import { likeArticle } from '@/app/actions'

function LikeButton({ id }: { id: string }) {
  return <button onClick={() => likeArticle(id)}>点赞</button>
}
\`\`\`

## useOptimistic

乐观更新让交互更流畅：

\`\`\`typescript
function CommentForm({ articleId }: { articleId: string }) {
  const [comments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state, newComment: Comment) => [...state, { ...newComment, pending: true }]
  )

  async function handleSubmit(formData: FormData) {
    const content = formData.get('content') as string
    addOptimisticComment({ id: 'temp', content, pending: true })
    await submitComment({ content, articleId })
  }
}
\`\`\`

## 项目中的实际应用

在 CyberBlog 项目中，我们使用了：
- \`use()\` 读取文章数据
- Server Actions 处理点赞和评论
- \`useOptimistic\` 实现评论的乐观更新

> React 19 的更新让全栈开发更加流畅，减少了客户端与服务端之间的胶水代码。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 42,
      views: 256,
      publishedAt: new Date('2026-06-20'),
      tagSlugs: ['react', 'typescript', 'nextjs'],
    },
    {
      title: 'Vue 3 Composition API 最佳实践',
      slug: 'vue3-composition-api-best-practices',
      excerpt: '从 Options API 到 Composition API 的迁移指南，涵盖 \`<script setup>\`、Pinia 状态管理、自定义 Hook 等核心模式。',
      content: `# Vue 3 Composition API 最佳实践

## 为什么选择 Composition API

Composition API 解决了 Options API 的几个痛点：
1. 逻辑复用困难（mixin 的命名冲突）
2. 相关代码分散在不同选项中
3. TypeScript 支持不够友好

## \`<script setup>\` 语法糖

\`\`\`vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'

const store = useCourseStore()
const searchQuery = ref('')

const filteredCourses = computed(() =>
  store.courses.filter(c => c.name.includes(searchQuery.value))
)

onMounted(() => {
  store.fetchCourses()
})
</script>

<template>
  <input v-model="searchQuery" placeholder="搜索课程..." />
  <ul>
    <li v-for="course in filteredCourses" :key="course.id">
      {{ course.name }}
    </li>
  </ul>
</template>
\`\`\`

## Pinia 状态管理

\`\`\`typescript
// stores/course.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([])
  const loading = ref(false)

  const activeCourses = computed(() =>
    courses.value.filter(c => c.status === 'active')
  )

  async function fetchCourses() {
    loading.value = true
    try {
      const res = await fetch('/api/courses')
      courses.value = await res.json()
    } finally {
      loading.value = false
    }
  }

  return { courses, loading, activeCourses, fetchCourses }
})
\`\`\`

## 自定义 Composable

\`\`\`typescript
// composables/useDebounce.ts
import { ref, watch } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number) {
  const debouncedValue = ref(value.value)

  watch(value, (newVal) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newVal
    }, delay)

    return () => clearTimeout(timer)
  })

  return debouncedValue
}
\`\`\`

## 教材ING项目中的实践

在教材ING平台中，我们大量使用了 Composition API：
- 教材查询组件使用 \`useDebounce\` 实现搜索防抖
- 课程列表使用 Pinia 管理全局状态
- 用户认证使用 \`useAuth\` composable 封装

> Composition API 让 Vue 3 的代码组织更加灵活，特别适合复杂的企业级应用。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 38,
      views: 189,
      publishedAt: new Date('2026-06-15'),
      tagSlugs: ['vue', 'typescript', 'pinia', 'vite'],
    },
    {
      title: 'Tailwind CSS 4 迁移指南与实战技巧',
      slug: 'tailwindcss-4-migration-guide',
      excerpt: '从 Tailwind CSS 3 升级到 v4 的完整指南，涵盖 CSS 优先配置、自动内容检测、新语法适配及常见问题解决。',
      content: `# Tailwind CSS 4 迁移指南

## 主要变化

### CSS 优先配置

Tailwind CSS 4 将配置从 JavaScript 迁移到 CSS：

\`\`\`css
@import "tailwindcss";

@theme {
  --color-cyber-neon: #00ff9f;
  --color-cyber-pink: #ff0080;
  --font-display: 'Orbitron', sans-serif;
}
\`\`\`

### 自动内容检测

不再需要配置 \`content\` 数组，Tailwind 会自动扫描项目文件。

### 新语法

\`\`\`html
<!-- 旧语法 -->
<div class="bg-[#0a0a0f] text-[#00ff9f]">

<!-- 新语法（使用主题变量） -->
<div class="bg-cyber-surface text-cyber-neon">
\`\`\`

## 迁移步骤

1. 更新依赖版本
2. 将 \`tailwind.config.js\` 配置迁移到 CSS
3. 更新自定义工具类
4. 测试并修复兼容性问题

## CyberBlog 项目中的实践

\`\`\`css
@import "tailwindcss";

@theme {
  --color-cyber-surface: #0a0a0f;
  --color-cyber-neon: #00ff9f;
  --color-cyber-pink: #ff0080;
  --color-cyber-blue: #00d4ff;
  --color-cyber-yellow: #ffe600;
  --font-display: 'Orbitron', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* 自定义工具类 */
@utility cyber-card {
  @apply bg-cyber-surface/50 border border-cyber-border rounded-lg p-4
         backdrop-blur-sm transition-all duration-300;
  &:hover {
    @apply border-cyber-neon/50 shadow-[0_0_20px_rgba(0,255,159,0.1)];
  }
}
\`\`\`

> Tailwind CSS 4 的配置方式更加直观，CSS 原生变量让主题定制更加灵活。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 31,
      views: 167,
      publishedAt: new Date('2026-06-10'),
      tagSlugs: ['tailwindcss', 'css'],
    },

    // ===== 后端方向 =====
    {
      title: 'Prisma ORM 数据建模最佳实践',
      slug: 'prisma-data-modeling-best-practices',
      excerpt: '从 Schema 设计到关系映射，从索引优化到迁移管理，全面掌握 Prisma 的数据建模技巧。',
      content: `# Prisma ORM 数据建模最佳实践

## Schema 设计原则

### 合理使用枚举

\`\`\`prisma
enum Role {
  USER
  ADMIN
}

enum PublishStatus {
  DRAFT
  PUBLISHED
}
\`\`\`

### 关系映射

\`\`\`prisma
model Article {
  id        String   @id @default(cuid())
  title     String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  category  Category? @relation(fields: [categoryId], references: [id])
  categoryId String?
  tags      ArticleTag[]
  comments  Comment[]
  likes     Int      @default(0)
  views     Int      @default(0)

  @@index([authorId])
  @@index([categoryId])
}
\`\`\`

### 多对多关系

\`\`\`prisma
model ArticleTag {
  articleId String
  tagId     String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
}
\`\`\`

## 索引优化

\`\`\`prisma
model Article {
  // ...
  status      PublishStatus @default(DRAFT)
  publishedAt DateTime?

  @@index([status, publishedAt])
  @@index([authorId])
}
\`\`\`

## 迁移管理

\`\`\`bash
# 创建迁移
npx prisma migrate dev --name add-article-views

# 应用迁移
npx prisma migrate deploy

# 重置数据库（开发环境）
npx prisma migrate reset
\`\`\`

## CyberBlog 项目中的实践

在 CyberBlog 中，我们设计了 13+ 个数据模型：
- User、Article、Category、Tag、Comment
- Project、SiteStats、SiteConfig、MusicTrack
- ArticleTag、Capability、Mood 等

> Prisma 的类型安全特性让数据库操作更加可靠，减少了运行时错误。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 33,
      views: 178,
      publishedAt: new Date('2026-06-05'),
      tagSlugs: ['prisma', 'postgresql', 'typescript'],
    },
    {
      title: 'Next.js API Routes 与 Serverless 架构',
      slug: 'nextjs-api-routes-serverless',
      excerpt: '深入理解 Next.js API Routes 的工作原理，掌握 Serverless 函数的最佳实践与性能优化技巧。',
      content: `# Next.js API Routes 与 Serverless 架构

## API Routes 基础

\`\`\`typescript
// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json({ articles })
}
\`\`\`

## 中间件与认证

\`\`\`typescript
// lib/auth-guard.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  }
  return null
}
\`\`\`

## 性能优化

### 缓存策略

\`\`\`typescript
export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
  })

  return NextResponse.json(
    { articles },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  )
}
\`\`\`

### 连接池管理

\`\`\`typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 优雅关闭
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
})
\`\`\`

## Vercel Serverless 限制

- 函数执行时间：10 秒（Hobby）/ 60 秒（Pro）
- 请求体大小：4.5 MB
- 响应大小：4.5 MB

> 对于长时间运行的任务，建议使用队列（如 Upstash QStash）或边缘函数。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 29,
      views: 145,
      publishedAt: new Date('2026-06-01'),
      tagSlugs: ['nextjs', 'nodejs', 'vercel'],
    },

    // ===== 全栈方向 =====
    {
      title: '从 0 到 1 构建全栈博客系统',
      slug: 'build-fullstack-blog-from-scratch',
      excerpt: '完整记录 CyberBlog 从技术选型、数据库设计、API 开发到部署上线的全过程，涵盖 Next.js 15、Prisma、Neon PostgreSQL 等技术栈。',
      content: `# 从 0 到 1 构建全栈博客系统

## 技术选型

| 层级 | 技术 | 选择理由 |
|------|------|----------|
| 前端 | Next.js 15 | App Router、SSR/SSG、Server Components |
| 样式 | Tailwind CSS 4 | 原子化 CSS、快速开发 |
| 数据库 | Neon PostgreSQL | Serverless Postgres、免费额度 |
| ORM | Prisma 6 | 类型安全、迁移管理 |
| 认证 | NextAuth.js | 支持多种 Provider |
| 部署 | Fly.io | 免费香港节点、国内访问优化 |

## 数据库设计

\`\`\`prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  role     Role   @default(USER)
  articles Article[]
}

model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  status      PublishStatus @default(DRAFT)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  tags        ArticleTag[]
  comments    Comment[]
  likes       Int      @default(0)
  views       Int      @default(0)
  publishedAt DateTime?
}
\`\`\`

## 核心功能实现

### 文章列表 API

\`\`\`typescript
// app/api/articles/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')

  const where: any = { status: 'PUBLISHED' }
  if (category) where.category = { slug: category }
  if (tag) where.tags = { some: { tag: { slug: tag } } }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { author: true, category: true, tags: { include: { tag: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.article.count({ where }),
  ])

  return NextResponse.json({
    articles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
\`\`\`

## 部署到 Fly.io

\`\`\`bash
# 安装 flyctl
curl -L https://fly.io/install.sh | sh

# 创建应用
fly launch --name cyberblog --region hkg

# 设置环境变量
fly secrets set DATABASE_URL="..."
fly secrets set NEXTAUTH_SECRET="..."

# 部署
fly deploy
\`\`\`

## 经验总结

1. **先设计数据库，再写代码**：好的数据模型是成功的一半
2. **类型安全贯穿始终**：从数据库到前端，TypeScript 减少 80% 的运行时错误
3. **渐进式开发**：先实现核心功能，再逐步添加特性
4. **部署要早**：不要等到开发完成才考虑部署

> 全栈开发的核心不是掌握所有技术，而是理解各层级的协作方式。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 45,
      views: 289,
      publishedAt: new Date('2026-05-25'),
      tagSlugs: ['nextjs', 'prisma', 'postgresql', 'flyio', 'typescript'],
    },
    {
      title: 'Monorepo 架构实战：共享模块与构建优化',
      slug: 'monorepo-architecture-shared-modules',
      excerpt: '详解 Monorepo 项目中的模块共享策略、构建配置优化、以及 Vercel 部署时的路径映射问题解决方案。',
      content: `# Monorepo 架构实战

## 项目结构

\`\`\`
cyberblog/
├── client/          # Next.js 前端
├── server/          # Express/Koa 后端（可选）
├── shared/          # 共享模块
│   ├── src/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ── utils.ts
│   └── package.json
├── prisma/
── package.json
\`\`\`

## 共享模块配置

### shared/package.json

\`\`\`json
{
  "name": "@cyberblog/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
\`\`\`

### client/tsconfig.json

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "shared": ["../shared/src/index.ts"]
    }
  }
}
\`\`\`

### client/vite.config.ts

\`\`\`typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '../shared'),
    },
  },
})
\`\`\`

## Vercel 部署配置

\`\`\`json
{
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/.next",
  "rootDirectory": ".",
  "framework": "nextjs"
}
\`\`\`

## 常见问题

### TS2307: Cannot find module 'shared'

**原因**：Vercel 构建时找不到共享模块

**解决**：在 \`vercel.json\` 中设置 \`rootDirectory: "."\`

### 构建产物过大

**解决**：
1. 使用 \`tree-shaking\` 移除未使用代码
2. 动态导入大型依赖
3. 使用 \`@next/bundle-analyzer\` 分析包大小

> Monorepo 让代码复用更加高效，但需要仔细配置构建工具。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 27,
      views: 134,
      publishedAt: new Date('2026-05-20'),
      tagSlugs: ['typescript', 'vite', 'vercel'],
    },

    // ===== AI 方向 =====
    {
      title: 'YOLO 目标检测从训练到部署',
      slug: 'yolo-object-detection-training-deployment',
      excerpt: '完整记录 YOLO 食品安全检测系统的开发过程，涵盖数据集准备、模型训练、Web 界面开发及 GitHub Pages 部署。',
      content: `# YOLO 目标检测从训练到部署

## 项目背景

开发一个食品加工人员安全装备检测系统，实时识别是否佩戴安全帽、口罩、手套等。

## 数据集准备

\`\`\`python
# 数据集结构
dataset/
├── images/
│   ├── train/
│   └── val/
├── labels/
│   ├── train/
│   ── val/
└── data.yaml
\`\`\`

\`\`\`yaml
# data.yaml
train: ../images/train
val: ../images/val

nc: 5
names: ['helmet', 'mask', 'gloves', 'apron', 'boots']
\`\`\`

## 模型训练

\`\`\`python
from ultralytics import YOLO

# 加载预训练模型
model = YOLO('yolov8n.pt')

# 训练
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='food-safety-detection',
)

# 验证
metrics = model.val()
print(f"mAP50: {metrics.box.map50:.3f}")
print(f"mAP50-95: {metrics.box.map:.3f}")
\`\`\`

## Web 界面开发

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>YOLO 食品安全检测</title>
</head>
<body>
  <video id="video" autoplay></video>
  <canvas id="canvas"></canvas>
  <button onclick="startDetection()">开始检测</button>

  <script>
    async function startDetection() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      document.getElementById('video').srcObject = stream
    }
  </script>
</body>
</html>
\`\`\`

## GitHub Pages 部署

\`\`\`bash
# 构建静态文件
npm run build

# 推送到 gh-pages 分支
git subtree push --prefix dist origin gh-pages
\`\`\`

## 性能优化

1. **模型量化**：使用 INT8 量化减少模型大小
2. **WebGL 加速**：使用 TensorFlow.js 的 WebGL 后端
3. **帧率控制**：每 3 帧检测一次，保持 30 FPS

> YOLO 的目标检测能力让实时安全监控成为可能，从训练到部署的全流程实践非常有价值。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 52,
      views: 312,
      publishedAt: new Date('2026-05-15'),
      tagSlugs: ['python', 'yolo', 'opencv', 'pytorch'],
    },
    {
      title: 'RAG 知识库系统设计与实现',
      slug: 'rag-knowledge-base-system-design',
      excerpt: '基于 ChromaDB 和 DeepSeek API 构建 RAG 知识库系统，涵盖文档切分、向量存储、语义检索及流式响应实现。',
      content: `# RAG 知识库系统设计与实现

## 什么是 RAG

RAG（Retrieval-Augmented Generation）结合检索和生成，让 LLM 能够基于外部知识回答问题。

## 系统架构

\`\`\`
用户提问 → 问题向量化 → 检索相关文档 → 组装 Prompt → LLM 生成 → 流式返回
\`\`\`

## 文档处理

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

# 文档切分
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
)

chunks = splitter.split_documents(documents)

# 向量化
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5"
)
\`\`\`

## ChromaDB 向量存储

\`\`\`python
import chromadb

client = chromadb.Client()
collection = client.create_collection("knowledge-base")

# 存储文档
for i, chunk in enumerate(chunks):
    collection.add(
        documents=[chunk.page_content],
        metadatas=[{"source": chunk.metadata["source"]}],
        ids=[f"chunk-{i}"],
    )

# 检索
results = collection.query(
    query_texts=[user_question],
    n_results=5,
)
\`\`\`

## DeepSeek API 集成

\`\`\`typescript
async function generateAnswer(question: string, context: string) {
  const prompt = \`基于以下资料回答问题：

\${context}

问题：\${question}

请基于上述资料回答，如果资料中没有相关信息，请说明。\`

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.DEEPSEEK_API_KEY}\`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  return response
}
\`\`\`

## 流式响应

\`\`\`typescript
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\\n').filter(line => line.startsWith('data: '))

  for (const line of lines) {
    const data = JSON.parse(line.slice(6))
    if (data.choices?.[0]?.delta?.content) {
      // 流式输出内容
      yield data.choices[0].delta.content
    }
  }
}
\`\`\`

## 心语日记项目中的应用

在心语日记中，我们使用 RAG 实现：
- 基于用户历史日记的个性化回复
- 情绪感知与记忆管理
- 多智能体协作（情绪感知器、记忆管家、日记生成器）

> RAG 让 LLM 不再"胡编乱造"，而是基于真实知识回答问题。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 48,
      views: 267,
      publishedAt: new Date('2026-05-10'),
      tagSlugs: ['ai', 'rag', 'llm', 'chromadb', 'python'],
    },
    {
      title: '多智能体协作系统：从设计到实现',
      slug: 'multi-agent-collaboration-system',
      excerpt: '详解心语日记中的多智能体架构，包括情绪感知器、记忆管家、日记生成器、对话精灵的协作机制与实现细节。',
      content: `# 多智能体协作系统

## 为什么需要多智能体

单一 LLM 难以同时处理：
- 情绪识别
- 长期记忆管理
- 内容生成
- 对话交互

多智能体让每个 Agent 专注特定任务。

## 系统架构

\`\`\`
用户输入
    ↓
┌─────────────────┐
│  情绪感知器      │ → 识别用户情绪状态
└─────────────────┘
    ↓
┌─────────────────┐
│  记忆管家        │ → 检索相关历史记忆
└─────────────────┘
    ↓
┌─────────────────┐
│  日记生成器      │ → 生成个性化回复
└─────────────────┘
    ↓
┌─────────────────
│  对话精灵        │ → 优化对话体验
└─────────────────┘
    ↓
用户输出
\`\`\`

## 情绪感知器

\`\`\`typescript
interface EmotionResult {
  primary: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral'
  intensity: number // 0-1
  tags: string[]
}

async function detectEmotion(text: string): Promise<EmotionResult> {
  const prompt = \`分析以下文本的情绪：

\${text}

请返回 JSON 格式：
{
  "primary": "情绪类型",
  "intensity": 0.8,
  "tags": ["关键词1", "关键词2"]
}\`

  const response = await callLLM(prompt)
  return JSON.parse(response)
}
\`\`\`

## 记忆管家

\`\`\`typescript
interface Memory {
  id: string
  content: string
  emotion: string
  date: string
  tags: string[]
}

async function retrieveRelevantMemories(
  query: string,
  emotion: string,
  limit = 5
): Promise<Memory[]> {
  // 1. 向量检索
  const similar = await vectorDB.query(query, limit * 2)

  // 2. 情绪过滤
  const emotionMatched = similar.filter(
    m => m.emotion === emotion || m.emotion === 'neutral'
  )

  // 3. 时间衰减
  return emotionMatched
    .map(m => ({
      ...m,
      score: m.score * timeDecay(m.date),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
\`\`\`

## 日记生成器

\`\`\`typescript
async function generateDiaryResponse(
  input: string,
  emotion: EmotionResult,
  memories: Memory[]
): Promise<string> {
  const context = memories.map(m => m.content).join('\\n')

  const prompt = \`你是一个温暖的日记助手。

用户当前情绪：\${emotion.primary}（强度：\${emotion.intensity}）

相关记忆：
\${context}

用户输入：\${input}

请基于用户情绪和历史记忆，给出温暖、个性化的回复。\`

  return await callLLM(prompt)
}
\`\`\`

## 心语日记项目成果

- 4 个智能体协同工作
- 支持 6 种情绪识别
- 记忆检索准确率 85%+
- 用户满意度 4.8/5

> 多智能体系统让 AI 应用更加智能和个性化，是未来 AI 产品的重要方向。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 55,
      views: 334,
      publishedAt: new Date('2026-05-05'),
      tagSlugs: ['ai', 'llm', 'rag', 'typescript'],
    },

    // ===== 新增文章 =====
    {
      title: 'TypeScript 高级类型体操：从入门到实战',
      slug: 'typescript-advanced-type-gymnastics',
      excerpt: '深入理解 TypeScript 条件类型、映射类型、模板字面量类型等高级特性，通过实际案例掌握类型编程技巧。',
      content: `# TypeScript 高级类型体操

## 条件类型

条件类型让我们根据条件选择不同的类型：

\`\`\`typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false
\`\`\`

### 分布式条件类型

\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never

type Result = ToArray<string | number>
// Result: string[] | number[]
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

// 自定义：将所有属性变为 required
type Required<T> = {
  [P in keyof T]-?: T[P]
}
\`\`\`

## 模板字面量类型

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`
// "onClick" | "onFocus" | ...

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type APIRoute = \`/api/\${string}\`
type Endpoint = \`\${HTTPMethod} \${APIRoute}\`
// "GET /api/users" | "POST /api/articles" | ...
\`\`\`

## infer 关键字

\`\`\`typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// 提取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never
\`\`\`

## 实战：类型安全的 EventEmitter

\`\`\`typescript
type EventMap = Record<string, any>

interface TypedEmitter<T extends EventMap> {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void
  emit<K extends keyof T>(event: K, data: T[K]): void
}

// 使用
interface AppEvents {
  'user:login': { userId: string; name: string }
  'article:publish': { articleId: string; title: string }
}

const emitter: TypedEmitter<AppEvents> = ...
emitter.on('user:login', (data) => {
  console.log(data.userId) // 类型安全!
})
\`\`\`

> 类型体操不是炫技，而是让运行时错误在编译期被发现。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 36,
      views: 198,
      publishedAt: new Date('2026-06-25'),
      tagSlugs: ['typescript', 'react'],
    },
    {
      title: 'Next.js 15 App Router 深度解析',
      slug: 'nextjs-15-app-router-deep-dive',
      excerpt: '全面解析 Next.js 15 App Router 的 Server Components、Streaming SSR、并行路由等核心概念与最佳实践。',
      content: `# Next.js 15 App Router 深度解析

## Server Components vs Client Components

\`\`\`typescript
// Server Component（默认）
async function ArticleList() {
  const articles = await prisma.article.findMany()
  return <ul>{articles.map(a => <li key={a.id}>{a.title}</li>)}</ul>
}

// Client Component
'use client'
function LikeButton({ articleId }: { articleId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(true)}>Like</button>
}
\`\`\`

## 并行数据获取

\`\`\`typescript
async function ArticlePage({ slug }: { slug: string }) {
  // 并行获取文章和评论
  const [article, comments] = await Promise.all([
    fetchArticle(slug),
    fetchComments(slug),
  ])

  return (
    <>
      <ArticleContent article={article} />
      <CommentList comments={comments} />
    </>
  )
}
\`\`\`

## Streaming SSR

\`\`\`typescript
import { Suspense } from 'react'

function ArticlePage() {
  return (
    <div>
      <ArticleHeader />
      <Suspense fallback={<Skeleton />}>
        <ArticleContent />
      </Suspense>
      <Suspense fallback={<CommentSkeleton />}>
        <CommentSection />
      </Suspense>
    </div>
  )
}
\`\`\`

## 路由组与布局

\`\`\`
app/
├── (main)/           # 路由组（不影响 URL）
│   ├── layout.tsx    # 共享布局
│   ├── articles/
│   ├── projects/
│   └── about/
├── admin/            # 管理后台
│   └── layout.tsx    # 独立布局
└── api/              # API 路由
\`\`\`

## 性能优化技巧

1. **减少 Client Components**：只在需要交互时使用 \`'use client'\`
2. **使用 \`loading.tsx\`**：自动为路由创建加载状态
3. **利用 \`generateMetadata\`**：服务端生成 SEO 元数据
4. **图片优化**：使用 \`next/image\` 自动优化图片

> App Router 让服务端渲染回归，配合 React 19 的新特性，开发体验更上一层楼。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 40,
      views: 234,
      publishedAt: new Date('2026-06-22'),
      tagSlugs: ['nextjs', 'react', 'typescript'],
    },
    {
      title: 'Spring Boot 3 入门：构建 RESTful API',
      slug: 'spring-boot-3-restful-api',
      excerpt: '从零开始使用 Spring Boot 3 构建 RESTful API，涵盖项目创建、数据模型、CRUD 接口、异常处理及 Swagger 文档生成。',
      content: `# Spring Boot 3 入门：构建 RESTful API

## 项目初始化

使用 Spring Initializr 创建项目，选择依赖：
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Lombok

## 数据模型

\`\`\`java
@Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToMany
    @JoinTable(
        name = "article_tags",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    private int likes = 0;
    private int views = 0;
    private LocalDateTime publishedAt;
}
\`\`\`

## Repository 层

\`\`\`java
@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByStatusOrderByPublishedAtDesc(Status status);

    @Query("SELECT a FROM Article a WHERE a.title LIKE %:keyword%")
    List<Article> searchByTitle(@Param("keyword") String keyword);

    Page<Article> findByStatus(Status status, Pageable pageable);
}
\`\`\`

## Service 层

\`\`\`java
@Service
@RequiredArgsConstructor
public class ArticleService {
    private final ArticleRepository articleRepository;

    public Page<ArticleDTO> getArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        return articleRepository
            .findByStatus(Status.PUBLISHED, pageable)
            .map(this::toDTO);
    }

    public ArticleDTO getArticle(Long id) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
        article.setViews(article.getViews() + 1);
        articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO createArticle(CreateArticleRequest request) {
        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setAuthor(getCurrentUser());
        return toDTO(articleRepository.save(article));
    }
}
\`\`\`

## Controller 层

\`\`\`java
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(articleService.getArticles(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> detail(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getArticle(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArticleDTO> create(@Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.status(201).body(articleService.createArticle(request));
    }
}
\`\`\`

## 全局异常处理

\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.status(400)
            .body(new ErrorResponse(400, "Validation failed", errors));
    }
}
\`\`\`

> Spring Boot 3 配合 Java 17+ 的新特性，让后端开发更加高效。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 34,
      views: 201,
      publishedAt: new Date('2026-06-18'),
      tagSlugs: ['java', 'springboot', 'mysql'],
    },
    {
      title: 'Docker 容器化部署实战',
      slug: 'docker-container-deployment-guide',
      excerpt: '从 Dockerfile 编写到多容器编排，全面掌握 Docker 在实际项目中的部署方案，包括 Next.js 应用与 PostgreSQL 数据库的容器化。',
      content: `# Docker 容器化部署实战

## 为什么使用 Docker

- 环境一致性：开发、测试、生产环境完全相同
- 快速部署：一条命令启动整个应用
- 资源隔离：容器之间互不影响
- 易于扩展：配合编排工具实现弹性伸缩

## Dockerfile 编写

### Next.js 应用

\`\`\`dockerfile
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### Spring Boot 应用

\`\`\`dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

## docker-compose 编排

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - NEXTAUTH_SECRET=my-secret
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
\`\`\`

## 常用命令

\`\`\`bash
# 构建镜像
docker build -t myapp .

# 运行容器
docker run -d -p 3000:3000 myapp

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 进入容器
docker exec -it app sh

# 停止并清理
docker-compose down
\`\`\`

## 最佳实践

1. **多阶段构建**：减少最终镜像大小
2. **非 root 用户**：提高安全性
3. **健康检查**：确保容器正常运行
4. **环境变量**：不要将敏感信息写入镜像
5. **.dockerignore**：排除不必要的文件

> Docker 让部署变得可预测和可重复，是现代应用交付的基石。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 30,
      views: 176,
      publishedAt: new Date('2026-06-12'),
      tagSlugs: ['docker', 'nextjs', 'postgresql'],
    },
    {
      title: 'GitHub Actions CI/CD 自动化部署',
      slug: 'github-actions-cicd-automation',
      excerpt: '使用 GitHub Actions 构建完整的 CI/CD 流水线，实现代码提交后自动测试、构建、部署到 Fly.io/Vercel 等平台。',
      content: `# GitHub Actions CI/CD 自动化部署

## 基本概念

- **Workflow**：自动化流程，定义在 \`.github/workflows/\` 目录
- **Event**：触发事件，如 push、pull_request
- **Job**：工作流中的一组步骤
- **Step**：单个任务，可以是 Action 或命令
- **Action**：可复用的操作单元

## 基础工作流

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
\`\`\`

## 部署到 Fly.io

\`\`\`yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN }}
\`\`\`

## 部署到 Vercel

\`\`\`yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 多环境部署

\`\`\`yaml
name: Deploy

on:
  push:
    branches:
      - main      # 生产环境
      - staging   # 预发布环境

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ github.ref_name == 'main' && 'production' || 'staging' }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: |
          if [ "\${{ github.ref_name }}" = "main" ]; then
            echo "Deploying to production..."
          else
            echo "Deploying to staging..."
          fi
\`\`\`

## 安全最佳实践

1. **使用 Secrets**：敏感信息存储在 GitHub Secrets
2. **最小权限**：GITHUB_TOKEN 只授予必要权限
3. **固定版本**：使用 SHA 而非 tag 引用第三方 Action
4. **代码审查**：PR 必须经过审查才能合并

> CI/CD 让每次代码变更都经过自动化验证，大大降低了部署风险。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 28,
      views: 156,
      publishedAt: new Date('2026-06-08'),
      tagSlugs: ['github-actions', 'docker', 'flyio', 'vercel'],
    },
    {
      title: 'JWT 认证与 NextAuth.js 实战',
      slug: 'jwt-authentication-nextauth-guide',
      excerpt: '深入理解 JWT 认证原理，使用 NextAuth.js 实现完整的登录、注册、权限管理功能，包括 Token 刷新与安全防护。',
      content: `# JWT 认证与 NextAuth.js 实战

## JWT 原理

JWT（JSON Web Token）由三部分组成：

\`\`\`
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.signature
\`\`\`

### Header
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

### Payload
\`\`\`json
{
  "userId": "123",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
\`\`\`

## NextAuth.js 配置

\`\`\`typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.userId
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
\`\`\`

## 权限保护

### 服务端组件

\`\`\`typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return <div>Admin Content</div>
}
\`\`\`

### API 路由

\`\`\`typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  }

  // 处理请求...
}
\`\`\`

### 客户端组件

\`\`\`typescript
'use client'
import { useSession } from 'next-auth/react'

function AdminPanel() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Loading />
  if (!session) return <LoginPrompt />

  return <div>Welcome, {session.user.name}</div>
}
\`\`\`

## 中间件保护

\`\`\`typescript
// middleware.ts
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token?.role !== 'ADMIN') {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
\`\`\`

> 安全的认证系统是应用的基石，NextAuth.js 让认证实现变得简单而灵活。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 32,
      views: 187,
      publishedAt: new Date('2026-06-03'),
      tagSlugs: ['nextjs', 'jwt', 'typescript', 'nodejs'],
    },
    {
      title: 'Python 机器学习入门：从数据到模型',
      slug: 'python-machine-learning-introduction',
      excerpt: '使用 scikit-learn 从零开始构建机器学习模型，涵盖数据预处理、特征工程、模型训练、评估与调优的完整流程。',
      content: `# Python 机器学习入门

## 环境准备

\`\`\`bash
pip install numpy pandas scikit-learn matplotlib seaborn
\`\`\`

## 数据加载与探索

\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

# 加载数据
df = pd.read_csv('data.csv')

# 数据概览
print(df.head())
print(df.describe())
print(df.info())

# 可视化
plt.figure(figsize=(10, 6))
plt.scatter(df['feature1'], df['feature2'], c=df['target'], cmap='viridis')
plt.colorbar()
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.title('Data Distribution')
plt.show()
\`\`\`

## 数据预处理

\`\`\`python
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split

# 处理缺失值
df.fillna(df.median(), inplace=True)

# 编码分类变量
encoder = LabelEncoder()
df['category'] = encoder.fit_transform(df['category'])

# 分割训练集和测试集
X = df.drop('target', axis=1)
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 特征标准化
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
\`\`\`

## 模型训练

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

# 随机森林
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train_scaled, y_train)

# 逻辑回归
lr_model = LogisticRegression(max_iter=1000)
lr_model.fit(X_train_scaled, y_train)

# SVM
svm_model = SVC(kernel='rbf')
svm_model.fit(X_train_scaled, y_train)
\`\`\`

## 模型评估

\`\`\`python
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def evaluate_model(model, X_test, y_test, name):
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\\n{name}:")
    print(f"Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))

evaluate_model(rf_model, X_test_scaled, y_test, "Random Forest")
evaluate_model(lr_model, X_test_scaled, y_test, "Logistic Regression")
evaluate_model(svm_model, X_test_scaled, y_test, "SVM")
\`\`\`

## 超参数调优

\`\`\`python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5, 10],
}

grid_search = GridSearchCV(
    RandomForestClassifier(),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
)

grid_search.fit(X_train_scaled, y_train)
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.4f}")
\`\`\`

## 特征重要性

\`\`\`python
import numpy as np

# 获取特征重要性
importances = rf_model.feature_importances_
feature_names = X.columns

# 排序
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(10, 6))
plt.title('Feature Importances')
plt.bar(range(len(importances)), importances[indices])
plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=45)
plt.tight_layout()
plt.show()
\`\`\`

> 机器学习不是魔法，而是数据驱动的科学方法。理解数据比选择模型更重要。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 37,
      views: 213,
      publishedAt: new Date('2026-05-28'),
      tagSlugs: ['python', 'ai', 'pytorch'],
    },
    {
      title: 'Redis 缓存实战：提升 API 性能 10 倍',
      slug: 'redis-caching-performance-optimization',
      excerpt: '使用 Redis 实现 API 响应缓存、会话管理、排行榜等功能，掌握缓存穿透、雪崩、击穿的解决方案。',
      content: `# Redis 缓存实战

## 为什么使用 Redis

- **内存存储**：读写速度远超磁盘数据库
- **丰富数据结构**：String、Hash、List、Set、Sorted Set
- **过期机制**：自动清理过期数据
- **发布订阅**：实现实时消息

## 基本使用

\`\`\`typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// 设置缓存
await redis.set('article:123', JSON.stringify(article), 'EX', 3600)

// 获取缓存
const cached = await redis.get('article:123')
if (cached) return JSON.parse(cached)

// 删除缓存
await redis.del('article:123')
\`\`\`

## API 缓存中间件

\`\`\`typescript
async function cacheMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = \`api:\${req.originalUrl}\`

  const cached = await redis.get(key)
  if (cached) {
    return res.json(JSON.parse(cached))
  }

  // 保存原始 json 方法
  const originalJson = res.json.bind(res)

  res.json = (body: any) => {
    redis.set(key, JSON.stringify(body), 'EX', 60)
    return originalJson(body)
  }

  next()
}
\`\`\`

## 缓存策略

### Cache Aside（旁路缓存）

\`\`\`typescript
async function getArticle(id: string) {
  // 1. 先查缓存
  const cached = await redis.get(\`article:\${id}\`)
  if (cached) return JSON.parse(cached)

  // 2. 查数据库
  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) return null

  // 3. 写入缓存
  await redis.set(\`article:\${id}\`, JSON.stringify(article), 'EX', 3600)

  return article
}
\`\`\`

### Write Through（写穿透）

\`\`\`typescript
async function updateArticle(id: string, data: UpdateData) {
  // 同时更新数据库和缓存
  const [article] = await Promise.all([
    prisma.article.update({ where: { id }, data }),
    redis.set(\`article:\${id}\`, JSON.stringify(data), 'EX', 3600),
  ])
  return article
}
\`\`\`

## 常见问题解决

### 缓存穿透

查询不存在的数据，每次都打到数据库。

\`\`\`typescript
async function getArticle(id: string) {
  const cached = await redis.get(\`article:\${id}\`)
  if (cached === 'NULL') return null  // 缓存空值
  if (cached) return JSON.parse(cached)

  const article = await prisma.article.findUnique({ where: { id } })

  if (!article) {
    // 缓存空值，较短过期时间
    await redis.set(\`article:\${id}\`, 'NULL', 'EX', 60)
    return null
  }

  await redis.set(\`article:\${id}\`, JSON.stringify(article), 'EX', 3600)
  return article
}
\`\`\`

### 缓存雪崩

大量缓存同时过期，请求全部打到数据库。

\`\`\`typescript
// 过期时间加随机值，避免同时过期
const ttl = 3600 + Math.floor(Math.random() * 300)
await redis.set(key, value, 'EX', ttl)
\`\`\`

### 缓存击穿

热点 key 过期瞬间，大量并发请求打到数据库。

\`\`\`typescript
async function getHotArticle(id: string) {
  // 使用分布式锁
  const lock = await redis.set(\`lock:\${id}\`, '1', 'EX', 10, 'NX')

  if (!lock) {
    // 等待其他线程更新缓存
    await new Promise(r => setTimeout(r, 100))
    return getHotArticle(id)
  }

  try {
    const article = await prisma.article.findUnique({ where: { id } })
    await redis.set(\`article:\${id}\`, JSON.stringify(article), 'EX', 3600)
    return article
  } finally {
    await redis.del(\`lock:\${id}\`)
  }
}
\`\`\`

## 排行榜实现

\`\`\`typescript
// 添加分数
await redis.zadd('ranking', score, userId)

// 获取 Top 10
const top10 = await redis.zrevrange('ranking', 0, 9, 'WITHSCORES')

// 获取用户排名
const rank = await redis.zrevrank('ranking', userId)
\`\`\`

> Redis 是提升系统性能的利器，但要注意缓存与数据库的一致性。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 29,
      views: 167,
      publishedAt: new Date('2026-05-22'),
      tagSlugs: ['redis', 'nodejs', 'typescript'],
    },
    {
      title: 'React 性能优化：从理论到实践',
      slug: 'react-performance-optimization-guide',
      excerpt: '深入理解 React 渲染机制，掌握 useMemo、useCallback、React.memo、代码分割等性能优化技巧，让应用流畅如丝。',
      content: `# React 性能优化：从理论到实践

## React 渲染机制

当组件的 state 或 props 变化时，React 会重新渲染该组件及其子组件。理解这一点是优化的基础。

## React.memo

\`\`\`typescript
// 不使用 memo：父组件每次渲染都会导致子组件重新渲染
function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => <ExpensiveItem key={item.id} item={item} />)}
    </ul>
  )
}

// 使用 memo：props 不变时跳过渲染
const ExpensiveItem = React.memo(function ExpensiveItem({ item }: { item: Item }) {
  return <li>{/* 复杂的渲染逻辑 */}</li>
})
\`\`\`

## useMemo

\`\`\`typescript
function ArticleList({ articles, filter }: Props) {
  // 不使用 useMemo：每次渲染都重新计算
  // const filtered = articles.filter(a => a.category === filter)

  // 使用 useMemo：只在依赖变化时重新计算
  const filtered = useMemo(
    () => articles.filter(a => a.category === filter),
    [articles, filter]
  )

  return <ul>{filtered.map(a => <li key={a.id}>{a.title}</li>)}</ul>
}
\`\`\`

## useCallback

\`\`\`typescript
function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  // 不使用 useCallback：每次渲染创建新函数，导致子组件重新渲染
  // const handleChange = (e) => onSearch(e.target.value)

  // 使用 useCallback：函数引用稳定
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value),
    [onSearch]
  )

  return <input onChange={handleChange} />
}
\`\`\`

## 代码分割

\`\`\`typescript
import { lazy, Suspense } from 'react'

// 懒加载组件
const ArticleEditor = lazy(() => import('./ArticleEditor'))
const CommentSection = lazy(() => import('./CommentSection'))

function ArticlePage() {
  return (
    <div>
      <ArticleHeader />
      <Suspense fallback={<Skeleton />}>
        <ArticleEditor />
      </Suspense>
      <Suspense fallback={<CommentSkeleton />}>
        <CommentSection />
      </Suspense>
    </div>
  )
}
\`\`\`

## 虚拟滚动

\`\`\`typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function LongList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              transform: \`translateY(\${virtualRow.start}px)\`,
              height: \`\${virtualRow.size}px\`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
\`\`\`

## 性能分析工具

1. **React DevTools Profiler**：记录和分析组件渲染时间
2. **Lighthouse**：评估页面性能得分
3. **Web Vitals**：监控 LCP、FID、CLS 等核心指标

> 性能优化的核心原则：不要过早优化，先测量再优化。`,
      categoryId: techCategory.id,
      status: 'PUBLISHED' as const,
      likes: 35,
      views: 205,
      publishedAt: new Date('2026-05-18'),
      tagSlugs: ['react', 'typescript', 'framer-motion'],
    },
  ]

  // 导入文章
  for (const article of articlesData) {
    const { tagSlugs, ...articleData } = article

    // 查找标签
    const articleTags = await prisma.tag.findMany({
      where: { slug: { in: tagSlugs } },
    })

    await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {},
      create: {
        ...articleData,
        authorId: admin.id,
        tags: {
          create: articleTags.map((tag) => ({ tagId: tag.id })),
        },
      },
    })

    console.log(`  ✅ \${articleData.title}`)
  }

  console.log(`🎉 技术文章导入完成! 共 \${articlesData.length} 篇`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
