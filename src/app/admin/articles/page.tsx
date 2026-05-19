'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

interface Article {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  createdAt: string
  likes: number
  views: number
  category: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string; slug: string }[]
}

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT'

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'PUBLISHED', label: '已发布' },
  { key: 'DRAFT', label: '草稿' },
]

export default function AdminArticlesPage() {
  const { status: sessionStatus } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles?limit=100')
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [sessionStatus])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`确定要删除文章「${title}」吗？此操作不可撤销。`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id))
      } else {
        alert('删除失败，请重试')
      }
    } catch {
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
    }
  }

  const filteredArticles = useMemo(() => {
    let result = articles
    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter)
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((a) => a.title.toLowerCase().includes(q))
    }
    return result
  }, [articles, statusFilter, debouncedSearch])

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
              ← 仪表盘
            </Link>
          </div>
          <Link href="/admin/articles/new" className="cyber-button text-xs">
            + 新建文章
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文章标题..."
            className="cyber-input flex-1 text-sm"
          />
          <div className="flex gap-2">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-all ${
                  statusFilter === f.key
                    ? 'border-cyber-neon/50 text-cyber-neon bg-cyber-neon/10'
                    : 'border-cyber-border text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cyber-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyber-border">
                  <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">标题</th>
                  <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">状态</th>
                  <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider hidden sm:table-cell">分类</th>
                  <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider hidden md:table-cell">日期</th>
                  <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider hidden lg:table-cell">❤</th>
                  <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider hidden lg:table-cell">👁</th>
                  <th className="text-right font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-cyber-border/50">
                      <td className="px-4 py-3"><div className="h-4 w-48 bg-cyber-border animate-pulse rounded" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-16 bg-cyber-border animate-pulse rounded" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 bg-cyber-border animate-pulse rounded" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 bg-cyber-border animate-pulse rounded" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-8 bg-cyber-border animate-pulse rounded" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-8 bg-cyber-border animate-pulse rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="font-mono text-xs text-cyber-text-dim">{'// 暂无文章'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr key={article.id} className="border-b border-cyber-border/50 hover:bg-cyber-neon/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-display text-sm text-cyber-text line-clamp-1">
                          {article.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`cyber-tag ${article.status === 'PUBLISHED' ? 'cyber-tag-green' : 'cyber-tag-yellow'}`}>
                          {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {article.category ? (
                          <span className="cyber-tag">{article.category.name}</span>
                        ) : (
                          <span className="font-mono text-xs text-cyber-text-dim">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="font-mono text-xs text-cyber-text-dim">
                          {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="font-mono text-xs text-cyber-text-dim">{article.likes}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="font-mono text-xs text-cyber-text-dim">{article.views}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="cyber-tag hover:!text-cyber-blue hover:!border-cyber-blue/50 transition-colors"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            disabled={deleting === article.id}
                            className="cyber-tag hover:!text-cyber-pink hover:!border-cyber-pink/50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deleting === article.id ? '...' : '删除'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
