'use client'

import Link from 'next/link'
import { useBookmarks } from '@/hooks/useBookmarks'

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks()

  return (
    <div className="min-h-screen">
      <section className="border-b border-cyber-border py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold neon-text mb-2">
            书签
          </h1>
          <p className="font-mono text-xs text-cyber-text-dim">
            {bookmarks.length > 0 ? `已收藏 ${bookmarks.length} 篇文章` : '暂无收藏文章'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {bookmarks.length === 0 ? (
          <div className="cyber-card p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">☆</div>
            <p className="font-mono text-cyber-text-dim text-sm mb-6">
              还没有收藏任何文章
            </p>
            <Link href="/articles" className="cyber-button px-6 py-2 text-xs">
              浏览文章
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="cyber-card p-4 group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    href={`/articles/${bookmark.slug}`}
                    className="font-display text-sm font-semibold text-cyber-text group-hover:text-cyber-neon transition-colors leading-tight"
                  >
                    {bookmark.title}
                  </Link>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    aria-label={`移除书签: ${bookmark.title}`}
                    className="flex-shrink-0 text-cyber-yellow hover:text-cyber-pink transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    ★
                  </button>
                </div>
                {bookmark.excerpt && (
                  <p className="text-cyber-text-dim text-xs line-clamp-2 mb-3">
                    {bookmark.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/articles/${bookmark.slug}`}
                    className="font-mono text-xs text-cyber-neon hover:underline"
                  >
                    阅读全文 →
                  </Link>
                  <span className="font-mono text-xs text-cyber-text-dim">
                    {new Date(bookmark.savedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
