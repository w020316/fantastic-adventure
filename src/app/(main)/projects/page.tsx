import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// 运行时动态渲染，避免构建时需要 DATABASE_URL
export const dynamic = 'force-dynamic'

type ProjectMetric = {
  label?: string
  value?: string | number
  suffix?: string
  display?: string
}

type ProjectWithRelations = Awaited<ReturnType<typeof prisma.project.findMany>>[number]

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

function ProjectCard({ project, index }: { project: ProjectWithRelations; index: number }) {
  const metrics = (project.metrics as ProjectMetric[] | null) ?? []
  const hasMetrics = metrics.length > 0

  return (
    <article
      className="cyber-card group p-6 sm:p-8 flex flex-col"
      style={{ animation: `fadeInUp 0.5s ease ${index * 0.08}s forwards`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-[var(--color-text-tertiary)] tracking-widest">
              {String(index + 1).padStart(2, '0')}
            </span>
            {project.featured && (
              <span className="tag tag-brand">
                ★ FEATURED
              </span>
            )}
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
            <Link href={`/projects/${project.id}`}>
              {project.title}
            </Link>
          </h2>
          {project.subtitle && (
            <p className="font-mono text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 tracking-wide">
              {project.subtitle}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed mb-5">
        {project.description}
      </p>

      {hasMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)] p-3"
            >
              <div className="font-display text-lg sm:text-xl font-bold neon-text leading-none">
                {m.display ?? `${m.value ?? ''}${m.suffix ?? ''}`}
              </div>
              {m.label && (
                <div className="font-mono text-[11px] text-[var(--color-text-tertiary)] mt-1.5 tracking-wide">
                  {m.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {project.impact && (
        <div className="mb-5 pl-4 border-l-2 border-[var(--color-brand)]">
          <div className="font-mono text-[11px] text-[var(--color-brand)] tracking-widest mb-1">IMPACT</div>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{project.impact}</p>
        </div>
      )}

      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-auto pt-5 border-t border-[var(--color-border-subtle)]">
        <Link
          href={`/projects/${project.id}`}
          className="btn-brand"
        >
          查看详情
          <ArrowIcon className="w-3.5 h-3.5" />
        </Link>
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <GitHubIcon className="w-4 h-4" />
            源码
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <ExternalLinkIcon className="w-4 h-4" />
            演示
          </a>
        )}
      </div>
    </article>
  )
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  const featuredCount = projects.filter((p) => p.featured).length

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border-subtle)] grid-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-[var(--color-brand-dim)] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <span className="section-label !mb-4">
            <span className="neon-text">●</span> PROJECTS
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">
            作<span className="neon-text">品</span>
          </h1>
          <p className="font-mono text-sm sm:text-base text-[var(--color-text-secondary)] tracking-wider max-w-2xl">
            {'// 从想法到上线，端到端交付的产品与开源项目'}
          </p>
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6 font-mono text-xs text-[var(--color-text-tertiary)]">
              <span>共 {projects.length} 个项目</span>
              {featuredCount > 0 && <span>· {featuredCount} 个精选</span>}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {projects.length === 0 ? (
          <div className="cyber-card p-16 text-center">
            <div className="font-display text-2xl font-bold text-[var(--color-text-secondary)] mb-2">
              暂无项目
            </div>
            <p className="font-mono text-xs text-[var(--color-text-tertiary)]">
              项目将在准备好后展示在这里
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
