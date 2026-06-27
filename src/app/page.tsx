import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import CapabilitySection from '@/components/landing/CapabilitySection'
import ProjectsSection from '@/components/landing/ProjectsSection'
import ArticlesSection from '@/components/landing/ArticlesSection'
import ContactSection from '@/components/landing/ContactSection'
import SpotlightCursor from '@/components/landing/SpotlightCursor'
import GitHubReposSection from '@/components/landing/GitHubReposSection'
import { prisma } from '@/lib/prisma'

// 动态渲染，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic'

// 数据库项目类型
type DbProject = {
  id: string
  title: string
  subtitle?: string | null
  description: string
  metrics?: unknown
  techStack: string[]
  demoUrl?: string | null
  repoUrl?: string | null
  featured: boolean
  order: number
}

export default async function HomePage() {
  // 从数据库获取项目数据
  let dbProjects: DbProject[] = []
  try {
    dbProjects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 6,
    })
  } catch {
    // 数据库不可用时使用空数组，ProjectsSection 会用 fallback 数据
  }

  return (
    <>
      <SpotlightCursor />
      <Header />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <CapabilitySection />
        <ProjectsSection projects={dbProjects} />
        <GitHubReposSection />
        <ArticlesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
