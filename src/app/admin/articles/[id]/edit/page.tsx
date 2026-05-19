'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { slugify } from '@/lib/utils'
import { articleSchema } from '@/lib/validations'
import { useAutoSave } from '@/hooks/useAutoSave'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface ArticleData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: 'DRAFT' | 'PUBLISHED'
  categoryId: string | null
  tags: { id: string; name: string; slug: string }[]
}

export default function AdminArticleEditPage() {
  const { status: sessionStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingArticle, setLoadingArticle] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)

  const draftData = useMemo(() => ({
    title, slug, excerpt, content, coverImage, categoryId, tagIds, status,
  }), [title, slug, excerpt, content, coverImage, categoryId, tagIds, status])

  const { restore, clear } = useAutoSave(draftData, `cyberblog-draft-edit-${articleId}`)

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    async function fetchMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.categories || [])
        }
        if (tagRes.ok) {
          const tagData = await tagRes.json()
          setTags(tagData.tags || [])
        }
      } catch {
      }
    }
    fetchMeta()
  }, [sessionStatus])

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !articleId) return
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${articleId}`)
        if (res.ok) {
          const data: ArticleData = await res.json()
          setTitle(data.title)
          setSlug(data.slug)
          setExcerpt(data.excerpt || '')
          setContent(data.content)
          setCoverImage(data.coverImage || '')
          setStatus(data.status)
          setCategoryId(data.categoryId || '')
          setTagIds(data.tags.map((t) => t.id))
        } else {
          setLoadError('文章未找到')
        }
      } catch {
        setLoadError('获取文章失败')
      } finally {
        setLoadingArticle(false)
      }
    }
    fetchArticle()
  }, [sessionStatus, articleId])

  useEffect(() => {
    if (loadingArticle) return
    const saved = restore()
    if (saved && typeof saved === 'object' && 'title' in saved) {
      const s = saved as typeof draftData
      if (s.title || s.content) {
        if (confirm('检测到未保存的草稿，是否恢复？')) {
          setTitle(s.title)
          setSlug(s.slug)
          setExcerpt(s.excerpt)
          setContent(s.content)
          setCoverImage(s.coverImage)
          setCategoryId(s.categoryId)
          setTagIds(s.tagIds)
          setStatus(s.status as 'DRAFT' | 'PUBLISHED')
        } else {
          clear()
        }
      }
    }
  }, [loadingArticle])

  useEffect(() => {
    if (!title && !content) return
    const timer = setInterval(() => {
      setAutoSaveIndicator(true)
      setTimeout(() => setAutoSaveIndicator(false), 3000)
    }, 30000)
    return () => clearInterval(timer)
  }, [title, content])

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value))
    }
  }, [slugManuallyEdited])

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
    setSlugManuallyEdited(true)
  }, [])

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const payload = {
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      coverImage: coverImage || undefined,
      status,
      categoryId: categoryId || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    }

    try {
      articleSchema.parse(payload)
    } catch (validationError: unknown) {
      if (validationError && typeof validationError === 'object' && 'issues' in validationError) {
        const issues = (validationError as { issues: { message: string; path: string[] }[] }).issues
        setError(issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '))
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        clear()
        router.push('/admin/articles')
      } else {
        const data = await res.json()
        setError(data.error || '更新失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingArticle) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-cyber-surface animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-cyber-surface animate-pulse rounded" />
              ))}
              <div className="h-64 bg-cyber-surface animate-pulse rounded" />
            </div>
            <div className="h-96 bg-cyber-surface animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <p className="font-mono text-sm text-cyber-pink mb-4">{loadError}</p>
            <Link href="/admin/articles" className="cyber-button text-xs py-2 px-6">
              ← 返回文章列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/articles" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
              ← 文章列表
            </Link>
          </div>
          {autoSaveIndicator && (
            <span className="font-mono text-xs text-cyber-neon/70">已自动保存</span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="cyber-input text-sm w-full"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="文章标题"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="cyber-input text-sm w-full"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="article-slug"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">摘要</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="cyber-input text-sm resize-none w-full"
                  style={{ paddingLeft: '1rem' }}
                  rows={2}
                  placeholder="简短描述..."
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">封面图片</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="cyber-input text-sm w-full"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">内容 (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="cyber-input text-sm resize-y font-mono w-full"
                  style={{ paddingLeft: '1rem', minHeight: '24rem' }}
                  placeholder="在此输入 Markdown 内容..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">分类</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '1rem' }}
                  >
                    <option value="">无分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">状态</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('DRAFT')}
                      className={`flex-1 font-mono text-xs px-3 py-2.5 rounded-sm transition-all border ${
                        status === 'DRAFT'
                          ? 'border-cyber-yellow/50 text-cyber-yellow bg-cyber-yellow/10'
                          : 'border-cyber-border text-cyber-text-dim hover:border-cyber-yellow/30'
                      }`}
                    >
                      草稿
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('PUBLISHED')}
                      className={`flex-1 font-mono text-xs px-3 py-2.5 rounded-sm transition-all border ${
                        status === 'PUBLISHED'
                          ? 'border-cyber-neon/50 text-cyber-neon bg-cyber-neon/10'
                          : 'border-cyber-border text-cyber-text-dim hover:border-cyber-neon/30'
                      }`}
                    >
                      发布
                    </button>
                  </div>
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-2">标签</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`cyber-tag transition-all ${
                          tagIds.includes(tag.id) ? 'cyber-tag-green' : ''
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="font-mono text-xs text-cyber-pink p-3 border border-cyber-pink/30 rounded-sm bg-cyber-pink/5">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="cyber-button flex-1 py-3 text-sm disabled:opacity-50"
                >
                  {submitting ? '保存中...' : '保存修改'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/articles')}
                  className="cyber-button py-3 px-6 text-sm"
                  style={{ borderColor: 'var(--color-cyber-text-dim)', color: 'var(--color-cyber-text-dim)' }}
                >
                  取消
                </button>
              </div>
            </div>

            <div className="lg:block">
              <div className="font-mono text-xs text-cyber-text-dim mb-2">
                <span className="neon-text-blue">▸</span> 预览
              </div>
              <div className="cyber-card p-4 sm:p-6 min-h-[20rem] lg:min-h-[32rem] max-h-[80vh] overflow-y-auto">
                {content ? (
                  <div className="prose-cyber">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSlug, rehypeHighlight]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-cyber-text-dim">
                    {'// 在上方输入 Markdown 内容，预览将在此显示'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
