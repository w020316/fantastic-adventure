'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SectionReveal from '@/components/ui/SectionReveal'
import CountUp from '@/components/ui/CountUp'
import { SITE_CONFIG } from '@/lib/site-config'

interface ProjectMetric {
  label: string
  value: number
  suffix?: string
  display?: string
}

interface Project {
  id: string
  title: string
  subtitle: string
  description: string
  metrics: ProjectMetric[]
  techStack: string[]
  demoUrl?: string
  repoUrl?: string
  featured?: boolean
}

// 项目分类推断：根据技术栈自动归类（4 大类：前端 / Java后端 / 全栈 / AI项目）
type ProjectCategory = '前端' | 'Java后端' | '全栈' | 'AI项目'

const CATEGORY_CONFIG: Record<ProjectCategory, { color: string; bg: string; border: string }> = {
  '前端': { color: '#0066cc', bg: 'rgba(0,102,204,0.1)', border: 'rgba(0,102,204,0.4)' },
  'Java后端': { color: '#cc5500', bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.4)' },
  '全栈': { color: '#0a0a0a', bg: 'rgba(204,255,0,0.15)', border: 'rgba(204,255,0,0.5)' },
  'AI项目': { color: '#cc0066', bg: 'rgba(204,0,102,0.1)', border: 'rgba(204,0,102,0.4)' },
}

function inferCategory(techStack: string[]): ProjectCategory {
  const stack = techStack.join(' ').toLowerCase()
  // AI项目：含 CV / ML / LLM / RAG 等技术（计算机视觉归入此类）
  if (['yolo', 'opencv', 'pytorch', 'tensorflow', 'deepseek', 'chromadb', 'rag', 'llm', '智能体', 'agent'].some((k) => stack.includes(k))) return 'AI项目'
  // Java后端：精确匹配 java 关键词（避免 JavaScript 误判）+ Java Web 技术栈
  const hasJava = techStack.some((t) => /^java$/i.test(t.trim()))
  const hasJavaWeb = ['tomcat', 'jsp', 'maven', 'spring boot', 'springboot'].some((k) => stack.includes(k))
  if (hasJava || hasJavaWeb) return 'Java后端'
  // 全栈：同时含前端框架 + 后端技术
  const hasFrontend = ['vue', 'react', 'next.js', 'nextjs'].some((k) => stack.includes(k))
  const hasBackend = ['prisma', 'serverless', 'postgresql', 'node.js', 'nodejs', 'express', 'koa', 'mysql'].some((k) => stack.includes(k))
  if (hasFrontend && hasBackend) return '全栈'
  if (stack.includes('spring boot') || stack.includes('springboot')) return '全栈'
  // 默认前端
  return '前端'
}

// 难度推断：根据技术栈复杂度评估（1-5，越大越难）
function inferDifficulty(techStack: string[], description: string): number {
  const stack = techStack.join(' ').toLowerCase()
  const desc = description.toLowerCase()
  let score = 2
  // AI/CV 项目难度最高
  if (['yolo', 'opencv', 'pytorch', 'tensorflow', 'rag', 'llm', 'chromadb'].some((k) => stack.includes(k))) score += 2
  // 全栈项目
  if (/(next\.?js|react|vue)/.test(stack) && /(prisma|postgres|mysql)/.test(stack)) score += 1
  // 多技术栈组合
  if (techStack.length >= 5) score += 1
  // 含部署/CI
  if (/(docker|kubernetes|redis|github actions)/.test(stack)) score += 1
  // 简单静态页面
  if (/(landing|template|starter|静态|展示)/.test(desc + stack)) score -= 1
  return Math.max(1, Math.min(5, score))
}

