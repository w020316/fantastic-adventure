'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

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

export default function AdminArticlesPage() {
  const { status: sessionStatus } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="font-mono text-xs text-cyber-text-dim">{'// 暂无文章'}</p>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
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
