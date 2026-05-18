'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { projectSchema } from '@/lib/validations'

interface Project {
  id: string
  title: string
  description: string
  demoUrl?: string
  repoUrl?: string
  techStack: string[]
  featured: boolean
  order?: number
}

function SkeletonCard() {
  return (
    <div className="cyber-card p-5 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-cyber-border rounded" />
          <div className="h-4 w-12 bg-cyber-border rounded" />
        </div>
        <div className="h-3 w-full bg-cyber-border rounded" />
        <div className="h-3 w-3/4 bg-cyber-border rounded" />
        <div className="flex gap-1.5">
          <div className="h-4 w-14 bg-cyber-border rounded" />
          <div className="h-4 w-14 bg-cyber-border rounded" />
          <div className="h-4 w-14 bg-cyber-border rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-14 bg-cyber-border rounded" />
          <div className="h-6 w-14 bg-cyber-border rounded" />
        </div>
      </div>
    </div>
  )
}

const emptyForm = {
  title: '',
  description: '',
  demoUrl: '',
  repoUrl: '',
  techStack: '',
  featured: false,
}

export default function AdminProjectsPage() {
  const { status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(Array.isArray(data) ? data : data.projects ?? [])
      }
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, fetchProjects])

  function validateForm() {
    const result = projectSchema.safeParse({
      title: form.title,
      description: form.description,
      demoUrl: form.demoUrl || '',
      repoUrl: form.repoUrl || '',
      techStack: form.techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      featured: form.featured,
    })
    if (result.success) {
      setFormErrors({})
      return true
    }
    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !errors[key]) {
        errors[key] = issue.message
      }
    }
    setFormErrors(errors)
    return false
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          demoUrl: form.demoUrl || undefined,
          repoUrl: form.repoUrl || undefined,
          techStack: form.techStack
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          featured: form.featured,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm(emptyForm)
        setFormErrors({})
        fetchProjects()
      }
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteProject(id: string) {
    if (!window.confirm('确定要删除此项目吗？此操作不可撤销。')) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {}
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button
          onClick={() => {
            setShowForm(!showForm)
            setForm(emptyForm)
            setFormErrors({})
          }}
          className="cyber-button py-1.5 px-4 text-xs"
        >
          {showForm ? '取消' : '+ 新建项目'}
        </button>
      </div>

      {showForm && (
        <div className="cyber-card p-5 mb-6" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
          <div className="section-title mb-4">
            <span className="neon-text">▸</span> 新建项目
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="proj-title" className="block font-mono text-xs text-cyber-text-dim mb-1">
                标题 *
              </label>
              <input
                id="proj-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="cyber-input text-sm"
                style={{ paddingLeft: '1rem' }}
                placeholder="项目标题"
              />
              {formErrors.title && (
                <p className="font-mono text-xs text-cyber-pink mt-1">{formErrors.title}</p>
              )}
            </div>
            <div>
              <label htmlFor="proj-desc" className="block font-mono text-xs text-cyber-text-dim mb-1">
                描述 *
              </label>
              <textarea
                id="proj-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="cyber-input text-sm"
                style={{ paddingLeft: '1rem' }}
                rows={3}
                placeholder="项目描述"
              />
              {formErrors.description && (
                <p className="font-mono text-xs text-cyber-pink mt-1">{formErrors.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="proj-demo" className="block font-mono text-xs text-cyber-text-dim mb-1">
                  演示地址
                </label>
                <input
                  id="proj-demo"
                  type="text"
                  value={form.demoUrl}
                  onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  className="cyber-input text-sm"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://demo.example.com"
                />
                {formErrors.demoUrl && (
                  <p className="font-mono text-xs text-cyber-pink mt-1">{formErrors.demoUrl}</p>
                )}
              </div>
              <div>
                <label htmlFor="proj-repo" className="block font-mono text-xs text-cyber-text-dim mb-1">
                  仓库地址
                </label>
                <input
                  id="proj-repo"
                  type="text"
                  value={form.repoUrl}
                  onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                  className="cyber-input text-sm"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://github.com/..."
                />
                {formErrors.repoUrl && (
                  <p className="font-mono text-xs text-cyber-pink mt-1">{formErrors.repoUrl}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="proj-tech" className="block font-mono text-xs text-cyber-text-dim mb-1">
                技术栈 (逗号分隔)
              </label>
              <input
                id="proj-tech"
                type="text"
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                className="cyber-input text-sm"
                style={{ paddingLeft: '1rem' }}
                placeholder="Next.js, React, TypeScript"
              />
              {formErrors.techStack && (
                <p className="font-mono text-xs text-cyber-pink mt-1">{formErrors.techStack}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="proj-featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="accent-[var(--color-cyber-neon)]"
              />
              <label htmlFor="proj-featured" className="font-mono text-xs text-cyber-text-dim">
                精选项目
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="cyber-button py-2 px-6 text-xs disabled:opacity-50"
              >
                {submitting ? '创建中...' : '创建项目'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setForm(emptyForm)
                  setFormErrors({})
                }}
                className="cyber-button py-2 px-6 text-xs"
                style={{ borderColor: 'var(--color-cyber-text-dim)', color: 'var(--color-cyber-text-dim)' }}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <p className="font-mono text-cyber-text-dim text-sm">暂无项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="cyber-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-sm font-bold text-cyber-text leading-tight">
                  {project.title}
                </h3>
                {project.featured && (
                  <span className="cyber-tag cyber-tag-yellow flex-shrink-0 ml-2">★ 精选</span>
                )}
              </div>
              <p className="text-cyber-text-dim text-xs leading-relaxed mb-3 flex-1 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack?.map((tech) => (
                  <span key={tech} className="cyber-tag">{tech}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-cyber-border">
                <a
                  href={`/admin/projects/${project.id}`}
                  className="cyber-button py-1 px-3 text-xs"
                >
                  编辑
                </a>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="cyber-button py-1 px-3 text-xs"
                  style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
