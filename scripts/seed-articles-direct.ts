/**
 * 直接通过 Prisma 创建技术文章（绕过 API 认证）
 * 运行方式: npx tsx scripts/seed-articles-direct.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(' 开始导入技术文章...\n')

  // 查找管理员
  const admin = await prisma.user.findUnique({ where: { email: 'admin@xiaowu.dev' } })
  if (!admin) {
    console.error(' 管理员不存在，请先运行 seed.ts')
    process.exit(1)
  }
  console.log(` 管理员: ${admin.email}`)

  // 确保分类存在
  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: { name: '技术', slug: 'tech', description: '技术文章与教程' },
  })

  // 确保标签存在
  const tagData = [
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
    tagData.map((t) =>
      prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })
    )
  )
  const tagMap = new Map(tags.map((t) => [t.slug, t.id]))
  console.log(` 标签: ${tags.length}`)

  const articlesData = [
    // ===== 前端方向 =====
    {
      title: 'React 19 新特性实战：use() Hook 与 Server Actions',
      slug: 'react-19-new-features',
      excerpt: '深入解析 React 19 带来的 use() Hook、Server Actions、useOptimistic 等新特性，结合项目实战演示如何落地使用。',
      content: `# React 19 新特性实战

## use() Hook

\`use()\` 是 React 19 新增的 Hook，可以在渲染期间读取 Promise 和 Context。

\`\`\`typescript
function ArticleDetail({ id }: { id: string }) {
  const article = use(fetchArticle(id))
  return <div>{article.title}</div>
}
\`\`\`

## Server Actions

Server Actions 让客户端组件可以直接调用服务端函数：

\`\`\`typescript
'use server'

export async function likeArticle(id: string) {
  await db.article.update({
    where: { id },
    data: { likes: { increment: 1 } },
  })
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

> React 19 的更新让全栈开发更加流畅，减少了客户端与服务端之间的胶水代码。`,
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
\`\`\`

## Pinia 状态管理

\`\`\`typescript
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

> Composition API 让 Vue 3 的代码组织更加灵活，特别适合复杂的企业级应用。`,
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
  --font-display: 'Orbitron', sans-serif;
}
\`\`\`

### 自动内容检测

不再需要配置 \`content\` 数组，Tailwind 会自动扫描项目文件。

## CyberBlog 项目中的实践

\`\`\`css
@import "tailwindcss";

@theme {
  --color-cyber-surface: #0a0a0f;
  --color-cyber-neon: #00ff9f;
  --font-display: 'Orbitron', sans-serif;
}
\`\`\`

> Tailwind CSS 4 的配置方式更加直观，CSS 原生变量让主题定制更加灵活。`,
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
enum Role { USER ADMIN }
enum PublishStatus { DRAFT PUBLISHED }
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
@@index([status, publishedAt])
@@index([authorId])
\`\`\`

> Prisma 的类型安全特性让数据库操作更加可靠，减少了运行时错误。`,
      tagSlugs: ['prisma', 'postgresql', 'typescript'],
    },
    {
      title: 'Next.js API Routes 与 Serverless 架构',
      slug: 'nextjs-api-routes-serverless',
      excerpt: '深入理解 Next.js API Routes 的工作原理，掌握 Serverless 函数的最佳实践与性能优化技巧。',
      content: `# Next.js API Routes 与 Serverless 架构

## API Routes 基础

\`\`\`typescript
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

## 连接池管理

\`\`\`typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
})
\`\`\`

> 对于长时间运行的任务，建议使用队列（如 Upstash QStash）或边缘函数。`,
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
| 部署 | Fly.io | 免费香港节点、国内访问优化 |

## 经验总结

1. **先设计数据库，再写代码**：好的数据模型是成功的一半
2. **类型安全贯穿始终**：从数据库到前端，TypeScript 减少 80% 的运行时错误
3. **渐进式开发**：先实现核心功能，再逐步添加特性
4. **部署要早**：不要等到开发完成才考虑部署

> 全栈开发的核心不是掌握所有技术，而是理解各层级的协作方式。`,
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
├── shared/          # 共享模块
│   └── src/
│       ├── types.ts
│       ├── constants.ts
│       └── utils.ts
├── prisma/
└── package.json
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

> Monorepo 让代码复用更加高效，但需要仔细配置构建工具。`,
      tagSlugs: ['typescript', 'vite', 'vercel'],
    },

    // ===== AI 方向 =====
    {
      title: 'YOLO 目标检测从训练到部署',
      slug: 'yolo-object-detection-training-deployment',
      excerpt: '完整记录 YOLO 食品安全检测系统的开发过程，涵盖数据集准备、模型训练、Web 界面开发及 GitHub Pages 部署。',
      content: `# YOLO 目标检测从训练到部署

## 数据集准备

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

model = YOLO('yolov8n.pt')
results = model.train(data='data.yaml', epochs=100, imgsz=640, batch=16)

metrics = model.val()
print(f"mAP50: {metrics.box.map50:.3f}")
\`\`\`

## 性能优化

1. **模型量化**：使用 INT8 量化减少模型大小
2. **WebGL 加速**：使用 TensorFlow.js 的 WebGL 后端
3. **帧率控制**：每 3 帧检测一次，保持 30 FPS

> YOLO 的目标检测能力让实时安全监控成为可能，从训练到部署的全流程实践非常有价值。`,
      tagSlugs: ['python', 'yolo', 'opencv', 'pytorch'],
    },
    {
      title: 'RAG 知识库系统设计与实现',
      slug: 'rag-knowledge-base-system-design',
      excerpt: '基于 ChromaDB 和 DeepSeek API 构建 RAG 知识库系统，涵盖文档切分、向量存储、语义检索及流式响应实现。',
      content: `# RAG 知识库系统设计与实现

## 系统架构

\`\`\`
用户提问 → 问题向量化 → 检索相关文档 → 组装 Prompt → LLM 生成 → 流式返回
\`\`\`

## 文档处理

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)
\`\`\`

## ChromaDB 向量存储

\`\`\`python
collection = client.create_collection("knowledge-base")
collection.add(documents=[chunk.page_content], ids=[f"chunk-{i}"])
results = collection.query(query_texts=[user_question], n_results=5)
\`\`\`

## 流式响应

\`\`\`typescript
const reader = response.body.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  // 解析 SSE 数据
}
\`\`\`

> RAG 让 LLM 不再"胡编乱造"，而是基于真实知识回答问题。`,
      tagSlugs: ['ai', 'rag', 'llm', 'chromadb', 'python'],
    },
    {
      title: '多智能体协作系统：从设计到实现',
      slug: 'multi-agent-collaboration-system',
      excerpt: '详解心语日记中的多智能体架构，包括情绪感知器、记忆管家、日记生成器、对话精灵的协作机制与实现细节。',
      content: `# 多智能体协作系统

## 系统架构

\`\`\`
用户输入 → 情绪感知器 → 记忆管家 → 日记生成器 → 对话精灵 → 用户输出
\`\`\`

## 情绪感知器

\`\`\`typescript
interface EmotionResult {
  primary: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral'
  intensity: number
  tags: string[]
}

async function detectEmotion(text: string): Promise<EmotionResult> {
  const response = await callLLM(\`分析以下文本的情绪：\${text}\`)
  return JSON.parse(response)
}
\`\`\`

## 记忆管家

\`\`\`typescript
async function retrieveRelevantMemories(
  query: string, emotion: string, limit = 5
): Promise<Memory[]> {
  const similar = await vectorDB.query(query, limit * 2)
  return similar.filter(m => m.emotion === emotion).slice(0, limit)
}
\`\`\`

> 多智能体系统让 AI 应用更加智能和个性化，是未来 AI 产品的重要方向。`,
      tagSlugs: ['ai', 'llm', 'rag', 'typescript'],
    },
  ]

  let created = 0
  let skipped = 0

  for (const article of articlesData) {
    // 检查是否已存在
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } })
    if (existing) {
      console.log(`  跳过(已存在): ${article.title}`)
      skipped++
      continue
    }

    const tagIds = article.tagSlugs
      .map((slug) => tagMap.get(slug))
      .filter(Boolean) as string[]

    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: 'PUBLISHED',
        authorId: admin.id,
        categoryId: techCategory.id,
        publishedAt: new Date(),
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    })

    console.log(`  创建成功: ${article.title}`)
    created++
  }

  console.log(`\n 完成! 创建: ${created}, 跳过: ${skipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
