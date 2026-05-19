'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { fetchArticles, fetchCategories, fetchProjects, fetchStats, fetchTags } from '@/lib/api'
import { categoryColorMap, categoryGradients, categoryColorValue, defaultGradient, formatDate, getReadingTime } from '@/lib/constants'

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target <= 0) {
      setCount(0)
      return
    }
    let start = 0
    const step = target / (duration / 16)
    let cancelled = false
    const timer = setInterval(() => {
      start += step
      if (cancelled) return
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [target, duration])
  return count
}

function StatCard({ label, value, suffix, color }: { label: string; value: number; suffix: string; color: string }) {
  const count = useCountUp(value)
  return (
    <div className="cyber-card p-4 text-center flex-1 min-w-[120px]" style={{ animationDelay: '0.2s', animation: 'fadeInUp 0.6s ease forwards' }}>
      <div className={`font-display text-2xl sm:text-3xl font-bold mb-1`} style={{ color }}>
        {count}{suffix}
      </div>
      <div className="font-mono text-xs text-cyber-text-dim tracking-wider">{label}</div>
    </div>
  )
}

interface Article {
  id: string | number
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  likes: number
  views: number
  publishedAt: string
  createdAt: string
  updatedAt: string
  author: { id: string | number; name: string }
  category: { id: string | number; name: string; slug: string; description: string }
  tags: { id: string | number; name: string; slug: string }[]
  commentCount: number
}

interface Project {
  id: string | number
  title: string
  description: string
  coverImage: string | null
  demoUrl: string | null
  repoUrl: string | null
  techStack: string[]
  featured: boolean
  order: number
}