// Fallback 数据：当数据库无数据时使用（已按难度从高到低排列）
const fallbackProjects: Project[] = [
  {
    id: 'p2',
    title: 'YOLO 食品安全检测系统',
    subtitle: '基于 YOLO 的食品加工人员异常行为检测',
    description: '基于 YOLO 目标检测算法，实时识别食品加工人员是否佩戴安全装备、是否存在违规操作。含训练数据集、模型训练、Web 检测界面，已部署 GitHub Pages。',
    metrics: [
      { label: '检测类别', value: 5, suffix: '+' },
      { label: 'mAP', value: 85, suffix: '%' },
      { label: '实时 FPS', value: 30, suffix: '+' },
    ],
    techStack: ['Python', 'YOLO', 'OpenCV', 'PyTorch'],
    demoUrl: 'https://w020316.github.io/YOLO-/',
    repoUrl: 'https://github.com/w020316/YOLO-',
  },
  {
    id: 'p1',
    title: '个人数字品牌作品集',
    subtitle: '本站 · Next.js 15 全栈作品集系统',
    description: '基于 Next.js 15 App Router 的个人作品集系统，含 CMS 后台、博客、项目管理、联系表单。支持鼠标光斑、3D 倾斜卡片等高级交互，深色极简设计。',
    metrics: [
      { label: '技术栈', value: 0, display: 'Next.js 15' },
      { label: '页面数', value: 34, suffix: '+' },
      { label: 'Lighthouse', value: 90, suffix: '+' },
    ],
    techStack: ['Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'Tailwind CSS'],
    demoUrl: 'https://fantastic-adventure.fly.dev',
    repoUrl: 'https://github.com/w020316/fantastic-adventure',
    featured: true,
  },
  {
    id: 'p3',
    title: '情侣日记',
    subtitle: 'xiaoling-rij · Next.js 全栈情侣应用',
    description: '基于 Next.js 的情侣日记应用，支持日记撰写、天气定位、AI 智能互动。含 Prisma 数据库、Vercel 部署、GitHub Actions 自动化 CI/CD，经历 41 次迭代提交。',
    metrics: [
      { label: '迭代次数', value: 41, suffix: '+' },
      { label: '版本', value: 2, suffix: '.5' },
      { label: '部署', value: 0, display: 'Vercel' },
    ],
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'Vercel', 'GitHub Actions'],
    demoUrl: 'https://xiaoling-rij.vercel.app',
    repoUrl: 'https://github.com/w020316/xiaoling-rij',
  },
]

interface ProjectsSectionProps {
  projects?: Array<{
    id: string
    title: string
    subtitle?: string | null
    description: string
    metrics?: unknown
    techStack: string[]
    demoUrl?: string | null
    repoUrl?: string | null
    featured: boolean
    order: number
  }>
}

/**
 * Projects 区块 - 浅色背景 + 量化指标
 * 优先使用数据库项目数据，无数据时使用 fallback
 * 按难度从高到低排列，支持分类筛选
 */
