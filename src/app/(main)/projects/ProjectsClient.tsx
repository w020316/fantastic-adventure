'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'

type ProjectMetric = {
  label?: string
  value?: string | number
  suffix?: string
  display?: string
}

interface Project {
  id: string
  title: string
  subtitle?: string | null
  description: string
  impact?: string | null
  metrics?: ProjectMetric[] | null
  coverImage?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
  caseStudyUrl?: string | null
  techStack: string[]
  featured: boolean
  order: number
  createdAt: string
}

// 项目分类推断：根据技术栈自动归类（4 大类：前端 / Java后端 / 全栈 / AI项目）
type ProjectCategory = '前端' | 'Java后端' | '全栈' | 'AI项目'

const CATEGORY_CONFIG: Record<ProjectCategory, { color: string; bg: string; border: string }> = {
  '前端': { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.4)' },
  'Java后端': { color: '#ff8c00', bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.4)' },
  '全栈': { color: '#00ff9f', bg: 'rgba(0,255,159,0.1)', border: 'rgba(0,255,159,0.4)' },
  'AI项目': { color: '#ff0080', bg: 'rgba(255,0,128,0.1)', border: 'rgba(255,0,128,0.4)' },
}

function inferCategory(techStack: string[]): ProjectCategory {
  const stack = techStack.join(' ').toLowerCase()
  // AI项目：含 CV / ML / LLM / RAG 等技术（计算机视觉归入此类）
  if (['yolo', 'opencv', 'pytorch', 'tensorflow', 'deepseek', 'chromadb', 'rag', 'llm', '智能体', 'agent'].some((k) => stack.includes(k))) {
    return 'AI项目'
  }
  // Java后端：精确匹配 java 关键词（避免 JavaScript 误判）+ Java Web 技术栈
  const hasJava = techStack.some((t) => /^java$/i.test(t.trim()))
  const hasJavaWeb = ['tomcat', 'jsp', 'maven', 'spring boot', 'springboot'].some((k) => stack.includes(k))
  if (hasJava || hasJavaWeb) {
    return 'Java后端'
  }
  // 全栈：同时含前端框架 + 后端技术
  const hasFrontend = ['vue', 'react', 'next.js', 'nextjs'].some((k) => stack.includes(k))
  const hasBackend = ['prisma', 'serverless', 'postgresql', 'node.js', 'nodejs', 'express', 'koa', 'mysql'].some((k) => stack.includes(k))
  if (hasFrontend && hasBackend) return '全栈'
  if (stack.includes('spring boot') || stack.includes('springboot')) return '全栈'
  // 默认前端
  return '前端'
}

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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

// 项目卡片（保持原有赛博朋克风格，增强视觉层次）
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const metrics = project.metrics ?? []
  const hasMetrics = metrics.length > 0
  const category = inferCategory(project.techStack)
  const catConfig = CATEGORY_CONFIG[category]

  return (
    <article
      className="cyber-card group relative p-6 sm:p-8 flex flex-col overflow-hidden"
      style={{ animation: `fadeInUp 0.5s ease ${index * 0.08}s forwards`, opacity: 0 }}
    >
      {/* 顶部渐变装饰条（hover 时发光增强） */}
      <div
        className="absolute top-0 left-0 w-full h-[2px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${catConfig.color}, transparent)`, boxShadow: `0 0 10px ${catConfig.color}80` }}
      />
      {/* hover 时右上角光晕 */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: catConfig.color }}
      />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="font-mono text-xs text-[var(--color-text-tertiary)] tracking-widest">
              {String(index + 1).padStart(2, '0')}
            </span>
            {/* 分类标签 */}
            <span
              className="tag transition-all"
              style={{ background: catConfig.bg, borderColor: catConfig.border, color: catConfig.color }}
            >
              {category}
            </span>
            {project.featured && (
              <span className="tag tag-brand">★ FEATURED</span>
            )}
            {project.repoUrl && !project.featured && (
              <span className="tag" style={{ background: 'rgba(0,212,255,0.1)', borderColor: 'var(--color-cyber-blue)', color: 'var(--color-cyber-blue)' }}>
                GitHub
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
              className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)] p-3 transition-all duration-300 hover:border-[var(--color-brand)]/40 hover:bg-[rgba(0,255,159,0.03)]"
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
        <Link href={`/projects/${project.id}`} className="btn-brand">
          查看详情
          <ArrowIcon className="w-3.5 h-3.5" />
        </Link>
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <GitHubIcon className="w-4 h-4" />
            源码
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <ExternalLinkIcon className="w-4 h-4" />
            在线体验
          </a>
        )}
      </div>
    </article>
  )
}

interface ProjectsClientProps {
  projects: Project[]
  allTechStacks: string[]
}

