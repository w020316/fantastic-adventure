'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  articleCount: number
  commentCount: number
  totalViews: number
  todayViews: number
}

interface Comment {
  id: string
  content: string
  nickname: string
  createdAt: string
  articleId: string
}

interface Article {
  id: string
  title: string
  slug: string
  status: string
  publishedAt: string | null
  likes: number
  commentCount: number
  category: { name: string; slug: string } | null
}

const navItems = [
  { label: '仪表盘', href: '/admin', icon: '◈' },
  { label: '文章管理', href: '/admin/articles', icon: '▤' },
  { label: '评论审核', href: '/admin/comments', icon: '◈' },
  { label: '项目管理', href: '/admin/projects', icon: '◆' },
]

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton-pulse rounded ${className ?? ''}`} />
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="cyber-card p-5">
          <SkeletonBlock className="h-3 w-16 mb-3" />
          <SkeletonBlock className="h-8 w-24 mb-2" />
          <SkeletonBlock className="h-2 w-12" />
        </div>
      ))}
    </div>
  )
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-cyber-border rounded">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 flex-1" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
    if (status === 'authenticated' && (session?.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    if ((session?.user as { role?: string })?.role !== 'ADMIN') return

    async function fetchData() {
      try {
        const [statsRes, commentsRes, articlesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/comments?status=PENDING'),
          fetch('/api/articles?limit=5'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          setComments(commentsData.comments ?? [])
        }
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json()
          setArticles(articlesData.articles ?? [])
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-xl neon-text mb-2">LOADING</div>
          <div className="font-mono text-xs text-cyber-text-dim">{'// 验证身份...'}</div>
        </div>
      </div>
    )
  }

  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return null
  }

  const statCards = [
    { label: '文章数', value: stats?.articleCount ?? 0, color: 'cyber-neon', cardClass: '', icon: '▤' },
    { label: '评论数', value: stats?.commentCount ?? 0, color: 'cyber-blue', cardClass: 'cyber-card-blue', icon: '◈' },
    { label: '总浏览', value: stats?.totalViews ?? 0, color: 'cyber-pink', cardClass: 'cyber-card-pink', icon: '◉' },
    { label: '今日浏览', value: stats?.todayViews ?? 0, color: 'cyber-yellow', cardClass: 'cyber-card-yellow', icon: '◎' },
  ]

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-cyber-surface border-r border-cyber-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-cyber-border">
          <h1 className="font-display text-lg font-bold neon-text">CYBERBLOG</h1>
          <p className="font-mono text-xs text-cyber-text-dim mt-1">{'// 管理后台'}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition-colors ${
                item.href === '/admin'
                  ? 'bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/20'
                  : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-cyber-border">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-sm bg-cyber-neon/10 border border-cyber-neon/30 flex items-center justify-center">
              <span className="font-display text-xs neon-text">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-cyber-text truncate">{session.user?.name}</div>
              <div className="font-mono text-[10px] text-cyber-text-dim truncate">{session.user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full cyber-button text-xs py-2"
            style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-cyber-bg/90 backdrop-blur-sm border-b border-cyber-border px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 border border-cyber-border rounded text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon transition-colors"
              aria-label="菜单"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <h2 className="font-display text-sm font-bold text-cyber-text">仪表盘</h2>
              <p className="font-mono text-[10px] text-cyber-text-dim">{'// 系统概览'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="cyber-tag cyber-tag-green text-[10px]">ONLINE</span>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
          {loading ? (
            <>
              <StatsSkeleton />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cyber-card p-5">
                  <div className="section-title"><span className="neon-text-pink">▸</span> 待审核评论</div>
                  <ListSkeleton rows={4} />
                </div>
                <div className="cyber-card p-5">
                  <div className="section-title"><span className="neon-text-blue">▸</span> 最近文章</div>
                  <ListSkeleton rows={5} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                  <div
                    key={card.label}
                    className={`cyber-card ${card.cardClass} p-5`}
                    style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s forwards`, opacity: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-cyber-text-dim uppercase tracking-wider">{card.label}</span>
                      <span className={`text-${card.color} text-lg`}>{card.icon}</span>
                    </div>
                    <div className={`font-display text-2xl font-bold text-${card.color} mb-1`}>
                      {card.value.toLocaleString()}
                    </div>
                    <div className="h-1 w-full bg-cyber-border rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full bg-${card.color} rounded-full`}
                        style={{ width: `${Math.min(100, (card.value / Math.max(stats?.totalViews ?? 1, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/admin/articles/new" className="cyber-button text-xs">
                  + 新建文章
                </Link>
                <Link href="/admin/comments" className="cyber-button text-xs" style={{ borderColor: 'var(--color-cyber-blue)', color: 'var(--color-cyber-blue)' }}>
                  管理评论
                </Link>
                <Link href="/admin/projects" className="cyber-button text-xs" style={{ borderColor: 'var(--color-cyber-yellow)', color: 'var(--color-cyber-yellow)' }}>
                  查看项目
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.3s forwards', opacity: 0 }}>
                  <div className="section-title">
                    <span className="neon-text-pink">▸</span> 待审核评论
                    {comments.length > 0 && (
                      <span className="cyber-tag cyber-tag-pink text-[10px] ml-auto">{comments.length}</span>
                    )}
                  </div>
                  {comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 border border-cyber-border rounded hover:border-cyber-pink/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs text-cyber-pink">{comment.nickname}</span>
                            <span className="font-mono text-[10px] text-cyber-text-dim">
                              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-cyber-text text-xs leading-relaxed line-clamp-2">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="font-mono text-xs text-cyber-text-dim">{'// 暂无待审核评论'}</p>
                    </div>
                  )}
                </div>

                <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.4s forwards', opacity: 0 }}>
                  <div className="section-title">
                    <span className="neon-text-blue">▸</span> 最近文章
                  </div>
                  {articles.length > 0 ? (
                    <div className="space-y-3">
                      {articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/admin/articles/${article.id}`}
                          className="flex items-center gap-3 p-3 border border-cyber-border rounded hover:border-cyber-blue/30 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`cyber-tag text-[10px] ${article.status === 'PUBLISHED' ? 'cyber-tag-green' : 'cyber-tag-yellow'}`}>
                                {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                              </span>
                              {article.category && (
                                <span className="cyber-tag cyber-tag-blue text-[10px]">{article.category.name}</span>
                              )}
                            </div>
                            <h4 className="font-display text-xs font-semibold text-cyber-text group-hover:text-cyber-neon transition-colors truncate">
                              {article.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-cyber-text-dim flex-shrink-0">
                            <span>❤ {article.likes}</span>
                            <span>💬 {article.commentCount}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="font-mono text-xs text-cyber-text-dim">{'// 暂无文章'}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
