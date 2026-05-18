'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { fetchArticles, fetchArticle, likeArticle, submitComment } from '@/lib/api'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useReadingHistory } from '@/hooks/useReadingHistory'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'

const categoryColorMap: Record<string, string> = {
  tech: 'cyber-tag-green',
  life: 'cyber-tag-pink',
  works: 'cyber-tag-blue',
  essay: 'cyber-tag-yellow',
}

const categoryGradients: Record<string, string> = {
  tech: 'from-emerald-900/40 via-cyan-900/30 to-teal-900/40',
  life: 'from-rose-900/40 via-orange-900/30 to-amber-900/40',
  works: 'from-sky-900/40 via-blue-900/30 to-indigo-900/40',
  essay: 'from-yellow-900/40 via-amber-900/30 to-orange-900/40',
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calcReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.length / 500))
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setProgress(Math.min(100, (scrollTop / docHeight) * 100))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-16 left-0 right-0 z-30 h-0.5 bg-cyber-border/50">
      <div
        className="h-full bg-gradient-to-r from-cyber-neon via-cyber-blue to-cyber-pink transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function LikeButton({ initialLikes, articleId }: { initialLikes: number; articleId: string }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cyberblog-likes')
    if (stored) {
      const likedArticles = JSON.parse(stored)
      if (likedArticles.includes(window.location.pathname)) {
        setLiked(true)
      }
    }
  }, [])

  async function handleLike() {
    const newPath = window.location.pathname
    const stored = localStorage.getItem('cyberblog-likes')
    const likedArticles = stored ? JSON.parse(stored) : []

    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)

    if (liked) {
      setLikes((l) => l - 1)
      setLiked(false)
      const filtered = likedArticles.filter((p: string) => p !== newPath)
      localStorage.setItem('cyberblog-likes', JSON.stringify(filtered))
    } else {
      setLikes((l) => l + 1)
      setLiked(true)
      likedArticles.push(newPath)
      localStorage.setItem('cyberblog-likes', JSON.stringify(likedArticles))
      try {
        await likeArticle(articleId)
      } catch {}
    }
  }

  return (
    <button
      onClick={handleLike}
      aria-label={liked ? '取消点赞' : '点赞文章'}
      className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs transition-all border min-h-[44px] ${
        liked
          ? 'border-cyber-pink/50 text-cyber-pink bg-cyber-pink/10'
          : 'border-cyber-border text-cyber-text-dim hover:border-cyber-pink/30 hover:text-cyber-pink'
      } ${animating ? 'scale-110' : 'scale-100'}`}
      style={{ transition: 'all 0.2s ease, transform 0.2s ease' }}
    >
      <svg className={`w-4 h-4 transition-transform ${animating ? 'scale-125' : ''}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {likes}
    </button>
  )
}