export default function ProjectsClient({ projects, allTechStacks }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTech, setActiveTech] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  // 排序：'order'（默认排序）| 'newest'（开发时间）| 'featured'（重要程度）
  const [sortBy, setSortBy] = useState<'order' | 'newest' | 'featured'>('order')

  // 预计算每个项目的分类
  const projectCategories = useMemo(() => {
    const map = new Map<string, ProjectCategory>()
    projects.forEach((p) => map.set(p.id, inferCategory(p.techStack)))
    return map
  }, [projects])

  // 所有分类列表
  const allCategories = useMemo(() => {
    const set = new Set<ProjectCategory>()
    projectCategories.forEach((c) => set.add(c))
    return Array.from(set)
  }, [projectCategories])

  // 过滤+搜索+排序
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // 搜索
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.subtitle?.toLowerCase().includes(q) ?? false) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))
      )
    }

    // 分类筛选
    if (activeCategory !== 'all') {
      result = result.filter((p) => projectCategories.get(p.id) === activeCategory)
    }

    // 技术栈筛选
    if (activeTech !== 'all') {
      result = result.filter((p) => p.techStack.includes(activeTech))
    }

    // 排序
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'featured') {
      result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return a.order - b.order
      })
    } else {
      result.sort((a, b) => a.order - b.order)
    }

    return result
  }, [projects, searchQuery, activeTech, sortBy])

  // 分板块：精选项目 + GitHub开源
  const featuredProjects = useMemo(
    () => filteredProjects.filter((p) => p.featured),
    [filteredProjects]
  )
  const githubProjects = useMemo(
    () => filteredProjects.filter((p) => !p.featured && p.repoUrl),
    [filteredProjects]
  )

  const featuredCount = projects.filter((p) => p.featured).length
  const githubCount = projects.filter((p) => !p.featured && p.repoUrl).length

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setActiveTech('all')
    setActiveCategory('all')
    setSortBy('order')
  }, [])

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
              <span>· {featuredCount} 个精选</span>
              <span>· {githubCount} 个开源</span>
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
          <>
            {/* 搜索与筛选栏 */}
            <div className="cyber-card p-4 sm:p-5 mb-8" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
              <div className="flex flex-col gap-4">
                {/* 搜索框 */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索项目名称、描述、技术栈..."
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                {/* 分类筛选 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--color-text-tertiary)] tracking-widest">CATEGORY:</span>
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`tag transition-all ${activeCategory === 'all' ? 'tag-brand' : ''}`}
                    style={activeCategory === 'all' ? {} : { cursor: 'pointer' }}
                  >
                    全部
                  </button>
                  {allCategories.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat]
                    const isActive = activeCategory === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(isActive ? 'all' : cat)}
                        className="tag transition-all"
                        style={
                          isActive
                            ? { background: cfg.bg, borderColor: cfg.color, color: cfg.color, cursor: 'pointer' }
                            : { cursor: 'pointer', background: cfg.bg + '40', borderColor: cfg.border + '40', color: cfg.color + 'cc' }
                        }
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>

                {/* 技术栈筛选 + 排序 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)] tracking-widest">TECH:</span>
                    <button
                      onClick={() => setActiveTech('all')}
                      className={`tag transition-all ${activeTech === 'all' ? 'tag-brand' : ''}`}
                      style={activeTech === 'all' ? {} : { cursor: 'pointer' }}
                    >
                      全部
                    </button>
                    {allTechStacks.slice(0, 12).map((tech) => (
                      <button
                        key={tech}
                        onClick={() => setActiveTech(activeTech === tech ? 'all' : tech)}
                        className={`tag transition-all ${activeTech === tech ? 'tag-brand' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)] tracking-widest">SORT:</span>
                    {([
                      { key: 'order', label: '默认' },
                      { key: 'newest', label: '最新' },
                      { key: 'featured', label: '精选优先' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`tag transition-all ${sortBy === opt.key ? 'tag-brand' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 结果统计 + 重置 */}
                {(searchQuery || activeTech !== 'all' || activeCategory !== 'all' || sortBy !== 'order') && (
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]">
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                      匹配 {filteredProjects.length} / {projects.length} 个项目
                    </span>
                    <button
                      onClick={resetFilters}
                      className="font-mono text-[10px] text-[var(--color-brand)] hover:underline"
                    >
                      重置筛选
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 板块1：精选项目 */}
            {featuredProjects.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="tag tag-brand">★ FEATURED</span>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                    精选项目
                  </h2>
                  <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
                    ({featuredProjects.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  {featuredProjects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* 板块2：GitHub开源项目 */}
            {githubProjects.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <GitHubIcon className="w-5 h-5 text-[var(--color-cyber-blue)]" />
                  <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                    GitHub 开源项目
                  </h2>
                  <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
                    ({githubProjects.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  {githubProjects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* 无结果 */}
            {filteredProjects.length === 0 && (
              <div className="cyber-card p-16 text-center">
                <div className="font-display text-xl font-bold text-[var(--color-text-secondary)] mb-2">
                  未找到匹配的项目
                </div>
                <p className="font-mono text-xs text-[var(--color-text-tertiary)] mb-4">
                  尝试调整搜索关键词或筛选条件
                </p>
                <button onClick={resetFilters} className="btn-brand">
                  重置筛选
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
