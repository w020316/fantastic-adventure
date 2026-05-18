'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { projectSchema } from '@/lib/validations'

interface ProjectData {
  id: string
  title: string
  description: string
  coverImage: string | null
  demoUrl: string | null
  repoUrl: string | null
  techStack: string[]
  featured: boolean
  order: number
}

export default function AdminProjectEditPage() {
  const { status: sessionStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [techStack, setTechStack] = useState('')
  const [featured, setFeatured] = useState(false)
  const [order, setOrder] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingProject, setLoadingProject] = useState(true)

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !projectId) return
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (res.ok) {
          const data = await res.json()
          const project: ProjectData = data.project || data
          setTitle(project.title)
          setDescription(project.description)
          setCoverImage(project.coverImage || '')
          setDemoUrl(project.demoUrl || '')
          setRepoUrl(project.repoUrl || '')
          setTechStack(project.techStack?.join(', ') || '')
          setFeatured(project.featured)
          setOrder(project.order ?? 0)
        } else {
          setError('项目未找到')
        }
      } catch {
        setError('获取项目失败')
      } finally {
        setLoadingProject(false)
      }
    }
    fetchProject()
  }, [sessionStatus, projectId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const payload = {
      title,
      description,
      coverImage: coverImage || undefined,
      demoUrl: demoUrl || undefined,
      repoUrl: repoUrl || undefined,
      techStack: techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      featured,
      order,
    }

    try {
      projectSchema.parse(payload)
    } catch (validationError: unknown) {
      if (validationError && typeof validationError === 'object' && 'issues' in validationError) {
        const issues = (validationError as { issues: { message: string; path: string[] }[] }).issues
        setError(issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '))
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/admin/projects')
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

  if (loadingProject) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 bg-cyber-surface animate-pulse rounded mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-cyber-surface animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects"
              className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors"
            >
              ← 项目列表
            </Link>
          </div>
        </div>

        <div className="cyber-card p-5 sm:p-6" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
          <div className="section-title mb-6">
            <span className="neon-text">▸</span> 编辑项目
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="cyber-input text-sm"
                style={{ paddingLeft: '1rem' }}
                placeholder="项目标题"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">描述 *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="cyber-input text-sm resize-none"
                style={{ paddingLeft: '1rem' }}
                rows={4}
                placeholder="项目描述"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">封面图片</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="cyber-input text-sm"
                style={{ paddingLeft: '1rem' }}
                placeholder="https://example.com/image.png"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">演示地址</label>
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="cyber-input text-sm"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://demo.example.com"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">仓库地址</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="cyber-input text-sm"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">技术栈 (逗号分隔)</label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="cyber-input text-sm"
                style={{ paddingLeft: '1rem' }}
                placeholder="Next.js, React, TypeScript"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  id="edit-featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-[var(--color-cyber-neon)]"
                />
                <label htmlFor="edit-featured" className="font-mono text-xs text-cyber-text-dim">
                  精选项目
                </label>
              </div>
              <div>
                <label className="block font-mono text-xs text-cyber-text-dim mb-1">排序</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="cyber-input text-sm"
                  style={{ paddingLeft: '1rem' }}
                  min={0}
                />
              </div>
            </div>

            {error && (
              <div className="font-mono text-xs text-cyber-pink p-3 border border-cyber-pink/30 rounded-sm bg-cyber-pink/5">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="cyber-button py-2 px-6 text-xs disabled:opacity-50"
              >
                {submitting ? '保存中...' : '保存修改'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/projects')}
                className="cyber-button py-2 px-6 text-xs"
                style={{ borderColor: 'var(--color-cyber-text-dim)', color: 'var(--color-cyber-text-dim)' }}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
