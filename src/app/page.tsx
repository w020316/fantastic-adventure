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
import GallerySection from '@/components/landing/GallerySection'
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

// 数据库文章类型（传给 ArticlesSection 的客户端组件，Date 需序列化为 string）
type DbArticle = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  category: { name: string; slug: string } | null
  tags: Array<{ name: string; slug: string }>
  publishedAt: string | null
  views: number
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

  // 从数据库获取最新 3 篇已发布文章
  let dbArticles: DbArticle[] = []
  try {
    const result = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
        publishedAt: true,
        views: true,
      },
    })
    dbArticles = result.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      coverImage: a.coverImage,
      category: a.category,
      tags: a.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      views: a.views,
    }))
  } catch {
    // 数据库不可用时使用空数组，ArticlesSection 会用 fallback 数据
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
        <ArticlesSection articles={dbArticles} />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
