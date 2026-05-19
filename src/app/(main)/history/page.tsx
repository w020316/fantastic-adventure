'use client'

import Link from 'next/link'
import { useReadingHistory } from '@/hooks/useReadingHistory'
import { useState } from 'react'

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (itemDate.getTime() === today.getTime()) return '今天'
  if (itemDate.getTime() === yesterday.getTime()) return '昨天'
  return '更早'
}

function formatReadTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryPage() {
  const { history, clearHistory } = useReadingHistory()
  const [showConfirm, setShowConfirm] = useState(false)

  const grouped = history.reduce<Record<string, typeof history>>((acc, item) => {
    const group = getDateGroup(item.readAt)
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  const groupOrder = ['今天', '昨天', '更早']

  return (
    <div className="min-h-screen">
      <section className="border-b border-cyber-border py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold neon-text mb-2">
            阅读历史
          </h1>
          <p className="font-mono text-xs text-cyber-text-dim">
            {history.length > 0 ? `共 ${history.length} 条阅读记录` : '暂无阅读记录'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="cyber-card p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">◷</div>
            <p className="font-mono text-cyber-text-dim text-sm mb-6">
              还没有阅读任何文章
            </p>
            <Link href="/articles" className="cyber-button px-6 py-2 text-xs">
              浏览文章
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              {showConfirm ? (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-cyber-pink">确认清空所有历史？</span>
                  <button
                    onClick={() => { clearHistory(); setShowConfirm(false) }}
                    className="cyber-button text-xs py-1.5 px-3"
                    style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="cyber-button text-xs py-1.5 px-3"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="cyber-button text-xs py-1.5 px-3"
                  style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
                >
                  清空历史
                </button>
              )}
            </div>

            {groupOrder.map((group) => {
              const items = grouped[group]
              if (!items || items.length === 0) return null

              return (
                <div key={group} className="mb-8">
                  <div className="section-title mb-4">
                    <span className="neon-text-blue">▸</span> {group}
                    <span className="cyber-tag cyber-tag-blue text-[10px] ml-2">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div key={item.id} className="cyber-card p-4 group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/articles/${item.slug}`}
                              className="font-display text-sm font-semibold text-cyber-text group-hover:text-cyber-neon transition-colors leading-tight block"
                            >
                              {item.title}
                            </Link>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="font-mono text-xs text-cyber-text-dim">
                                {formatReadTime(item.readAt)}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/articles/${item.slug}`}
                            className="font-mono text-xs text-cyber-neon hover:underline flex-shrink-0"
                          >
                            阅读全文
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
