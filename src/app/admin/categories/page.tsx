'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { categoryColorValue } from '@/lib/constants'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  count: number
}

interface Tag {
  id: string
  name: string
  slug: string
  count: number
}

type TabType = 'categories' | 'tags'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminCategoriesPage() {
  const { status: sessionStatus } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('categories')

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catSubmitting, setCatSubmitting] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatDesc, setEditCatDesc] = useState('')
  const [editCatSubmitting, setEditCatSubmitting] = useState(false)

  const [tagName, setTagName] = useState('')
  const [tagSlug, setTagSlug] = useState('')
  const [tagSubmitting, setTagSubmitting] = useState(false)
  const [tagSearch, setTagSearch] = useState('')

  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    fetchData()
  }, [sessionStatus, fetchData])

  async function handleCreateCategory() {
    if (!catName.trim() || !catSlug.trim()) return
    setCatSubmitting(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName.trim(), slug: catSlug.trim(), description: catDesc.trim() || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategories((prev) => [...prev, { ...data.category, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
        setCatName('')
        setCatSlug('')
        setCatDesc('')
      } else {
        const data = await res.json()
        alert(data.error || '创建分类失败')
      }
    } catch {
      alert('创建分类失败')
    } finally {
      setCatSubmitting(false)
    }
  }

  async function handleUpdateCategory(id: string) {
    if (!editCatName.trim()) return
    setEditCatSubmitting(true)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCatName.trim(), description: editCatDesc.trim() || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: data.category.name, description: data.category.description } : c))
        )
        setEditingCatId(null)
      } else {
        const data = await res.json()
        alert(data.error || '更新分类失败')
      }
    } catch {
      alert('更新分类失败')
    } finally {
      setEditCatSubmitting(false)
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`确定要删除分类「${name}」吗？`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || '删除分类失败')
      }
    } catch {
      alert('删除分类失败')
    } finally {
      setDeleting(null)
    }
  }

  async function handleCreateTag() {
    if (!tagName.trim() || !tagSlug.trim()) return
    setTagSubmitting(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim(), slug: tagSlug.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setTags((prev) => [...prev, { ...data.tag, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
        setTagName('')
        setTagSlug('')
      } else {
        const data = await res.json()
        alert(data.error || '创建标签失败')
      }
    } catch {
      alert('创建标签失败')
    } finally {
      setTagSubmitting(false)
    }
  }

  async function handleDeleteTag(id: string, name: string) {
    if (!confirm(`确定要删除标签「${name}」吗？关联的文章-标签关系也将被移除。`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || '删除标签失败')
      }
    } catch {
      alert('删除标签失败')
    } finally {
      setDeleting(null)
    }
  }

  function startEditCategory(cat: Category) {
    setEditingCatId(cat.id)
    setEditCatName(cat.name)
    setEditCatDesc(cat.description || '')
  }

  const filteredTags = tagSearch.trim()
    ? tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()) || t.slug.toLowerCase().includes(tagSearch.toLowerCase()))
    : tags

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
              ← 仪表盘
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-cyber-border">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 font-mono text-xs transition-colors relative ${
              activeTab === 'categories'
                ? 'text-cyber-neon'
                : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            分类管理
            {activeTab === 'categories' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-neon" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2.5 font-mono text-xs transition-colors relative ${
              activeTab === 'tags'
                ? 'text-cyber-neon'
                : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            标签管理
            {activeTab === 'tags' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-neon" />
            )}
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="cyber-card p-5">
              <div className="section-title mb-4">
                <span className="neon-text">+</span> 新建分类
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">名称</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value)
                      if (!catSlug || catSlug === slugify(catName)) {
                        setCatSlug(slugify(e.target.value))
                      }
                    }}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="分类名称"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">Slug</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">描述</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="可选"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleCreateCategory}
                  disabled={catSubmitting || !catName.trim() || !catSlug.trim()}
                  className="cyber-button text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {catSubmitting ? '创建中...' : '创建分类'}
                </button>
              </div>
            </div>

            <div className="cyber-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider"></th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">名称</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">Slug</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider hidden sm:table-cell">描述</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">文章数</th>
                      <th className="text-right font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-cyber-border/50">
                          <td className="px-4 py-3"><div className="h-4 w-4 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-24 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-32 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-8 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <p className="font-mono text-xs text-cyber-text-dim">{'// 暂无分类'}</p>
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className="border-b border-cyber-border/50 hover:bg-cyber-neon/5 transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className="inline-block w-3 h-3 rounded-sm"
                              style={{ backgroundColor: categoryColorValue[cat.slug] || '#00ff9f' }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            {editingCatId === cat.id ? (
                              <input
                                type="text"
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                className="cyber-input text-sm w-full"
                                style={{ paddingLeft: '0.5rem' }}
                                autoFocus
                              />
                            ) : (
                              <span className="font-display text-sm text-cyber-text">{cat.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-cyber-text-dim">{cat.slug}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {editingCatId === cat.id ? (
                              <input
                                type="text"
                                value={editCatDesc}
                                onChange={(e) => setEditCatDesc(e.target.value)}
                                className="cyber-input text-sm w-full"
                                style={{ paddingLeft: '0.5rem' }}
                                placeholder="可选"
                              />
                            ) : (
                              <span className="font-mono text-xs text-cyber-text-dim line-clamp-1">
                                {cat.description || '—'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="cyber-tag cyber-tag-green">{cat.count}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingCatId === cat.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  disabled={editCatSubmitting}
                                  className="cyber-tag hover:!text-cyber-neon hover:!border-cyber-neon/50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {editCatSubmitting ? '...' : '保存'}
                                </button>
                                <button
                                  onClick={() => setEditingCatId(null)}
                                  className="cyber-tag hover:!text-cyber-text-dim transition-colors cursor-pointer"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEditCategory(cat)}
                                  className="cyber-tag hover:!text-cyber-blue hover:!border-cyber-blue/50 transition-colors cursor-pointer"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  disabled={deleting === cat.id}
                                  className="cyber-tag hover:!text-cyber-pink hover:!border-cyber-pink/50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {deleting === cat.id ? '...' : '删除'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="cyber-card p-5">
              <div className="section-title mb-4">
                <span className="neon-text">+</span> 新建标签
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">名称</label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => {
                      setTagName(e.target.value)
                      if (!tagSlug || tagSlug === slugify(tagName)) {
                        setTagSlug(slugify(e.target.value))
                      }
                    }}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="标签名称"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-cyber-text-dim mb-1">Slug</label>
                  <input
                    type="text"
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value)}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="tag-slug"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCreateTag}
                    disabled={tagSubmitting || !tagName.trim() || !tagSlug.trim()}
                    className="cyber-button text-xs disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {tagSubmitting ? '创建中...' : '创建标签'}
                  </button>
                </div>
              </div>
            </div>

            <div className="cyber-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="section-title">
                  <span className="neon-text-blue">▸</span> 标签列表
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="cyber-input text-xs w-48"
                    style={{ paddingLeft: '1.75rem' }}
                    placeholder="搜索标签..."
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyber-text-dim text-xs">⌕</span>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-7 w-20 bg-cyber-border animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-mono text-xs text-cyber-text-dim">
                    {tagSearch ? '// 未找到匹配标签' : '// 暂无标签'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="group flex items-center gap-1.5 cyber-tag hover:!border-cyber-neon/40 transition-colors"
                    >
                      <span className="text-cyber-text">#{tag.name}</span>
                      <span className="text-cyber-text-dim text-[10px]">({tag.count})</span>
                      <button
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                        disabled={deleting === tag.id}
                        className="text-cyber-text-dim hover:text-cyber-pink transition-colors text-xs opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer ml-0.5"
                        title="删除标签"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cyber-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">名称</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">Slug</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">文章数</th>
                      <th className="text-right font-mono text-xs text-cyber-text-dim px-4 py-3 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-cyber-border/50">
                          <td className="px-4 py-3"><div className="h-4 w-24 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-8 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-4 py-3"><div className="h-4 w-12 bg-cyber-border animate-pulse rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredTags.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center">
                          <p className="font-mono text-xs text-cyber-text-dim">
                            {tagSearch ? '// 未找到匹配标签' : '// 暂无标签'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredTags.map((tag) => (
                        <tr key={tag.id} className="border-b border-cyber-border/50 hover:bg-cyber-neon/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-display text-sm text-cyber-text">#{tag.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-cyber-text-dim">{tag.slug}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="cyber-tag cyber-tag-blue">{tag.count}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteTag(tag.id, tag.name)}
                              disabled={deleting === tag.id}
                              className="cyber-tag hover:!text-cyber-pink hover:!border-cyber-pink/50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {deleting === tag.id ? '...' : '删除'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