function BookmarkButton({ articleId, title, slug, excerpt }: { articleId: string; title: string; slug: string; excerpt: string }) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const [bookmarked, setBookmarked] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setBookmarked(isBookmarked(articleId))
  }, [articleId, isBookmarked])

  function handleBookmark() {
    if (bookmarked) {
      removeBookmark(articleId)
      setBookmarked(false)
      setToast('已移除书签')
    } else {
      addBookmark({ id: articleId, title, slug, excerpt })
      setBookmarked(true)
      setToast('已添加书签')
    }
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleBookmark}
        aria-label={bookmarked ? '移除书签' : '添加书签'}
        className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs transition-all border min-h-[44px] ${
          bookmarked
            ? 'border-cyber-yellow/50 text-cyber-yellow bg-cyber-yellow/10'
            : 'border-cyber-border text-cyber-text-dim hover:border-cyber-yellow/30 hover:text-cyber-yellow'
        }`}
      >
        <span className="text-base">{bookmarked ? '★' : '☆'}</span>
        {bookmarked ? '已收藏' : '收藏'}
      </button>
      {toast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-sm bg-cyber-surface border border-cyber-neon/30 text-cyber-neon font-mono text-xs animate-fade-in-up pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}

function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  const handleTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [title])

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleTwitter}
        className="cyber-tag hover:scale-105 transition-transform min-h-[44px]"
        aria-label="分享到 Twitter"
      >
        Twitter
      </button>
      <button
        onClick={handleCopy}
        className={`cyber-tag hover:scale-105 transition-transform min-h-[44px] ${copied ? 'cyber-tag-green' : ''}`}
        aria-label="复制链接"
      >
        {copied ? '✓ 已复制' : '复制链接'}
      </button>
    </div>
  )
}

interface ApiComment {
  id: string
  content: string
  nickname: string
  email?: string | null
  avatar?: string | null
  createdAt: string
  parentId?: string | null
  replies?: ApiComment[]
}

function CommentSection({ articleId, initialComments }: { articleId: string; initialComments: ApiComment[] }) {
  const [commentList, setCommentList] = useState(initialComments)
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const flatComments = useMemo(() => {
    const result: (ApiComment & { isReply?: boolean })[] = []
    for (const comment of commentList) {
      result.push(comment)
      if (comment.replies && comment.replies.length > 0) {
        for (const reply of comment.replies) {
          result.push({ ...reply, isReply: true })
        }
      }
    }
    return result
  }, [commentList])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      const result = await submitComment({
        articleId,
        nickname: nickname.trim(),
        content: content.trim(),
        email: email.trim() || undefined,
      })
      if (result.comment) {
        setCommentList((prev) => [...prev, result.comment])
      }
      setNickname('')
      setContent('')
      setEmail('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="section-title">
        <span className="neon-text-blue">▸</span> 评论 ({flatComments.length})
      </div>

      <div className="cyber-card p-5 mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="comment-nickname" className="sr-only">昵称</label>
              <input
                id="comment-nickname"
                type="text"
                placeholder="昵称 *"
                className="cyber-input text-xs py-2"
                style={{ paddingLeft: '1rem' }}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="comment-email" className="sr-only">邮箱</label>
              <input
                id="comment-email"
                type="email"
                placeholder="邮箱 (不会公开)"
                className="cyber-input text-xs py-2"
                style={{ paddingLeft: '1rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="comment-content" className="sr-only">评论内容</label>
            <textarea
              id="comment-content"
              placeholder="写下你的评论... *"
              className="cyber-input text-xs py-2 resize-none"
              style={{ paddingLeft: '1rem', minHeight: '100px' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            {submitted && (
              <span className="font-mono text-xs text-cyber-neon" role="status">✓ 评论已提交，等待审核</span>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="cyber-button px-4 py-2 text-xs ml-auto disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? '提交中...' : '发表评论'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {flatComments.length > 0 ? (
          flatComments.map((comment, i) => (
            <div
              key={comment.id}
              className={`cyber-card p-4 ${comment.isReply ? 'ml-6 border-l-2 border-l-cyber-blue/30' : ''}`}
              style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s forwards`, opacity: 0 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">{comment.avatar || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-cyber-neon">{comment.nickname}</span>
                    <span className="font-mono text-xs text-cyber-text-dim">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-cyber-text text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="cyber-card p-8 text-center">
            <p className="font-mono text-cyber-text-dim text-sm">暂无评论，来抢沙发吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => {
    const matches = content.match(/^#{2,3}\s+.+$/gm)
    if (!matches) return []
    return matches.map((match) => {
      const level = match.startsWith('### ') ? 3 : 2
      const text = match.replace(/^#{2,3}\s+/, '')
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return { level, text, id }
    })
  }, [content])

  if (headings.length === 0) return null

  return (
    <div className="cyber-card p-4">
      <h3 className="section-title mb-3">
        <span className="neon-text">▸</span> 目录
      </h3>
      <nav aria-label="文章目录" className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors py-1 ${
              heading.level === 3 ? 'pl-4' : ''
            }`}
          >
            {heading.level === 3 ? '└ ' : '▸ '}{heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-4">
            <div className="h-3 w-20 bg-cyber-border/30 animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-16 bg-cyber-border/30 animate-pulse rounded" />
          </div>
          <div className="h-8 w-3/4 bg-cyber-border/30 animate-pulse rounded mb-4" />
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-cyber-border/30 animate-pulse rounded" />
            <div className="h-3 w-24 bg-cyber-border/30 animate-pulse rounded" />
            <div className="h-3 w-20 bg-cyber-border/30 animate-pulse rounded" />
          </div>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="cyber-card p-4">
              <div className="h-4 w-16 bg-cyber-border/30 animate-pulse rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-cyber-border/30 animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-cyber-border/30 animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-cyber-border/30 animate-pulse rounded" />
              </div>
            </div>
          </aside>
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="cyber-card p-6 sm:p-8 mb-6">
              <div className="space-y-3">
                <div className="h-4 w-full bg-cyber-border/30 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-cyber-border/30 animate-pulse rounded" />
                <div className="h-4 w-4/6 bg-cyber-border/30 animate-pulse rounded" />
                <div className="h-4 w-full bg-cyber-border/30 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-cyber-border/30 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ArticleData {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  status: string
  likes: number
  views: number
  publishedAt?: string | null
  author?: { id: string; name: string } | null
  category?: { id: string; name: string; slug: string; description?: string | null } | null
  tags?: { id: string; name: string; slug: string }[]
  comments?: ApiComment[]
}

interface ArticleListItem {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  category?: { id: string; name: string; slug: string } | null
  commentCount?: number
}

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const { addToHistory } = useReadingHistory()

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        setNotFound(false)
        setLoadError(false)
        const detail = await fetchArticle(slug)
        if (controller.signal.aborted) return
        if (!detail || detail.error) {
          setNotFound(true)
          return
        }
        setArticle(detail)
        addToHistory({
          id: detail.id,
          title: detail.title,
          slug: detail.slug,
        })
        const data = await fetchArticles()
        if (controller.signal.aborted) return
        const related = (data.articles || [])
          .filter((a: ArticleListItem) => a.id !== detail.id && a.category?.slug === detail.category?.slug)
          .slice(0, 2)
        setRelatedArticles(related)
      } catch {
        if (controller.signal.aborted) return
        setLoadError(true)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => controller.abort()
  }, [slug, addToHistory])

  if (loading) {
    return <ArticleSkeleton />
  }

  if (notFound || (!loading && !article)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold neon-text-pink mb-4">404</h1>
          <p className="font-mono text-cyber-text-dim text-sm mb-6">文章未找到</p>
          <Link href="/articles" className="cyber-button px-6 py-2 text-xs">
            返回文章列表
          </Link>
        </div>
      </div>
    )
  }

  if (loadError || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-4xl font-bold neon-text-pink mb-4">ERROR</div>
          <p className="font-mono text-cyber-text-dim text-sm mb-6">文章加载失败，请稍后重试</p>
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

  const coverGradient = categoryGradients[article.category?.slug || ''] || 'from-emerald-900/40 via-cyan-900/30 to-teal-900/40'
  const readingTime = calcReadingTime(article.content)
  const commentCount = article.comments?.length || 0

  return (
    <div className="min-h-screen">
      <ReadingProgressBar />

      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${coverGradient} opacity-30`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyber-bg" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-4 flex items-center gap-2">
            <Link href="/articles" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
              ← 返回列表
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-4">
            {article.category && (
              <span className={`cyber-tag ${categoryColorMap[article.category.slug]}`}>
                {article.category.name}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-cyber-text mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-cyber-text-dim font-mono">
            <span>{article.author?.name || '匿名'}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{readingTime}分钟阅读</span>
            <span>❤ {article.likes}</span>
            <span>💬 {commentCount}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-20">
              <TableOfContents content={article.content} />

              <div className="cyber-card p-4 mt-4">
                <h3 className="section-title mb-3">
                  <span className="neon-text-pink">▸</span> 分享
                </h3>
                <ShareButtons title={article.title} />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <article className="cyber-card p-6 sm:p-8 mb-6">
              <div className="prose-cyber">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSlug, rehypeHighlight]}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </article>

            {article.tags && article.tags.length > 0 && (
              <div className="cyber-card p-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-cyber-text-dim">标签:</span>
                  {article.tags.map((tag) => (
                    <Link key={tag.id} href={`/articles?tag=${tag.slug}`} className="cyber-tag">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="cyber-card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="font-mono text-xs text-cyber-text-dim">觉得这篇文章有帮助？</span>
              <div className="flex items-center gap-2">
                <BookmarkButton
                  articleId={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt || ''}
                />
                <LikeButton initialLikes={article.likes} articleId={article.id} />
              </div>
            </div>

            <CommentSection articleId={article.id} initialComments={article.comments || []} />

            {relatedArticles.length > 0 && (
              <div className="mt-8">
                <div className="section-title">
                  <span className="neon-text-yellow">▸</span> 相关文章
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={`/articles/${related.slug}`} className="cyber-card group p-4">
                      {related.category && (
                        <span className={`cyber-tag ${categoryColorMap[related.category.slug]} mb-2 inline-block`}>
                          {related.category.name}
                        </span>
                      )}
                      <h3 className="font-display text-sm font-semibold text-cyber-text group-hover:text-cyber-neon transition-colors mb-2">
                        {related.title}
                      </h3>
                      <p className="text-cyber-text-dim text-xs line-clamp-2">{related.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