export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // 将数据库项目转换为组件所需格式
  const allProjects: Project[] = useMemo(() => {
    if (projects && projects.length > 0) {
      return projects.map((p) => {
        const metrics = (p.metrics as ProjectMetric[] | null) ?? []
        const isSiteProject = /个人|作品集|博客|本站/.test(p.title + (p.subtitle ?? ''))
        const repoIsUserHome = p.repoUrl === SITE_CONFIG.github || !p.repoUrl
        return {
          id: p.id,
          title: p.title,
          subtitle: p.subtitle ?? '',
          description: p.description,
          metrics: metrics.length > 0 ? metrics : [{ label: '状态', value: 0, display: 'Live' }],
          techStack: p.techStack,
          demoUrl: p.demoUrl ?? (isSiteProject ? SITE_CONFIG.siteUrl : undefined),
          repoUrl: isSiteProject && repoIsUserHome
            ? `https://github.com/${SITE_CONFIG.githubUsername}/fantastic-adventure`
            : (p.repoUrl ?? undefined),
          featured: p.featured,
        }
      })
    }
    return fallbackProjects
  }, [projects])

  // 按难度从高到低排序
  const sortedProjects = useMemo(() => {
    return [...allProjects].sort((a, b) => {
      const da = inferDifficulty(a.techStack, a.description)
      const db = inferDifficulty(b.techStack, b.description)
      return db - da
    })
  }, [allProjects])

  // 预计算分类
  const projectCategories = useMemo(() => {
    const map = new Map<string, ProjectCategory>()
    allProjects.forEach((p) => map.set(p.id, inferCategory(p.techStack)))
    return map
  }, [allProjects])

  // 所有分类
  const allCategories = useMemo(() => {
    const set = new Set<ProjectCategory>()
    projectCategories.forEach((c) => set.add(c))
    return Array.from(set)
  }, [projectCategories])

  // 筛选后的项目
  const displayProjects = useMemo(() => {
    if (activeCategory === 'all') return sortedProjects
    return sortedProjects.filter((p) => projectCategories.get(p.id) === activeCategory)
  }, [sortedProjects, activeCategory, projectCategories])

  return (
    <section id="projects" className="relative py-24 sm:py-32 bg-[#f5f5f5] text-[#111]">
      <div className="max-w-6xl mx-auto px-4">
        <SectionReveal>
          <p className="section-label" style={{ color: '#888' }}>
            <span style={{ color: '#0a0a0a' }}>03</span>
            PROJECTS
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#111] mb-4">
            精选项目
          </h2>
          <p className="text-sm text-[#666] mb-8 max-w-lg">
            每个项目都是一次从想法到落地的完整旅程，按技术难度从高到低排列，点击在线体验直接使用。
          </p>
        </SectionReveal>

        {/* 分类筛选 */}
        {allCategories.length > 1 && (
          <SectionReveal delay={100}>
            <div className="flex flex-wrap items-center gap-2 mb-12">
              <span className="font-mono text-[10px] text-[#999] tracking-widest mr-1">CATEGORY:</span>
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 text-[11px] font-mono border rounded-full transition-all ${
                  activeCategory === 'all'
                    ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                    : 'bg-transparent text-[#666] border-[#d0d0d0] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                }`}
              >
                全部
              </button>
              {allCategories.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat]
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(isActive ? 'all' : cat)}
                    className="px-3 py-1 text-[11px] font-mono border rounded-full transition-all"
                    style={
                      isActive
                        ? { background: cfg.bg, borderColor: cfg.border, color: cfg.color }
                        : { background: 'transparent', borderColor: '#d0d0d0', color: '#666' }
                    }
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </SectionReveal>
        )}

        <div className="space-y-4">
          {displayProjects.map((project, i) => {
            const category = projectCategories.get(project.id) ?? '前端'
            const catCfg = CATEGORY_CONFIG[category]
            const difficulty = inferDifficulty(project.techStack, project.description)
            return (
              <SectionReveal key={project.id} delay={i * 80}>
                <div className="group relative bg-white border border-[#e0e0e0] rounded-2xl p-6 sm:p-8 hover:border-[#0a0a0a] transition-all duration-300 hover:shadow-lg">
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    {/* 左侧 - 项目信息 */}
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {project.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ccff00] text-[#0a0a0a] text-[10px] font-mono font-bold rounded-full">
                            ★ FEATURED
                          </span>
                        )}
                        {/* 分类标签 */}
                        <span
                          className="inline-flex px-2 py-0.5 text-[10px] font-mono border rounded-full"
                          style={{ background: catCfg.bg, borderColor: catCfg.border, color: catCfg.color }}
                        >
                          {category}
                        </span>
                        {/* 难度标签 */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border border-[#e0e0e0] rounded-full text-[#999]"
                          title={`技术难度 ${difficulty}/5`}
                        >
                          <span style={{ color: difficulty >= 4 ? '#cc0066' : difficulty >= 3 ? '#996600' : '#666' }}>
                            {'★'.repeat(difficulty)}
                          </span>
                          <span style={{ color: '#ccc' }}>{'★'.repeat(5 - difficulty)}</span>
                        </span>
                        <span className="font-mono text-xs text-[#999]">0{i + 1}</span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-[#111] mb-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-[#666] mb-3">{project.subtitle}</p>
                      <p className="text-sm text-[#888] leading-relaxed mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex px-2 py-0.5 text-[10px] font-mono border border-[#e0e0e0] rounded-full text-[#666] group-hover:border-[#0a0a0a]/30 transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 右侧 - 量化指标 */}
                    <div className="md:col-span-5 md:col-start-8">
                      <div className="grid grid-cols-3 gap-3">
                        {project.metrics.map((metric, mi) => (
                          <div key={mi} className="text-center">
                            <p className="font-display text-xl sm:text-2xl font-bold text-[#0a0a0a]">
                              {metric.display ? (
                                metric.display
                              ) : (
                                <CountUp
                                  end={metric.value}
                                  suffix={metric.suffix}
                                  duration={2000}
                                />
                              )}
                            </p>
                            <p className="text-[10px] text-[#999] mt-1 leading-tight">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 右侧 - 链接 */}
                    <div className="md:col-span-1 flex md:flex-col gap-2 md:items-end">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center border border-[#e0e0e0] rounded-lg text-[#666] hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all"
                          aria-label={`${project.title} 在线体验`}
                          title="在线体验"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center border border-[#e0e0e0] rounded-lg text-[#666] hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a] transition-all"
                          aria-label={`${project.title} 源码`}
                          title="源码"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 在线体验按钮 - 醒目展示 */}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-xs font-medium rounded-full hover:bg-[#ccff00] hover:text-[#0a0a0a] transition-all duration-300 md:hidden"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      在线体验
                    </a>
                  )}
                </div>
              </SectionReveal>
            )
          })}
        </div>

        {/* 查看更多 */}
        <SectionReveal delay={300}>
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-[#ccff00] hover:text-[#0a0a0a] transition-all duration-300"
            >
              查看全部项目
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
