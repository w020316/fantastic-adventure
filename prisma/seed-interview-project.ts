/**
 * 独立种子脚本：添加「AI 智能面试辅助平台」项目到 grbk 项目展示页
 *
 * 特点：
 *   - 使用 upsert，不会重复插入，也不影响现有数据
 *   - 独立运行：npx tsx prisma/seed-interview-project.ts
 *   - 在线体验入口指向 Cloudflare Pages 部署地址
 *
 * 数据来源：
 *   - 仓库：https://github.com/w020316/interview-guide-AI-interview-platform
 *   - 在线体验：https://interview-guide-ai-interview-platform.pages.dev
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始添加「AI 智能面试辅助平台」项目...')

  const project = await prisma.project.upsert({
    where: { title: 'AI 智能面试辅助平台' },
    update: {
      subtitle: '简历分析 · 模拟面试 · RAG 知识库 · AI 优化简历',
      description:
        '面向求职者的全链路 AI 面试准备平台。上传简历获得 AI 四维度评分（技术匹配度/项目含金量/表述清晰度/岗位匹配），生成个性化面试题并支持流式实时提示与自动评估。内置 RAG 知识库增强问答，关联错题总结与题目汇总。基于分析结果一键生成优化版简历，支持 Markdown / HTML 文档下载。',
      impact:
        '覆盖简历 → 面试题 → 实时提示 → 自动评估 → 错题总结 → 简历优化的完整闭环，支持 PDF/HTML/MD/TXT 多格式简历解析与全行业岗位匹配',
      metrics: [
        { label: '评分维度', value: 4, suffix: '项' },
        { label: '面试题难度分级', value: 3, suffix: '级' },
        { label: '简历格式支持', value: 6, suffix: '种' },
        { label: '岗位覆盖', value: 46, suffix: '+' },
      ],
      demoUrl: 'https://interview-guide-ai-interview-platform.pages.dev',
      repoUrl: 'https://github.com/w020316/interview-guide-AI-interview-platform',
      caseStudyUrl: 'https://interview-guide-ai-interview-platform.pages.dev',
      techStack: [
        'Vue 3.4',
        'TypeScript',
        'Vite 5',
        'Spring Boot 3.3.6',
        'Java 21',
        'Spring AI 1.0',
        'PostgreSQL',
        'pgvector',
        'Redis',
        'JWT',
        'Cloudflare Pages',
        'Render',
      ],
      featured: true,
      order: 1,
    },
    create: {
      title: 'AI 智能面试辅助平台',
      subtitle: '简历分析 · 模拟面试 · RAG 知识库 · AI 优化简历',
      description:
        '面向求职者的全链路 AI 面试准备平台。上传简历获得 AI 四维度评分（技术匹配度/项目含金量/表述清晰度/岗位匹配），生成个性化面试题并支持流式实时提示与自动评估。内置 RAG 知识库增强问答，关联错题总结与题目汇总。基于分析结果一键生成优化版简历，支持 Markdown / HTML 文档下载。',
      impact:
        '覆盖简历 → 面试题 → 实时提示 → 自动评估 → 错题总结 → 简历优化的完整闭环，支持 PDF/HTML/MD/TXT 多格式简历解析与全行业岗位匹配',
      metrics: [
        { label: '评分维度', value: 4, suffix: '项' },
        { label: '面试题难度分级', value: 3, suffix: '级' },
        { label: '简历格式支持', value: 6, suffix: '种' },
        { label: '岗位覆盖', value: 46, suffix: '+' },
      ],
      demoUrl: 'https://interview-guide-ai-interview-platform.pages.dev',
      repoUrl: 'https://github.com/w020316/interview-guide-AI-interview-platform',
      caseStudyUrl: 'https://interview-guide-ai-interview-platform.pages.dev',
      techStack: [
        'Vue 3.4',
        'TypeScript',
        'Vite 5',
        'Spring Boot 3.3.6',
        'Java 21',
        'Spring AI 1.0',
        'PostgreSQL',
        'pgvector',
        'Redis',
        'JWT',
        'Cloudflare Pages',
        'Render',
      ],
      featured: true,
      order: 1,
    },
  })

  console.log('✅ 项目已添加:', project.title)
  console.log('   在线体验:', project.demoUrl)
  console.log('   源代码:', project.repoUrl)
}

main()
  .catch((e) => {
    console.error('❌ 种子失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
