import { prisma } from '@/lib/prisma'
import ProjectsClient from './ProjectsClient'

// ISR 缓存：5 分钟重新验证，减少数据库查询频率，配合 Neon 休眠
export const revalidate = 300

type ProjectMetric = {
  label?: string
  value?: string | number
  suffix?: string
  display?: string
}

export default async function ProjectsPage() {
  // 数据库不可用时降级为空数组，ProjectsClient 会显示空状态，避免整页 500
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = []
  try {
    projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
  } catch {
    // 数据库休眠或不可达时静默降级
  }

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
