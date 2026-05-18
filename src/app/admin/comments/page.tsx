'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

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
  const { status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')

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
    if (status === 'authenticated') {
      fetchComments()
    }
  }, [status, fetchComments])

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
        <span className="font-mono text-xs text-cyber-text-dim self-center ml-auto">
          共 {filtered.length} 条
        </span>
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
  )
}