function ArticleCard({ article, index, isFeatured }: { article: Article; index: number; isFeatured?: boolean }) {
  const tagClass = categoryColorMap[article.category.slug] || 'cyber-tag'
  const gradient = categoryGradients[article.category.slug] || defaultGradient
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="cyber-card group flex flex-col"
      style={{ animation: `fadeInUp 0.5s ease ${index * 0.08}s forwards`, opacity: 0 }}
    >
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-end p-4`}>
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-surface via-transparent to-transparent" />
        <span className={`cyber-tag ${tagClass} relative z-10`}>
          {article.category.name}
        </span>
        {isFeatured && (
          <span className="absolute top-3 right-3 cyber-tag cyber-tag-yellow">
            ★ 精选
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-sm sm:text-base font-semibold text-cyber-text group-hover:text-cyber-neon transition-colors mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-cyber-text-dim text-xs sm:text-sm leading-relaxed mb-3 flex-1 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className="cyber-tag">{tag.name}</span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-cyber-text-dim font-mono pt-3 border-t border-cyber-border">
          <span>{formatDate(article.publishedAt)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {getReadingTime(article.content)}分
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              {article.likes}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const gradient = categoryGradients.works || defaultGradient
  return (
    <div
      className="cyber-card group flex flex-col"
      style={{ animation: `fadeInUp 0.5s ease ${index * 0.1}s forwards`, opacity: 0 }}
    >
      <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-60" width={400} height={200} />
        ) : null}
        <span className="font-display text-2xl font-bold text-white/20 group-hover:text-white/40 transition-colors relative z-10">
          {project.title}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-surface via-transparent to-transparent" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-sm font-semibold text-cyber-text group-hover:text-cyber-blue transition-colors mb-2">
          {project.title}
        </h3>
        <p className="text-cyber-text-dim text-xs leading-relaxed mb-3 flex-1 line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.techStack.map((t) => (
            <span key={t} className="cyber-tag">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-cyber-border">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-cyber-text-dim hover:text-cyber-blue transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Demo
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const [articlesList, setArticlesList] = useState<Article[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [categoriesList, setCategoriesList] = useState<{ id: string | number; name: string; slug: string; description: string; count: number; createdAt: string }[]>([])
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [stats, setStats] = useState<{ totalViews: number; todayViews: number; articleCount: number; commentCount: number } | null>(null)
  const [tagsList, setTagsList] = useState<{ id: string | number; name: string; slug: string; count: number; createdAt: string }[]>([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function loadData() {
      try {
        const [articlesRes, featuredRes, categoriesRes, projectsRes, statsRes, tagsRes] = await Promise.all([
          fetchArticles({ limit: '6' }),
          fetchArticles({ limit: '1', sort: 'likes' }),
          fetchCategories(),
          fetchProjects(),
          fetchStats(),
          fetchTags(),
        ])
        if (controller.signal.aborted) return
        setArticlesList(articlesRes.articles || [])
        setFeaturedArticle(featuredRes.articles?.[0] || null)
        setCategoriesList(categoriesRes.categories || [])
        setProjectsList(projectsRes.projects || [])
        setStats(statsRes)
        setTagsList(tagsRes.tags || [])
      } catch (err) {
        if (controller.signal.aborted) return
        console.error('Failed to load data:', err)
        setLoadError(true)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    loadData()
    return () => controller.abort()
  }, [])

  const filteredArticles = useMemo(() => {
    return articlesList.filter((article) => {
      const matchesCategory = activeCategory === 'all' || article.category.slug === activeCategory
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [articlesList, searchQuery, activeCategory])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen">
        <section className="relative overflow-hidden border-b border-cyber-border">
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
            <div className="text-center mb-10">
              <div className="mb-4 h-6 w-32 mx-auto skeleton-pulse rounded-sm" />
              <div className="h-10 w-64 mx-auto skeleton-pulse rounded-sm mb-4" />
              <div className="h-5 w-48 mx-auto skeleton-pulse rounded-sm" />
            </div>
            <div className="max-w-xl mx-auto mb-10">
              <div className="h-10 skeleton-pulse rounded-sm" />
            </div>
            <div className="flex gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-20 skeleton-pulse rounded-sm min-w-[120px]" />
              ))}
            </div>
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 skeleton-pulse rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-4xl font-bold neon-text-pink mb-4">ERROR</div>
          <p className="font-mono text-cyber-text-dim text-sm mb-6">数据加载失败，请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="cyber-button px-6 py-2 text-xs"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyber-border">
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-b from-cyber-neon/3 via-transparent to-transparent" />
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyber-neon/5 rounded-full blur-[120px]" />
        <div className="hidden sm:block absolute top-20 right-1/4 w-64 h-64 bg-cyber-pink/5 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-10" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
            <div className="mb-4">
              <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-neon/60 border border-cyber-neon/20 px-3 py-1 rounded-sm">
                SYSTEM.READY
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-4">
              欢迎进入<span className="neon-text">赛博空间</span>
            </h1>
            <p className="font-mono text-cyber-text-dim text-sm sm:text-base tracking-wider">
              {'// 探索技术 · 记录生活 · 展示作品'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-10" style={{ animation: 'fadeInUp 0.6s ease 0.15s forwards', opacity: 0 }}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索文章、标签..."
                className="cyber-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-text-dim hover:text-cyber-neon transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center max-w-lg mx-auto" style={{ animation: 'fadeInUp 0.6s ease 0.3s forwards', opacity: 0 }}>
            <StatCard label="篇文章" value={stats?.articleCount || 0} suffix="" color="#00ff9f" />
            <StatCard label="条评论" value={stats?.commentCount || 0} suffix="" color="#ff0080" />
            <StatCard label="次浏览" value={stats?.totalViews || 0} suffix="" color="#00d4ff" />
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="border-b border-cyber-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`font-mono text-xs px-4 py-2 rounded-sm whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-cyber-neon/15 text-cyber-neon border border-cyber-neon/30'
                  : 'text-cyber-text-dim border border-cyber-border hover:border-cyber-neon/30 hover:text-cyber-neon'
              }`}
            >
              全部
            </button>
            {categoriesList.map((cat) => {
              const color = categoryColorValue[cat.slug] || '#00ff9f'
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`font-mono text-xs px-4 py-2 rounded-sm whitespace-nowrap transition-all ${
                    activeCategory === cat.slug
                      ? 'border'
                      : 'text-cyber-text-dim border border-cyber-border hover:border-cyber-neon/30 hover:text-cyber-neon'
                  }`}
                  style={activeCategory === cat.slug ? {
                    borderColor: `${color}50`,
                    color: color,
                    backgroundColor: `${color}15`,
                  } : {}}
                >
                  {cat.name} ({cat.count})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && !searchQuery && activeCategory === 'all' && (
        <section className="max-w-6xl mx-auto px-4 pt-10">
          <div className="section-title">
            <span className="neon-text">★</span> 精选文章
          </div>
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="cyber-card group block"
            style={{ animation: 'fadeInUp 0.6s ease forwards' }}
          >
            <div className="grid md:grid-cols-2">
              <div className={`relative h-48 md:h-auto bg-gradient-to-br ${categoryGradients[featuredArticle.category.slug] || defaultGradient} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cyber-surface/50 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-surface/50 to-transparent md:hidden" />
                <span className="font-display text-4xl md:text-6xl font-bold text-white/10 group-hover:text-white/20 transition-colors">
                  FEATURED
                </span>
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <span className={`cyber-tag ${categoryColorMap[featuredArticle.category.slug] || 'cyber-tag'} mb-4 self-start`}>
                  {featuredArticle.category.name}
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-cyber-text group-hover:text-cyber-neon transition-colors mb-3">
                  {featuredArticle.title}
                </h2>
                <p className="text-cyber-text-dim text-sm leading-relaxed mb-4">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredArticle.tags.map((tag) => (
                    <span key={tag.id} className="cyber-tag">{tag.name}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-cyber-text-dim font-mono">
                    <span>{formatDate(featuredArticle.publishedAt)}</span>
                    <span>{getReadingTime(featuredArticle.content)}分钟阅读</span>
                    <span>❤ {featuredArticle.likes}</span>
                  </div>
                  <span className="font-mono text-xs text-cyber-neon group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    阅读全文
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Article Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="section-title">
          <span className="neon-text">▸</span> {searchQuery ? `搜索结果 (${filteredArticles.length})` : activeCategory !== 'all' ? `${categoriesList.find(c => c.slug === activeCategory)?.name}文章` : '最新文章'}
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredArticles.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={i}
                isFeatured={featuredArticle?.id === article.id}
              />
            ))}
          </div>
        ) : (
          <div className="cyber-card p-12 text-center">
            <div className="font-mono text-cyber-text-dim text-sm">
              <span className="text-2xl block mb-3">🔍</span>
              <p>未找到匹配的文章</p>
              <p className="text-xs mt-1">尝试其他关键词或分类</p>
            </div>
          </div>
        )}

        {filteredArticles.length > 6 && (
          <div className="text-center mt-8">
            <Link href="/articles" className="cyber-button inline-flex items-center gap-2 px-6 py-2.5 text-xs">
              查看所有文章
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* Tag Cloud */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="section-title">
          <span className="neon-text-pink">▸</span> 标签云
        </div>
        <div className="cyber-card p-5">
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag) => (
              <Link
                key={tag.id}
                href={`/articles?tag=${tag.slug}`}
                className="cyber-tag hover:scale-105 transition-transform"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="border-t border-cyber-border">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="section-title">
            <span className="neon-text-blue">▸</span> 项目展示
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {projectsList.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/projects" className="cyber-button inline-flex items-center gap-2 px-6 py-2.5 text-xs" style={{ borderColor: 'var(--color-cyber-blue)', color: 'var(--color-cyber-blue)' }}>
              查看所有项目
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-cyber-border">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-neon/5 via-cyber-pink/5 to-cyber-blue/5 rounded" />
            <div className="relative p-8 sm:p-12">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-cyber-text mb-3">
                开始你的<span className="neon-text">赛博之旅</span>
              </h2>
              <p className="font-mono text-cyber-text-dim text-sm mb-6 max-w-md mx-auto">
                {'// 在这里，每一行代码都是一个故事'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/articles" className="cyber-button inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs">
                  浏览所有文章
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/about" className="cyber-button inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs" style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}>
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
