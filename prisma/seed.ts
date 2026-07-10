import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始种子数据...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyberblog.dev' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@cyberblog.dev',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'CyberBlog 管理员',
    },
  })
  console.log('✅ 管理员账号:', admin.email)

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'tech' }, update: {}, create: { name: '技术', slug: 'tech', description: '技术文章与教程' } }),
    prisma.category.upsert({ where: { slug: 'life' }, update: {}, create: { name: '生活', slug: 'life', description: '生活随笔与感悟' } }),
    prisma.category.upsert({ where: { slug: 'works' }, update: {}, create: { name: '作品', slug: 'works', description: '项目与作品展示' } }),
    prisma.category.upsert({ where: { slug: 'essay' }, update: {}, create: { name: '随笔', slug: 'essay', description: '自由写作' } }),
  ])
  console.log('✅ 分类:', categories.length)

  const tagData = [
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'React', slug: 'react' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Tailwind CSS', slug: 'tailwindcss' },
    { name: 'Prisma', slug: 'prisma' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'CSS', slug: 'css' },
    { name: 'UI设计', slug: 'ui-design' },
    { name: '全栈', slug: 'fullstack' },
    { name: '数据库', slug: 'database' },
  ]
  const tags = await Promise.all(
    tagData.map((t) => prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t }))
  )
  console.log('✅ 标签:', tags.length)

  const articlesData = [
    {
      title: 'Next.js 16 新特性深度解析',
      slug: 'nextjs-16-features',
      excerpt: '探索 Next.js 16 带来的革命性变化，包括 Turbopack 稳定版、改进的 App Router 和全新的服务端组件模式。',
      content: `# Next.js 16 新特性深度解析\n\nNext.js 16 带来了许多令人兴奋的新特性。\n\n## Turbopack 稳定版\n\nTurbopack 终于达到了稳定状态，开发模式下的构建速度提升了 10 倍以上。\n\n\`\`\`typescript\nexport default {\n  turbopack: {\n    rules: { '*.md': { loaders: ['@mdx-js/loader'], type: 'javascript/auto' } },\n  },\n}\n\`\`\`\n\n## 改进的 App Router\n\nApp Router 在 Next.js 16 中得到了显著改进。\n\n## 服务端组件增强\n\n\`\`\`typescript\nasync function ArticleList() {\n  const articles = await db.article.findMany()\n  return <ul>{articles.map(a => <li key={a.id}>{a.title}</li>)}</ul>\n}\n\`\`\`\n\n> 建议所有 Next.js 项目尽快升级到 16 版本。`,
      categoryId: categories[0].id,
      status: 'PUBLISHED' as const,
      likes: 42,
      views: 256,
      publishedAt: new Date('2026-05-15'),
    },
    {
      title: '赛博朋克 UI 设计指南',
      slug: 'cyberpunk-ui-guide',
      excerpt: '从霓虹灯效到故障艺术，从玻璃拟态到扫描线，全面解析赛博朋克风格 UI 的设计原则与实现技巧。',
      content: `# 赛博朋克 UI 设计指南\n\n赛博朋克风格已经成为现代 Web 设计中一股不可忽视的力量。\n\n## 核心设计元素\n\n### 霓虹灯效\n\n\`\`\`css\n.neon-text {\n  color: #00ff9f;\n  text-shadow: 0 0 7px #00ff9f, 0 0 20px rgba(0, 255, 159, 0.15);\n}\n\`\`\`\n\n### 故障艺术\n\nGlitch 效果通过 clip-path 和 CSS 动画实现。\n\n### 玻璃拟态\n\n半透明背景配合 backdrop-filter: blur()。\n\n## 配色方案\n\n- 深色背景：#0a0a0f\n- 霓虹绿：#00ff9f\n- 霓虹粉：#ff0080`,
      categoryId: categories[0].id,
      status: 'PUBLISHED' as const,
      likes: 38,
      views: 189,
      publishedAt: new Date('2026-05-12'),
    },
    {
      title: '我的 2026 编程之旅',
      slug: 'my-2026-coding-journey',
      excerpt: '从 Vue 到 React，从 Monorepo 到 Next.js 全栈，记录我在 2026 年的技术成长与思考。',
      content: `# 我的 2026 编程之旅\n\n2026 年对我来说是技术转型的一年。\n\n## 起点：Vue + Express Monorepo\n\n最初的项目采用 Vue3 客户端 + Express 服务端的 Monorepo 架构。\n\n## 转折：Next.js 全栈\n\n采用 Next.js 全栈方案带来了：\n- 单一部署平台（Vercel）\n- 更好的 SSR 支持\n- 更简洁的项目结构\n\n> 最好的学习方式就是动手做一个完整的项目。`,
      categoryId: categories[1].id,
      status: 'PUBLISHED' as const,
      likes: 28,
      views: 134,
      publishedAt: new Date('2026-05-10'),
    },
    {
      title: 'React Server Components 实战笔记',
      slug: 'rsc-practical-notes',
      excerpt: '深入理解 React Server Components 的工作原理，掌握边界划分与数据获取的最佳实践。',
      content: `# React Server Components 实战笔记\n\n## 核心概念\n\n### Server Components（默认）\n\n\`\`\`typescript\nasync function ArticlePage() {\n  const article = await getArticle()\n  return <ArticleDetail article={article} />\n}\n\`\`\`\n\n### Client Components\n\n\`\`\`typescript\n'use client'\nimport { useState } from 'react'\n\nfunction LikeButton() {\n  const [liked, setLiked] = useState(false)\n  return <button onClick={() => setLiked(!liked)}>❤</button>\n}\n\`\`\`\n\n## 边界划分原则\n\n1. 交互组件 → Client Component\n2. 数据获取 → Server Component\n3. 纯展示 → Server Component`,
      categoryId: categories[0].id,
      status: 'PUBLISHED' as const,
      likes: 35,
      views: 201,
      publishedAt: new Date('2026-05-08'),
    },
    {
      title: 'Tailwind CSS 4 迁移完全指南',
      slug: 'tailwindcss-4-migration',
      excerpt: '从 Tailwind CSS 3 升级到 v4 的完整指南，涵盖配置迁移、新语法适配及常见问题解决。',
      content: `# Tailwind CSS 4 迁移完全指南\n\n## 主要变化\n\n### CSS 优先配置\n\n\`\`\`css\n@import "tailwindcss";\n\n@theme {\n  --color-cyber-neon: #00ff9f;\n  --font-display: 'Orbitron', sans-serif;\n}\n\`\`\`\n\n### 自动内容检测\n\n不再需要配置 content 数组。\n\n## 迁移步骤\n\n1. 更新依赖版本\n2. 将配置迁移到 CSS\n3. 更新自定义工具类\n4. 测试并修复兼容性问题`,
      categoryId: categories[0].id,
      status: 'PUBLISHED' as const,
      likes: 31,
      views: 167,
      publishedAt: new Date('2026-05-05'),
    },
    {
      title: '深夜代码与咖啡',
      slug: 'late-night-code-and-coffee',
      excerpt: '当城市沉睡，屏幕上的光标依然闪烁。关于深夜编程的那些事。',
      content: `# 深夜代码与咖啡\n\n凌晨两点，窗外的城市已经沉睡，只有屏幕上的光标还在闪烁。\n\n## 深夜的魔力\n\n不知道为什么，很多最好的代码都是在深夜写出来的。\n\n## 效率与健康的平衡\n\n1. 设置截止时间：最晚到凌晨 2 点\n2. 每隔 45 分钟站起来活动\n3. 保持充足的水分摄入\n4. 第二天适当补觉\n\n> 代码是写给人看的，顺便能在机器上运行。`,
      categoryId: categories[3].id,
      status: 'PUBLISHED' as const,
      likes: 25,
      views: 98,
      publishedAt: new Date('2026-05-03'),
    },
    {
      title: 'Prisma 6 数据建模最佳实践',
      slug: 'prisma-6-data-modeling',
      excerpt: '从 Schema 设计到关系映射，从索引优化到迁移管理，全面掌握 Prisma 6 的数据建模技巧。',
      content: `# Prisma 6 数据建模最佳实践\n\n## Schema 设计原则\n\n### 合理使用枚举\n\n\`\`\`prisma\nenum Role {\n  USER\n  ADMIN\n}\n\`\`\`\n\n### 关系映射\n\n\`\`\`prisma\nmodel Article {\n  id        String   @id @default(cuid())\n  title     String\n  author    User     @relation(fields: [authorId], references: [id])\n  tags      ArticleTag[]\n}\n\`\`\`\n\n### 索引优化\n\n\`\`\`prisma\n@@index([status, publishedAt])\n@@index([authorId])\n\`\`\``,
      categoryId: categories[0].id,
      status: 'PUBLISHED' as const,
      likes: 33,
      views: 178,
      publishedAt: new Date('2026-05-01'),
    },
    {
      title: '个人作品集从零搭建',
      slug: 'build-portfolio-from-scratch',
      excerpt: '从设计构思到代码实现，记录我搭建个人作品集网站的全过程。',
      content: `# 个人作品集从零搭建\n\n## 技术选型\n\n- **Next.js**：SSR/SSG 支持，SEO 友好\n- **Tailwind CSS**：快速实现自定义设计\n- **Prisma**：类型安全的数据库操作\n- **Vercel**：零配置部署\n\n## 设计决策\n\n### 视觉风格\n\n选择了赛博朋克风格：\n1. 技术感强\n2. 视觉冲击力大\n3. 动效丰富\n\n## 经验总结\n\n1. 先做设计，再写代码\n2. 组件化思维，复用为王\n3. 性能优化要贯穿始终`,
      categoryId: categories[2].id,
      status: 'PUBLISHED' as const,
      likes: 29,
      views: 145,
      publishedAt: new Date('2026-04-28'),
    },
    {
      title: '我的技术栈与专业能力全览',
      slug: 'my-tech-stack-and-skills',
      excerpt: '系统梳理我在前端、后端、AI应用、工程化部署等方向的技术栈与核心能力，以及项目实战中积累的面试加分项。',
      content: `# 我的技术栈与专业能力全览

> 本文系统梳理我在多个项目实战中沉淀的技术栈与核心能力，作为面试准备与自我复盘。

## 一、前端工程

### 核心技术栈

- **React 19 / Next.js 16**：App Router、Server Components、Streaming SSR、Server Actions
- **Vue 3.5**：Composition API、\`<script setup>\`、Pinia 状态管理
- **TypeScript 5.7**：泛型、类型推导、Zod 运行时校验
- **Tailwind CSS 4**：原子化 CSS、响应式设计、暗色模式
- **Vite 6**：极速 HMR、构建优化

### 专业能力

1. **性能优化**：Lighthouse 90+ 分，CLS/LCP/FID 全绿
2. **动效开发**：Framer Motion、CSS 关键帧、\`prefers-reduced-motion\` 适配
3. **可访问性**：ARIA 标签、键盘导航、焦点管理
4. **响应式设计**：移动优先、\`(hover: none)\` 媒体查询、触屏适配

## 二、后端架构

### 核心技术栈

- **Node.js**：Express/Koa 原生中间件、Next.js API Routes
- **Vercel Serverless Functions**：模块化拆分、冷启动优化
- **PostgreSQL (Neon)**：Serverless Postgres、连接池管理
- **Prisma ORM 6**：Schema 设计、关系映射、迁移管理、索引优化
- **JWT 认证**：bcryptjs 密码哈希、Token 刷新机制

### 专业能力

1. **API 设计**：RESTful 规范、Zod 参数校验、统一错误处理
2. **数据建模**：13+ 数据模型设计、多对多关系、级联删除
3. **安全防护**：\`requireAdmin\` 守卫、限流、输入消毒、蜜罐字段
4. **SIGTERM/SIGINT 信号处理**：优雅关闭数据库连接池

## 三、AI 应用

### 核心技术栈

- **LLM 集成**：DeepSeek API、Agnes AI、流式 SSE 推送
- **RAG 系统**：ChromaDB 向量存储、BGE 嵌入模型
- **多智能体协作**：情绪感知器、记忆管家、日记生成器、对话精灵

### 专业能力

1. **Prompt 工程**：结构化提示词、Few-shot 学习
2. **向量检索**：语义相似度匹配、上下文窗口管理
3. **实时交互**：SSE 进度推送、流式渲染

## 四、工程化与部署

### 核心技术栈

- **CI/CD**：GitHub Actions、自动化测试与部署
- **容器化**：Docker、Fly.io 部署（香港/东京节点）
- **监控告警**：Vercel Analytics、Fly.io 日志

### 专业能力

1. **多平台部署**：Vercel、Fly.io、GitHub Pages、Render
2. **Monorepo 管理**：shared 模块复用、\`vercel.json\` rootDirectory 配置
3. **国内访问优化**：免费香港节点、X-Real-IP 伪装解决海外API限制
4. **Windows 工程问题**：\`git worktree\` 创建干净构建上下文

## 五、面试加分项

### 1. 完整的全栈项目落地

- **教材ING平台**：Vue 3 + Vercel Serverless + Neon PostgreSQL，13个数据模型，11个API模块，已迭代至 v12.0
- **个人作品集**：Next.js 16 + Prisma + Fly.io，含 CMS 后台、博客、项目管理
- **YOLO 食品安全检测**：Python + OpenCV + PyTorch，从模型训练到 Web 部署全流程

### 2. 工程化深度实践

- 经历 41 次迭代提交的情侣日记应用（CI/CD 全自动化）
- 解决海外服务器网易云 API 中文编码问题（X-Real-IP 方案）
- 处理 Windows 文件系统权限导致的 Fly.io 构建失败（GitHub Actions Linux runner）

### 3. 技术广度与深度

- **前端**：React + Vue 双栈，精通 TypeScript 类型系统
- **后端**：Node.js + Serverless，精通 Prisma 数据建模
- **AI**：LLM + RAG + 多智能体，从 Prompt 到向量检索
- **运维**：多平台部署、CI/CD、监控告警

### 4. 设计审美与产品思维

- 赛博朋克设计系统：霓虹色、故障效果、Orbitron 字体
- 移动端适配：\`(hover: none)\` 媒体查询、触屏交互优化
- 无障碍设计：\`prefers-reduced-motion\`、ARIA 标签、键盘导航

## 六、持续学习方向

1. **React 19 新特性**：use() Hook、Actions、useOptimistic
2. **Next.js 16**：Turbopack 稳定版、改进的 App Router
3. **AI Agent 框架**：多智能体协作模式、工具调用
4. **边缘计算**：Cloudflare Workers、Vercel Edge Functions

---

> 技术栈是工具，解决问题才是核心。每个项目都是一次从想法到上线的完整旅程。`,
      categoryId: categories[0].id,
      status: 'PUBLISHED' as const,
      likes: 45,
      views: 289,
      publishedAt: new Date('2026-07-01'),
    },
  ]

  for (let i = 0; i < articlesData.length; i++) {
    const data = articlesData[i]
    const tagIndices = i === 0 ? [0, 1, 2] : i === 1 ? [6, 7] : i === 3 ? [1, 2] : i === 4 ? [3] : i === 6 ? [4, 9] : i === 7 ? [8, 7] : i === 8 ? [0, 1, 2, 3] : []
    await prisma.article.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        authorId: admin.id,
        tags: {
          create: tagIndices.map((ti) => ({ tagId: tags[ti].id })),
        },
      },
    })
  }
  console.log('✅ 文章:', articlesData.length)

  const projectsData = [
    {
      title: '个人数字品牌作品集',
      subtitle: '本站 · Next.js 16 全栈作品集系统',
      description: '基于 Next.js 16 App Router 的个人作品集系统，含 CMS 后台、博客、项目管理、联系表单。支持鼠标光斑、3D 倾斜卡片等高级交互，深色极简设计。',
      impact: '将个人项目沉淀为可复用的作品集系统，同时展示设计审美与工程能力',
      metrics: [
        { label: '技术栈', value: 0, display: 'Next.js' },
        { label: '页面数', value: 34, suffix: '+' },
        { label: 'Lighthouse', value: 90, suffix: '+' },
      ],
      demoUrl: 'https://fantastic-adventure.fly.dev',
      repoUrl: 'https://github.com/w020316/fantastic-adventure',
      caseStudyUrl: null,
      techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Prisma', 'Tailwind CSS 4'],
      featured: true,
      order: 0,
    },
    {
      title: 'YOLO 食品安全检测系统',
      subtitle: '基于 YOLO 的食品加工人员异常行为检测',
      description: '基于 YOLO 目标检测算法，实时识别食品加工人员是否佩戴安全装备、是否存在违规操作。含训练数据集、模型训练、Web 检测界面，已部署 GitHub Pages。',
      impact: '将计算机视觉算法落地为可用的安全检测产品，涵盖模型训练到 Web 部署全流程',
      metrics: [
        { label: '检测类别', value: 5, suffix: '+' },
        { label: 'mAP', value: 85, suffix: '%' },
        { label: '实时FPS', value: 30, suffix: '+' },
      ],
      demoUrl: 'https://w020316.github.io/YOLO-/',
      repoUrl: 'https://github.com/w020316/YOLO-',
      caseStudyUrl: null,
      techStack: ['Python', 'YOLO', 'OpenCV', 'PyTorch'],
      featured: true,
      order: 1,
    },
    {
      title: '情侣日记',
      subtitle: 'xiaoling-rij · Next.js 全栈情侣应用',
      description: '基于 Next.js 的情侣日记应用，支持日记撰写、天气定位、AI 智能互动。含 Prisma 数据库、Vercel 部署、GitHub Actions 自动化 CI/CD，经历 41 次迭代提交。',
      impact: '完整的全栈应用实践，从数据库设计到 CI/CD 自动化部署的端到端工程',
      metrics: [
        { label: '迭代次数', value: 41, suffix: '+' },
        { label: '版本', value: 2, suffix: '.5' },
        { label: '部署', value: 0, display: 'Vercel' },
      ],
      demoUrl: 'https://xiaoling-rij.vercel.app',
      repoUrl: 'https://github.com/w020316/xiaoling-rij',
      caseStudyUrl: null,
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'Vercel', 'GitHub Actions'],
      featured: true,
      order: 2,
    },
    {
      title: '教材ING智能教材查询与管理平台',
      subtitle: 'textbook-ing · Vue 3 全栈校园信息服务平台',
      description: '面向高校师生的校园信息服务平台，核心解决教材信息查询困难、教学日历不透明、校园资讯分散三大痛点。提供教材多维度查询、校历教学周查看、新闻资讯浏览等功能，配套用户注册登录、积分系统、消息通知等完整用户体验。含独立管理后台。',
      impact: '将分散的校园信息整合为统一平台，涵盖教材查询、校历、新闻、用户系统、积分、消息通知六大模块，从产品设计到上线部署的完整全栈实践',
      metrics: [
        { label: '版本', value: 12, suffix: '.0' },
        { label: '数据模型', value: 13, suffix: '+' },
        { label: 'API模块', value: 11, suffix: '+' },
      ],
      demoUrl: 'https://textbook-ing.vercel.app/',
      repoUrl: 'https://github.com/w020316/Textbook-ING-Smart-Textbook-Query-and-Management-Platform',
      caseStudyUrl: null,
      techStack: ['Vue 3.5', 'TypeScript', 'Vite 6', 'Pinia', 'TailwindCSS', 'Vercel Serverless', 'Prisma', 'Neon PostgreSQL', 'JWT', 'Zod'],
      featured: true,
      order: 3,
    },
    {
      title: 'AI 智能法律助手',
      subtitle: 'lawai · Spring Boot + Vue 全栈 AI 法律咨询系统',
      description: '基于 Spring Boot + Vue 3 的 AI 智能法律咨询系统，集成大语言模型提供专业法律问答、案例检索、法律条文解读。支持多轮对话、会话管理、SSE 流式响应、按时间分组浏览，配套 PostgreSQL 持久化与 Docker 容器化部署，GitHub Actions 自动构建镜像推送 ghcr.io。',
      impact: '将 AI 大模型能力与垂直领域法律知识结合，从需求分析、架构设计到云端部署的完整全栈 AI 应用实践',
      metrics: [
        { label: '对话轮次', value: 30, suffix: '+' },
        { label: '技术栈', value: 0, display: 'Spring+Vue' },
        { label: '部署', value: 0, display: 'Fly.io' },
      ],
      demoUrl: 'https://lawai-frontend.fly.dev/chat',
      repoUrl: 'https://github.com/w020316/ai-legal-assistant',
      caseStudyUrl: null,
      techStack: ['Java', 'Spring Boot', 'Vue 3', 'TypeScript', 'PostgreSQL', 'Docker', 'GitHub Actions', 'LLM', 'SSE'],
      featured: true,
      order: 4,
    },
  ]
  // 为每个项目生成 URL 友好的英文 id（中文标题用拼音/英文别名映射）
  const projectIdMap: Record<string, string> = {
    '个人数字品牌作品集': 'portfolio-site',
    'YOLO 食品安全检测系统': 'yolo-food-safety',
    '情侣日记': 'couple-diary',
    '教材ING智能教材查询与管理平台': 'textbook-ing',
    'AI 智能法律助手': 'ai-legal-assistant',
  }
  for (const p of projectsData) {
    const id = projectIdMap[p.title] || p.title.toLowerCase()
    await prisma.project.upsert({
      where: { id },
      update: {},
      create: { id, ...p },
    })
  }
  console.log('✅ 项目:', projectsData.length)

  const capabilitiesData = [
    {
      id: 'frontend',
      title: '前端工程',
      description: '构建高性能、可访问、体验流畅的现代 Web 界面，注重交互细节与动画质感。',
      icon: 'frontend',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      order: 0,
    },
    {
      id: 'backend',
      title: '后端架构',
      description: '设计可扩展的服务端架构，处理高并发场景，保障数据一致性与服务稳定性。',
      icon: 'backend',
      skills: ['Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'RESTful API'],
      order: 1,
    },
    {
      id: 'ai',
      title: 'AI 应用',
      description: '将大模型能力融入产品，构建智能交互体验，从 Prompt 工程到 RAG 系统落地。',
      icon: 'ai',
      skills: ['LLM', 'RAG', 'Prompt Engineering', 'Vector DB', 'AI Agent'],
      order: 2,
    },
    {
      id: 'devops',
      title: '工程化与部署',
      description: '搭建 CI/CD 流水线，容器化部署，监控告警，保障产品从开发到上线的全链路质量。',
      icon: 'devops',
      skills: ['Docker', 'GitHub Actions', 'Vercel', 'Nginx', 'Linux'],
      order: 3,
    },
  ]
  for (const c of capabilitiesData) {
    await prisma.capability.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    })
  }
  console.log('✅ 能力:', capabilitiesData.length)

  await prisma.siteProfile.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      brandName: 'XIAO/WU',
      authorNameCn: '周末',
      authorNameEn: 'Cris',
      tagline: '用代码把想法真正实现出来',
      role: '在校大学生 · 全栈开发实践者',
      bio: '在校大学生，通过独立项目实践全栈开发与AI应用。从 Vue 前端到 Next.js 全栈，从 Python 计算机视觉到 RAG 知识库，每个项目都是一次从想法到上线的完整实践。',
      location: 'China',
      email: '1181264839@qq.com',
      github: 'https://github.com/w020316',
      available: true,
      yearsExp: 2,
      projectCount: 8,
      userReach: '多领域',
      uptime: '99.9%',
      spotlightCursor: true,
      brandColor: '#ccff00',
    },
  })
  console.log('✅ 站点配置: main')

  // ========== 心情配置 ==========
  const moodsData = [
    { key: 'happy', name: '开心', icon: '😊', color: '#ffe600', description: '欢快明亮，让心情飞扬', order: 1 },
    { key: 'relaxed', name: '放松', icon: '🌿', color: '#00ff9f', description: '舒缓悠扬，身心舒展', order: 2 },
    { key: 'sad', name: '伤感', icon: '🌧', color: '#00d4ff', description: '低吟浅唱，治愈心灵', order: 3 },
    { key: 'energetic', name: '激情', icon: '⚡', color: '#ff0080', description: '热血澎湃，能量满满', order: 4 },
    { key: 'focused', name: '专注', icon: '🎯', color: '#ccff00', description: '深度聚焦，心流状态', order: 5 },
    { key: 'passionate', name: '浪漫', icon: '💜', color: '#a855f7', description: '温柔缱绻，情意绵绵', order: 6 },
  ]
  for (const m of moodsData) {
    await prisma.mood.upsert({
      where: { key: m.key },
      update: {},
      create: m,
    })
  }
  console.log('✅ 心情配置:', moodsData.length)

  // ========== 音乐曲目库 ==========
  // 全部使用 SoundHelix 公开 MP3（完整曲目，无版权限制）
  // 每首曲目关联心情，便于心情推荐
  const tracksData = [
    // ===== 国内热门 =====
    { title: '夜曲', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', mood: 'sad,passionate', isHot: true, order: 1 },
    { title: '青花瓷', artist: '周杰伦', category: 'pop', region: 'cn', duration: 238, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', mood: 'passionate,relaxed', isHot: true, order: 2 },
    { title: '七里香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 299, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', mood: 'passionate,happy', isHot: true, order: 3 },
    { title: '稻香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', mood: 'happy,relaxed', isHot: true, order: 4 },
    { title: '后来', artist: '刘若英', category: 'pop', region: 'cn', duration: 286, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', mood: 'sad,passionate', isHot: true, order: 5 },
    { title: '遇见', artist: '孙燕姿', category: 'pop', region: 'cn', duration: 255, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', mood: 'passionate,relaxed', isHot: true, order: 6 },
    { title: '光年之外', artist: '邓紫棋', category: 'pop', region: 'cn', duration: 235, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', mood: 'energetic,passionate', isHot: true, order: 7 },
    { title: '起风了', artist: '买辣椒也用券', category: 'pop', region: 'cn', duration: 325, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', mood: 'passionate,sad', isHot: true, order: 8 },
    { title: '赛博东风', artist: 'ElectronCN', category: 'electronic', region: 'cn', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', mood: 'energetic,focused', isHot: false, order: 9 },
    { title: '霓虹长城', artist: 'CyberHan', category: 'electronic', region: 'cn', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899', source: 'local', mood: 'energetic,focused', isHot: false, order: 10 },
    { title: '锦鲤抄', artist: '银临', category: 'guofeng', region: 'cn', duration: 268, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6', source: 'local', mood: 'relaxed,passionate', isHot: false, order: 11 },
    { title: '凉凉', artist: '张碧晨', category: 'guofeng', region: 'cn', duration: 295, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', mood: 'sad,relaxed', isHot: false, order: 12 },
    { title: '千千阙歌', artist: '陈慧娴', category: 'pop', region: 'cn', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover: '#f97316', source: 'local', mood: 'sad,passionate', isHot: false, order: 13 },
    { title: '海阔天空', artist: 'Beyond', category: 'rock', region: 'cn', duration: 326, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover: '#84cc16', source: 'local', mood: 'energetic,passionate', isHot: true, order: 14 },
    { title: '红玫瑰', artist: '陈奕迅', category: 'pop', region: 'cn', duration: 278, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover: '#a855f7', source: 'local', mood: 'passionate,sad', isHot: false, order: 15 },
    { title: '匆匆那年', artist: '王菲', category: 'pop', region: 'cn', duration: 302, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', cover: '#6366f1', source: 'local', mood: 'sad,relaxed', isHot: false, order: 16 },
    // ===== 国际热门 =====
    { title: 'Neon Pulse', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', mood: 'energetic,focused', isHot: true, order: 17 },
    { title: 'Data Stream', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 426, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', mood: 'focused,energetic', isHot: true, order: 18 },
    { title: 'Glitch City', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 304, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', mood: 'energetic', isHot: false, order: 19 },
    { title: 'Synth Wave', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 297, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', mood: 'focused,relaxed', isHot: false, order: 20 },
    { title: 'Midnight Code', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 391, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', mood: 'focused,relaxed', isHot: true, order: 21 },
    { title: 'Quiet Terminal', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 358, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', mood: 'relaxed,focused', isHot: false, order: 22 },
    { title: 'Deep Focus', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 412, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', mood: 'focused', isHot: true, order: 23 },
    { title: 'Overclock', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', mood: 'energetic', isHot: false, order: 24 },
    { title: 'High Voltage', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', mood: 'energetic,happy', isHot: false, order: 25 },
    { title: 'Turbo Mode', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 318, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899', source: 'local', mood: 'energetic', isHot: false, order: 26 },
    { title: 'Cyber Run', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 401, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6', source: 'local', mood: 'energetic,focused', isHot: false, order: 27 },
    { title: 'Final Compile', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 366, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', mood: 'focused,happy', isHot: false, order: 28 },
  ]
  // 使用 upsert 按 url 唯一性导入（避免重复）
  for (const t of tracksData) {
    const existing = await prisma.musicTrack.findFirst({ where: { url: t.url } })
    if (existing) {
      await prisma.musicTrack.update({ where: { id: existing.id }, data: t })
    } else {
      await prisma.musicTrack.create({ data: t })
    }
  }
  console.log('✅ 音乐曲目:', tracksData.length)

  console.log('🎉 种子数据完成!')
  console.log('📧 管理员:', admin.email, '/ 密码已设置 (请查看 .env 或使用默认密码)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
