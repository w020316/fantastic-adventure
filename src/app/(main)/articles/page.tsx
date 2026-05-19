'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { fetchArticles, fetchCategories, fetchTags } from '@/lib/api'
import { categoryColorMap, categoryGradients, categoryColorValue, formatDate } from '@/lib/constants'
import { useDebounce } from '@/hooks/useDebounce'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  status: string
  likes: number
  views: number
  publishedAt: string
  author: { id: string; name: string }
  category: { id: string; name: string; slug: string; description: string }
  tags: { id: string; name: string; slug: string }[]
  commentCount: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  count: number
}

interface Tag {
  id: string
  name: string
  slug: string
  count: number
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <section className="relative border-b border-cyber-border overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="mb-6 h-6 w-36 skeleton-pulse rounded-sm" />
            <div className="h-10 w-48 skeleton-pulse rounded-sm mb-3" />
            <div className="h-5 w-64 skeleton-pulse rounded-sm" />
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 skeleton-pulse rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ArticlesContent />
    </Suspense>
  )
}

function ArticlesContent() {
  const searchParams = useSearchParams()
  const tagParam = searchParams.get('tag')
  const catParam = searchParams.get('cat')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(catParam || 'all')
  const [activeTag, setActiveTag] = useState<string | null>(tagParam)
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date')

  const [articlesList, setArticlesList] = useState<Article[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [tagsList, setTagsList] = useState<Tag[]>([])
  const [totalArticles, setTotalArticles] = useState(0)
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [sidebarLoading, setSidebarLoading] = useState(true)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (tagParam) setActiveTag(tagParam)
  }, [tagParam])

  useEffect(() => {
    if (catParam) setActiveCategory(catParam)
  }, [catParam])

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategoriesList(data.categories)
      setSidebarLoading(false)
    })
    fetchTags().then((data) => {
      setTagsList(data.tags)
    })
  }, [])

  useEffect(() => {
    setArticlesLoading(true)
    const params: Record<string, string> = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (activeCategory !== 'all') params.category = activeCategory
    if (activeTag) params.tag = activeTag
    if (sortBy === 'likes') params.sort = 'likes'

    fetchArticles(params)
      .then((data) => {
        setArticlesList(data.articles)
        setTotalArticles(data.pagination.total)
      })
      .finally(() => setArticlesLoading(false))
  }, [debouncedSearch, activeCategory, activeTag, sortBy])

  return (
    <div className="min-h-screen">
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/3 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-blue/60 border border-cyber-blue/20 px-3 py-1 rounded-sm">
              ARCHIVE.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            文章<span className="neon-text-blue">归档</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider">
            {'// 所有文章，按你想要的方式浏览'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-20 space-y-5">
              <div className="cyber-card p-4">
                <h3 className="section-title mb-3">
                  <span className="text-cyber-neon">🔍</span> 搜索
                </h3>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyber-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="搜索文章..."
                    className="cyber-input text-xs py-2"
                    style={{ paddingLeft: '2rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="搜索文章"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-text-dim hover:text-cyber-neon transition-all duration-200"
                      aria-label="清除搜索"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="cyber-card p-4">
                <h3 className="section-title mb-3">
                  <span className="text-cyber-pink">📁</span> 分类
                </h3>
                <div className="space-y-1">
                  {sidebarLoading ? (
                    <>
                      <div className="h-7 skeleton-pulse rounded-sm mb-1" />
                      <div className="h-7 skeleton-pulse rounded-sm mb-1" />
                      <div className="h-7 skeleton-pulse rounded-sm mb-1" />
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setActiveCategory('all'); setActiveTag(null) }}
                        className={`w-full text-left font-mono text-xs px-3 py-2 rounded-sm transition-all ${
                          activeCategory === 'all'
                            ? 'bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/20'
                            : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
                        }`}
                      >
                        全部文章 ({totalArticles})
                      </button>
                      {categoriesList.map((cat) => {
                        const hex = categoryColorValue[cat.slug]
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.slug); setActiveTag(null) }}
                            className={`w-full text-left font-mono text-xs px-3 py-2 rounded-sm transition-all flex items-center justify-between ${
                              activeCategory === cat.slug
                                ? 'border'
                                : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
                            }`}
                            style={activeCategory === cat.slug && hex ? {
                              borderColor: `${hex}30`,
                              color: hex,
                              backgroundColor: `${hex}10`,
                            } : {}}
                          >
                            <span>{cat.name}</span>
                            <span className="text-cyber-text-dim">{cat.count}</span>
                          </button>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="cyber-card p-4">
                <h3 className="section-title mb-3">
                  <span className="text-cyber-blue">🏷</span> 标签
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {sidebarLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-5 w-14 skeleton-pulse rounded-sm" />
                    ))
                  ) : (
                    tagsList.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => { setActiveTag(activeTag === tag.slug ? null : tag.slug); setActiveCategory('all') }}
                        className={`cyber-tag transition-all ${
                          activeTag === tag.slug ? 'cyber-tag-green scale-105' : ''
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="cyber-card p-4">
                <h3 className="section-title mb-3">
                  <span className="text-cyber-yellow">⚙</span> 排序
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`w-full text-left font-mono text-xs px-3 py-2 rounded-sm transition-all ${
                      sortBy === 'date'
                        ? 'bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/20'
                        : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
                    }`}
                  >
                    按日期排序
                  </button>
                  <button
                    onClick={() => setSortBy('likes')}
                    className={`w-full text-left font-mono text-xs px-3 py-2 rounded-sm transition-all ${
                      sortBy === 'likes'
                        ? 'bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/20'
                        : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
                    }`}
                  >
                    按热度排序
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 order-1 lg:order-2">
            {(debouncedSearch || activeCategory !== 'all' || activeTag) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap" role="status" aria-live="polite">
                <span className="font-mono text-xs text-cyber-text-dim">筛选:</span>
                {debouncedSearch && (
                  <span className="cyber-tag cyber-tag-green">
                    搜索: {debouncedSearch}
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-cyber-pink" aria-label="移除搜索筛选">×</button>
                  </span>
                )}
                {activeCategory !== 'all' && (
                  <span className="cyber-tag cyber-tag-pink">
                    {categoriesList.find(c => c.slug === activeCategory)?.name}
                    <button onClick={() => setActiveCategory('all')} className="ml-1 hover:text-cyber-pink" aria-label="移除分类筛选">×</button>
                  </span>
                )}
                {activeTag && (
                  <span className="cyber-tag cyber-tag-blue">
                    #{tagsList.find(t => t.slug === activeTag)?.name}
                    <button onClick={() => setActiveTag(null)} className="ml-1 hover:text-cyber-pink" aria-label="移除标签筛选">×</button>
                  </span>
                )}
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveTag(null) }}
                  className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors"
                >
                  清除全部
                </button>
              </div>
            )}

            <div className="space-y-4">
              {articlesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="cyber-card">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-32 sm:h-auto skeleton-pulse flex-shrink-0" />
                      <div className="p-4 sm:p-5 flex-1 space-y-3">
                        <div className="h-4 w-20 skeleton-pulse rounded-sm" />
                        <div className="h-5 w-3/4 skeleton-pulse rounded-sm" />
                        <div className="h-4 w-full skeleton-pulse rounded-sm" />
                        <div className="h-4 w-1/2 skeleton-pulse rounded-sm" />
                      </div>
                    </div>
                  </div>
                ))
              ) : articlesList.length > 0 ? (
                articlesList.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="cyber-card group block"
                    style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s forwards`, opacity: 0 }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className={`relative w-full sm:w-48 h-32 sm:h-auto bg-gradient-to-br ${categoryGradients[article.category.slug] || 'from-gray-900/40 via-gray-800/30 to-gray-900/40'} flex-shrink-0`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cyber-surface/30 hidden sm:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-cyber-surface/30 to-transparent sm:hidden" />
                      </div>
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`cyber-tag ${categoryColorMap[article.category.slug]}`}>
                            {article.category.name}
                          </span>
                        </div>
                        <h2 className="font-display text-sm sm:text-base font-semibold text-cyber-text group-hover:text-cyber-neon transition-colors mb-2">
                          {article.title}
                        </h2>
                        <p className="text-cyber-text-dim text-xs sm:text-sm leading-relaxed mb-3 flex-1 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span key={tag.id} className="cyber-tag">{tag.name}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-cyber-text-dim font-mono flex-shrink-0 ml-3">
                            <span>{formatDate(article.publishedAt)}</span>
                            <span>❤ {article.likes}</span>
                            <span>💬 {article.commentCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="cyber-card p-12 text-center">
                  <span className="text-2xl block mb-3">🔍</span>
                  <p className="font-mono text-cyber-text-dim text-sm">未找到匹配的文章</p>
                  <p className="font-mono text-cyber-text-dim text-xs mt-1">尝试其他关键词或分类</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
