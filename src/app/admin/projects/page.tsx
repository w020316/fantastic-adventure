'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { projectSchema } from '@/lib/validations'

interface Project {
  id: string
  title: string
  subtitle?: string | null
  description: string
  impact?: string | null
  metrics?: { label?: string; value?: string | number; suffix?: string; display?: string }[] | null
  coverImage?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
  caseStudyUrl?: string | null
  techStack: string[]
  featured: boolean
  order?: number
  createdAt?: string
}

interface MetricRow {
  label: string
  value: string
  suffix: string
  display: string
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
  subtitle: '',
  description: '',
  impact: '',
  coverImage: '',
  demoUrl: '',
  repoUrl: '',
  caseStudyUrl: '',
  techStack: '',
  featured: false,
  order: 0,
}

// 预览卡片组件（复用 /projects 页面的赛博朋克卡片风格）
function PreviewCard({ project, index }: { project: Partial<Project>; index: number }) {
  const metrics = project.metrics ?? []
  return (
    <article className="cyber-card group p-6 sm:p-8 flex flex-col" style={{ opacity: 1 }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-[var(--color-text-tertiary)] tracking-widest">
              {String(index + 1).padStart(2, '0')}
            </span>
            {project.featured && (
              <span className="tag tag-brand">★ FEATURED</span>
            )}
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
            {project.title || '项目标题'}
          </h2>
          {project.subtitle && (
            <p className="font-mono text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 tracking-wide">
              {project.subtitle}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed mb-5">
        {project.description || '项目描述将显示在这里'}
      </p>

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {metrics.map((m, i) => (
            <div key={i} className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)] p-3">
              <div className="font-display text-lg sm:text-xl font-bold neon-text leading-none">
                {m.display ?? `${m.value ?? ''}${m.suffix ?? ''}`}
              </div>
              {m.label && (
                <div className="font-mono text-[11px] text-[var(--color-text-tertiary)] mt-1.5 tracking-wide">
                  {m.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {project.impact && (
        <div className="mb-5 pl-4 border-l-2 border-[var(--color-brand)]">
          <div className="font-mono text-[11px] text-[var(--color-brand)] tracking-widest mb-1">IMPACT</div>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{project.impact}</p>
        </div>
      )}

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-auto pt-5 border-t border-[var(--color-border-subtle)]">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
            源码
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
            演示
          </a>
        )}
      </div>
    </article>
  )
}

// 文件夹扫描结果项
interface ScannedProject {
  folderName: string
  path: string
  hasPackageJson: boolean
  hasReadme: boolean
  projectName?: string
  description?: string
  techStack?: string[]
  homepage?: string
  repository?: string
  alreadyAdded?: boolean
}

export default function AdminProjectsPage() {
  const { status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [metricsRows, setMetricsRows] = useState<MetricRow[]>([{ label: '', value: '', suffix: '', display: '' }])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  // 预览确认步骤：'edit' | 'preview'
  const [step, setStep] = useState<'edit' | 'preview'>('edit')
  // 文件夹扫描
  const [scanning, setScanning] = useState(false)
  const [scannedProjects, setScannedProjects] = useState<ScannedProject[] | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

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

  // 构建提交 payload（含 metrics）
  function buildPayload() {
    const cleanMetrics = metricsRows
      .filter((r) => r.label || r.value || r.display)
      .map((r) => ({
        label: r.label || undefined,
        value: r.value ? (isNaN(Number(r.value)) ? r.value : Number(r.value)) : undefined,
        suffix: r.suffix || undefined,
        display: r.display || undefined,
      }))
    return {
      title: form.title,
      subtitle: form.subtitle || '',
      description: form.description,
      impact: form.impact || '',
      metrics: cleanMetrics.length > 0 ? cleanMetrics : undefined,
      coverImage: form.coverImage || '',
      demoUrl: form.demoUrl || '',
      repoUrl: form.repoUrl || '',
      caseStudyUrl: form.caseStudyUrl || '',
      techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
      order: form.order,
    }
  }

  function validateForm() {
    const payload = buildPayload()
    const result = projectSchema.safeParse(payload)
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

  // 步骤1：填写表单 → 点击"预览"按钮
  function handlePreview() {
    if (validateForm()) {
      setStep('preview')
    }
  }

  // 步骤2：确认提交
  async function handleConfirmSubmit() {
    if (!validateForm()) {
      setStep('edit')
      return
    }
    setSubmitting(true)
    try {
      const payload = buildPayload()
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setShowForm(false)
        setForm(emptyForm)
        setMetricsRows([{ label: '', value: '', suffix: '', display: '' }])
        setFormErrors({})
        setStep('edit')
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

  // 扫描项目文件夹
  async function handleScan() {
    setScanning(true)
    setScanError(null)
    setScannedProjects(null)
    try {
      const res = await fetch('/api/projects/scan', { method: 'GET' })
      const data = await res.json()
      if (res.ok) {
        setScannedProjects(data.projects || [])
        if (data.error) setScanError(data.error)
      } else {
        setScanError(data.error || '扫描失败')
      }
    } catch (e) {
      setScanError(e instanceof Error ? e.message : '网络错误')
    } finally {
      setScanning(false)
    }
  }

  // 从扫描结果填充表单
  function fillFromScanned(sp: ScannedProject) {
    setForm({
      ...emptyForm,
      title: sp.projectName || sp.folderName,
      description: sp.description || '',
      demoUrl: sp.homepage || '',
      repoUrl: sp.repository || '',
      techStack: (sp.techStack || []).join(', '),
    })
    setMetricsRows([{ label: '', value: '', suffix: '', display: '' }])
    setFormErrors({})
    setShowForm(true)
    setStep('edit')
    setScannedProjects(null)
  }

  // 渲染表单字段（edit 步骤）
  function renderFormFields() {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handlePreview() }} className="space-y-4">
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
          <label htmlFor="proj-subtitle" className="block font-mono text-xs text-cyber-text-dim mb-1">
            副标题（一句话定位）
          </label>
          <input
            id="proj-subtitle"
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="cyber-input text-sm"
            style={{ paddingLeft: '1rem' }}
            placeholder="如：xxx · Next.js 全栈应用"
          />
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
            rows={4}
            placeholder="项目描述"
          />
          {formErrors.description && (
            <p className="font-mono text-xs text-cyber-pink mt-1">{formErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="proj-impact" className="block font-mono text-xs text-cyber-text-dim mb-1">
            项目成果 / 业务价值（IMPACT）
          </label>
          <textarea
            id="proj-impact"
            value={form.impact}
            onChange={(e) => setForm({ ...form, impact: e.target.value })}
            className="cyber-input text-sm"
            style={{ paddingLeft: '1rem' }}
            rows={2}
            placeholder="项目带来的价值或成果"
          />
        </div>

        {/* 量化指标 metrics 动态行 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-xs text-cyber-text-dim">量化指标（可添加多行）</label>
            <button
              type="button"
              onClick={() => setMetricsRows([...metricsRows, { label: '', value: '', suffix: '', display: '' }])}
              className="cyber-button py-0.5 px-2 text-[10px]"
            >
              + 添加指标
            </button>
          </div>
          <div className="space-y-2">
            {metricsRows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => {
                    const next = [...metricsRows]
                    next[i] = { ...row, label: e.target.value }
                    setMetricsRows(next)
                  }}
                  className="cyber-input text-xs col-span-4"
                  style={{ paddingLeft: '0.5rem' }}
                  placeholder="标签(如:版本)"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...metricsRows]
                    next[i] = { ...row, value: e.target.value }
                    setMetricsRows(next)
                  }}
                  className="cyber-input text-xs col-span-3"
                  style={{ paddingLeft: '0.5rem' }}
                  placeholder="数值"
                />
                <input
                  type="text"
                  value={row.suffix}
                  onChange={(e) => {
                    const next = [...metricsRows]
                    next[i] = { ...row, suffix: e.target.value }
                    setMetricsRows(next)
                  }}
                  className="cyber-input text-xs col-span-2"
                  style={{ paddingLeft: '0.5rem' }}
                  placeholder="后缀(如:+)"
                />
                <input
                  type="text"
                  value={row.display}
                  onChange={(e) => {
                    const next = [...metricsRows]
                    next[i] = { ...row, display: e.target.value }
                    setMetricsRows(next)
                  }}
                  className="cyber-input text-xs col-span-2"
                  style={{ paddingLeft: '0.5rem' }}
                  placeholder="显示文本"
                />
                <button
                  type="button"
                  onClick={() => setMetricsRows(metricsRows.filter((_, idx) => idx !== i))}
                  className="cyber-button py-0.5 px-2 text-[10px] col-span-1"
                  style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
                  disabled={metricsRows.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-cyber-text-dim mt-1">
            说明：显示文本优先于数值+后缀。如填"Vercel"则直接显示文本。
          </p>
        </div>

        <div>
          <label htmlFor="proj-cover" className="block font-mono text-xs text-cyber-text-dim mb-1">
            封面图片 URL
          </label>
          <input
            id="proj-cover"
            type="text"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className="cyber-input text-sm"
            style={{ paddingLeft: '1rem' }}
            placeholder="https://example.com/image.png"
          />
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
          <label htmlFor="proj-case" className="block font-mono text-xs text-cyber-text-dim mb-1">
            案例研究地址（可选）
          </label>
          <input
            id="proj-case"
            type="text"
            value={form.caseStudyUrl}
            onChange={(e) => setForm({ ...form, caseStudyUrl: e.target.value })}
            className="cyber-input text-sm"
            style={{ paddingLeft: '1rem' }}
            placeholder="https://..."
          />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label htmlFor="proj-order" className="block font-mono text-xs text-cyber-text-dim mb-1">
              排序（数字越小越靠前）
            </label>
            <input
              id="proj-order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
              className="cyber-input text-sm"
              style={{ paddingLeft: '1rem' }}
              min={0}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="cyber-button py-2 px-6 text-xs"
          >
            预览确认 →
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setForm(emptyForm)
              setMetricsRows([{ label: '', value: '', suffix: '', display: '' }])
              setFormErrors({})
              setStep('edit')
            }}
            className="cyber-button py-2 px-6 text-xs"
            style={{ borderColor: 'var(--color-cyber-text-dim)', color: 'var(--color-cyber-text-dim)' }}
          >
            取消
          </button>
        </div>
      </form>
    )
  }

  // 渲染预览步骤
  function renderPreviewStep() {
    const payload = buildPayload()
    const previewProject: Partial<Project> = {
      ...payload,
      techStack: payload.techStack,
      metrics: payload.metrics,
    }
    return (
      <div className="space-y-4">
        <div className="font-mono text-xs text-cyber-neon mb-3">
          ▸ 预览确认（步骤 2/2）
        </div>
        <PreviewCard project={previewProject} index={0} />
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={submitting}
            className="cyber-button py-2 px-6 text-xs disabled:opacity-50"
          >
            {submitting ? '创建中...' : '✓ 确认创建'}
          </button>
          <button
            type="button"
            onClick={() => setStep('edit')}
            className="cyber-button py-2 px-6 text-xs"
            style={{ borderColor: 'var(--color-cyber-text-dim)', color: 'var(--color-cyber-text-dim)' }}
          >
            ← 返回编辑
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="font-mono text-xs text-cyber-text-dim">
          共 {projects.length} 个项目
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="cyber-button py-1.5 px-4 text-xs disabled:opacity-50"
            style={{ borderColor: 'var(--color-cyber-blue)' }}
          >
            {scanning ? '扫描中...' : '📂 扫描项目文件夹'}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setForm(emptyForm)
              setMetricsRows([{ label: '', value: '', suffix: '', display: '' }])
              setFormErrors({})
              setStep('edit')
            }}
            className="cyber-button py-1.5 px-4 text-xs"
          >
            {showForm ? '取消' : '+ 新建项目'}
          </button>
        </div>
      </div>

      {/* 文件夹扫描结果 */}
      {scanError && (
        <div className="cyber-card p-4 mb-6" style={{ borderColor: 'var(--color-cyber-yellow)' }}>
          <div className="font-mono text-xs text-cyber-text-dim">
            <span className="text-cyber-yellow">⚠</span> {scanError}
          </div>
        </div>
      )}
      {scannedProjects && (
        <div className="cyber-card p-5 mb-6" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
          <div className="section-title mb-4">
            <span className="neon-text">▸</span> 扫描到 {scannedProjects.length} 个项目文件夹
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scannedProjects.map((sp) => (
              <div key={sp.path} className="cyber-card p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-cyber-neon">📁</span>
                  <span className="font-mono text-xs text-cyber-text truncate">{sp.folderName}</span>
                  {sp.alreadyAdded && (
                    <span className="cyber-tag cyber-tag-yellow text-[9px] ml-auto">已收录</span>
                  )}
                </div>
                {sp.projectName && sp.projectName !== sp.folderName && (
                  <div className="text-xs text-cyber-text-dim mb-1">{sp.projectName}</div>
                )}
                {sp.description && (
                  <p className="text-[10px] text-cyber-text-dim leading-relaxed mb-2 line-clamp-2">
                    {sp.description}
                  </p>
                )}
                {sp.techStack && sp.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {sp.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="cyber-tag text-[9px]">{t}</span>
                    ))}
                    {sp.techStack.length > 4 && (
                      <span className="cyber-tag text-[9px]">+{sp.techStack.length - 4}</span>
                    )}
                  </div>
                )}
                <div className="font-mono text-[9px] text-cyber-text-dim mb-2">
                  {sp.hasPackageJson ? '✓ package.json' : '✗ package.json'}
                  {' · '}
                  {sp.hasReadme ? '✓ README' : '✗ README'}
                </div>
                {!sp.alreadyAdded && (
                  <button
                    onClick={() => fillFromScanned(sp)}
                    className="cyber-button py-1 px-3 text-[10px] mt-auto"
                  >
                    填充到表单 →
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setScannedProjects(null)}
            className="cyber-button py-1 px-3 text-[10px] mt-3"
            style={{ borderColor: 'var(--color-cyber-text-dim)', color: 'var(--color-cyber-text-dim)' }}
          >
            关闭扫描结果
          </button>
        </div>
      )}

      {/* 新建项目表单 */}
      {showForm && (
        <div className="cyber-card p-5 mb-6" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
          <div className="section-title mb-4">
            <span className="neon-text">▸</span> {step === 'edit' ? '新建项目（步骤 1/2：填写信息）' : '预览确认'}
          </div>
          {step === 'edit' ? renderFormFields() : renderPreviewStep()}
        </div>
      )}

      {/* 项目列表 */}
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
              {project.subtitle && (
                <p className="font-mono text-[10px] text-cyber-text-dim mb-2">{project.subtitle}</p>
              )}
              <p className="text-cyber-text-dim text-xs leading-relaxed mb-3 flex-1 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack?.slice(0, 5).map((tech) => (
                  <span key={tech} className="cyber-tag">{tech}</span>
                ))}
                {project.techStack?.length > 5 && (
                  <span className="cyber-tag">+{project.techStack.length - 5}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cyber-border">
                <span className="font-mono text-[10px] text-cyber-text-dim">
                  排序: {project.order ?? 0}
                </span>
                <div className="flex items-center gap-2">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
