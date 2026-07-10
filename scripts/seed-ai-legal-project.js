/**
 * 添加 AI 智能法律助手项目到数据库
 * 运行方式（在 Fly.io 容器中）: node scripts/seed-ai-legal-project.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始添加 AI 智能法律助手项目...\n')

  const projectData = {
    id: 'ai-legal-assistant',
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
  }

  const result = await prisma.project.upsert({
    where: { id: projectData.id },
    update: {
      title: projectData.title,
      subtitle: projectData.subtitle,
      description: projectData.description,
      impact: projectData.impact,
      metrics: projectData.metrics,
      demoUrl: projectData.demoUrl,
      repoUrl: projectData.repoUrl,
      techStack: projectData.techStack,
      featured: projectData.featured,
      order: projectData.order,
    },
    create: projectData,
  })

  console.log('✅ 项目创建/更新成功:', result.id, result.title)
  console.log('   Demo:', result.demoUrl)
  console.log('   Repo:', result.repoUrl)

  const totalProjects = await prisma.project.count()
  console.log(`\n📊 数据库项目总数: ${totalProjects}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ 错误:', e)
  process.exit(1)
})
