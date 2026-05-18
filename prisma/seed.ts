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
  ]

  for (let i = 0; i < articlesData.length; i++) {
    const data = articlesData[i]
    const tagIndices = i === 0 ? [0, 1, 2] : i === 1 ? [6, 7] : i === 3 ? [1, 2] : i === 4 ? [3] : i === 6 ? [4, 9] : i === 7 ? [8, 7] : []
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
      title: 'CyberBlog',
      description: '赛博朋克风格全栈博客系统，基于 Next.js 16 + Prisma 6 + Tailwind CSS 4 构建，支持文章管理、评论系统、点赞互动等功能。',
      repoUrl: 'https://github.com/w020316/fantastic-adventure',
      techStack: ['Next.js', 'React', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
      featured: true,
      order: 1,
    },
    {
      title: 'NeuralDash',
      description: '数据可视化仪表盘，支持实时数据流展示、自定义图表配置和智能告警。',
      techStack: ['React', 'D3.js', 'WebSocket', 'Node.js'],
      featured: true,
      order: 2,
    },
    {
      title: 'PixelForge',
      description: '创意像素艺术生成器，支持多种生成算法、调色板自定义和导出功能。',
      techStack: ['TypeScript', 'Canvas API', 'Web Workers'],
      featured: false,
      order: 3,
    },
  ]
  for (const p of projectsData) {
    await prisma.project.upsert({
      where: { id: p.title.toLowerCase() },
      update: {},
      create: { id: p.title.toLowerCase(), ...p },
    })
  }
  console.log('✅ 项目:', projectsData.length)

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
