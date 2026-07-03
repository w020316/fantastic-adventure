import { prisma } from '@/lib/prisma'
import ProjectsClient from './ProjectsClient'

// 运行时动态渲染，避免构建时需要 DATABASE_URL
export const dynamic = 'force-dynamic'

type ProjectMetric = {
  label?: string
  value?: string | number
  suffix?: string
  display?: string
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  // 序列化为客户端兼容类型（Date → string）
  const serializedProjects = projects.map((p) => ({
    ...p,
    metrics: (p.metrics ?? null) as ProjectMetric[] | null,
    createdAt: p.createdAt.toISOString(),
  }))

  // 收集所有技术栈标签（用于筛选）
  const allTechStacks = Array.from(
    new Set(projects.flatMap((p) => p.techStack))
  ).sort()

  return <ProjectsClient projects={serializedProjects} allTechStacks={allTechStacks} />
}
