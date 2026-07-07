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
