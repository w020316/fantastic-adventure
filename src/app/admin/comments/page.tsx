'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type CommentStatus = 'PENDING' | 'APPROVED' | 'HIDDEN'

interface Comment {
  id: string
  nickname: string
  content: string
  articleId: string
  articleTitle?: string
  createdAt: string
  status: CommentStatus
}

type TabKey = 'ALL' | 'PENDING' | 'APPROVED' | 'HIDDEN'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待审核' },
  { key: 'APPROVED', label: '已通过' },
  { key: 'HIDDEN', label: '已隐藏' },
]

const statusTagMap: Record<CommentStatus, string> = {
  PENDING: 'cyber-tag-yellow',
  APPROVED: 'cyber-tag-green',
  HIDDEN: 'cyber-tag-pink',
}

const statusLabelMap: Record<CommentStatus, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  HIDDEN: '已隐藏',
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const links = [
    { href: '/admin', label: '仪表盘' },
    { href: '/admin/articles', label: '文章管理' },
    { href: '/admin/comments', label: '评论审核' },
    { href: '/admin/projects', label: '项目管理' },
  ]

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-cyber-border">
        <h1 className="font-display text-lg font-bold neon-text">ADMIN</h1>
        <p className="font-mono text-xs text-cyber-text-dim mt-1">{'// 管理后台'}</p>
      </div>
      <div className="flex-1 py-4 space-y-1 px-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`block font-mono text-xs px-3 py-2.5 rounded-sm transition-all ${
              link.href === '/admin/comments'
                ? 'border border-cyber-neon/30 text-cyber-neon bg-cyber-neon/5'
                : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="p-4 border-t border-cyber-border">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full cyber-button py-2 text-xs"
          style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
        >
          退出登录
        </button>
      </div>
    </nav>
  )

  return (
    <>
      <aside className="hidden lg:block w-56 flex-shrink-0 h-screen sticky top-0 border-r border-cyber-border bg-cyber-bg">
        {nav}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-cyber-bg border-r border-cyber-border">
            <div className="flex justify-end p-2">
              <button onClick={onClose} className="text-cyber-text-dim hover:text-cyber-neon p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}

function SkeletonRow() {
  return (
    <div className="cyber-card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-cyber-border rounded" />
            <div className="h-4 w-12 bg-cyber-border rounded" />
          </div>
          <div className="h-3 w-full bg-cyber-border rounded" />
          <div className="h-3 w-2/3 bg-cyber-border rounded" />
          <div className="flex gap-2">
            <div className="h-3 w-20 bg-cyber-border rounded" />
            <div className="h-3 w-16 bg-cyber-border rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-cyber-border rounded" />
          <div className="h-6 w-12 bg-cyber-border rounded" />
          <div className="h-6 w-12 bg-cyber-border rounded" />
        </div>
      </div>
    </div>
  )
}

export default function AdminCommentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/comments')
      if (res.ok) {
        const data = await res.json()
        setComments(Array.isArray(data) ? data : data.comments ?? [])
      }
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchComments()
    }
  }, [status, router, fetchComments])

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid-bg flex">
        <Sidebar mobileOpen={false} onClose={() => {}} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="section-title mb-6">
            <span className="neon-text-blue">▸</span> 评论审核
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </main>
      </div>
    )
  }

  if (!session) return null

  const filtered = activeTab === 'ALL'
    ? comments
    : comments.filter((c) => c.status === activeTab)

  async function updateStatus(id: string, newStatus: CommentStatus) {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        )
      }
    } catch {}
  }

  async function deleteComment(id: string) {
    if (!window.confirm('确定要删除这条评论吗？此操作不可撤销。')) return
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id))
      }
    } catch {}
  }

  return (
    <div className="min-h-screen grid-bg flex">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-10 bg-cyber-bg/80 backdrop-blur-sm border-b border-cyber-border px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-cyber-text-dim hover:text-cyber-neon p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="section-title mb-0">
              <span className="neon-text-blue">▸</span> 评论审核
            </div>
          </div>
          <span className="font-mono text-xs text-cyber-text-dim">
            共 {filtered.length} 条
          </span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-all ${
                  activeTab === tab.key
                    ? 'border-cyber-neon/50 text-cyber-neon bg-cyber-neon/10'
                    : 'border-cyber-border text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="cyber-card p-12 text-center">
              <p className="font-mono text-cyber-text-dim text-sm">暂无评论</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((comment) => (
                <div key={comment.id} className="cyber-card p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-display text-sm font-bold text-cyber-text">
                          {comment.nickname}
                        </span>
                        <span className={`cyber-tag ${statusTagMap[comment.status]}`}>
                          {statusLabelMap[comment.status]}
                        </span>
                      </div>
                      <p className="text-cyber-text text-sm leading-relaxed mb-2 line-clamp-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-cyber-text-dim font-mono flex-wrap">
                        {comment.articleTitle && (
                          <span className="cyber-tag">{comment.articleTitle}</span>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {comment.status !== 'APPROVED' && (
                        <button
                          onClick={() => updateStatus(comment.id, 'APPROVED')}
                          className="cyber-button py-1 px-3 text-xs"
                          style={{ borderColor: 'var(--color-cyber-neon)', color: 'var(--color-cyber-neon)' }}
                        >
                          通过
                        </button>
                      )}
                      {comment.status !== 'HIDDEN' && (
                        <button
                          onClick={() => updateStatus(comment.id, 'HIDDEN')}
                          className="cyber-button py-1 px-3 text-xs"
                          style={{ borderColor: 'var(--color-cyber-yellow)', color: 'var(--color-cyber-yellow)' }}
                        >
                          隐藏
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="cyber-button py-1 px-3 text-xs"
                        style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
