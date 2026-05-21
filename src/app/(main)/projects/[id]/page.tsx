'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface ProjectData {
  id: string
  title: string
  description: string
  coverImage?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
  techStack: string[]
  featured: boolean
  order: number
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

const coreFeatures = [
  {
    icon: '🧠',
    title: '情绪感知',
    desc: '智能识别用户输入中的情绪状态，为日记生成提供情感基调',
    color: '#00ff9f',
  },
  {
    icon: '💾',
    title: '记忆管理',
    desc: '基于ChromaDB向量数据库，长期存储和检索用户记忆片段',
    color: '#00d4ff',
  },
  {
    icon: '✍️',
    title: '日记生成',
    desc: '结合情绪与记忆，自动生成个性化、有温度的日记内容',
    color: '#ff0080',
  },
  {
    icon: '📡',
    title: '实时进度',
    desc: '通过SSE技术实时推送智能体协作进度，可视化处理流程',
    color: '#ffe600',
  },
  {
    icon: '📚',
    title: '日记管理',
    desc: '支持日记的创建、浏览、搜索和管理，本地持久化存储',
    color: '#00ff9f',
  },
  {
    icon: '📊',
    title: '情绪统计',
    desc: '可视化展示情绪变化趋势，帮助用户了解自身情绪模式',
    color: '#00d4ff',
  },
]

const timelineSteps = [
  { phase: '需求分析', desc: '调研用户痛点，确定多智能体协作方案', icon: '🔍' },
  { phase: '架构设计', desc: '设计四智能体协作架构与SSE通信机制', icon: '🏗️' },
  { phase: '智能体开发', desc: '实现情绪感知、记忆管理、日记生成、对话精灵', icon: '🤖' },
  { phase: '前端开发', desc: '构建交互界面，集成SSE实时进度与日记管理', icon: '💻' },
  { phase: '部署上线', desc: '部署在线体验版，持续优化用户体验', icon: '🚀' },
]

const highlights = [
  {
    title: '多智能体协作',
    desc: '四个专业智能体各司其职，协同完成日记生成全流程',
    icon: '🔗',
    color: '#00ff9f',
  },
  {
    title: 'SSE实时进度',
    desc: 'Server-Sent Events实时推送处理进度，透明化AI工作过程',
    icon: '⚡',
    color: '#00d4ff',
  },
  {
    title: '向量记忆',
    desc: 'ChromaDB + BGE嵌入模型实现语义级记忆存储与检索',
    icon: '🧬',
    color: '#ff0080',
  },
  {
    title: '在线体验版',
    desc: '无需本地部署，直接在浏览器中体验AI日记助手',
    icon: '🌐',
    color: '#ffe600',
  },
]

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/3 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-4">
            <div className="h-3 w-20 bg-cyber-border/30 animate-pulse rounded" />
          </div>
          <div className="h-8 w-3/4 bg-cyber-border/30 animate-pulse rounded mb-4" />
          <div className="h-4 w-1/2 bg-cyber-border/30 animate-pulse rounded mb-6" />
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-cyber-border/30 animate-pulse rounded" />
            <div className="h-8 w-24 bg-cyber-border/30 animate-pulse rounded" />
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="cyber-card p-6">
            <div className="h-4 w-32 bg-cyber-border/30 animate-pulse rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-cyber-border/30 animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-cyber-border/30 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setNotFound(false)
        setLoadError(false)
        const res = await fetch(`/api/projects/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true)
          } else {
            setLoadError(true)
          }
          return
        }
        const data = await res.json()
        setProject(data.project || data)
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <ProjectDetailSkeleton />
  }

  if (notFound || (!loading && !project)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold neon-text-pink mb-4">404</h1>
          <p className="font-mono text-cyber-text-dim text-sm mb-6">项目未找到</p>
          <Link href="/projects" className="cyber-button px-6 py-2 text-xs">
            返回项目列表
          </Link>
        </div>
      </div>
    )
  }

  if (loadError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-4xl font-bold neon-text-pink mb-4">ERROR</div>
          <p className="font-mono text-cyber-text-dim text-sm mb-6">项目加载失败，请稍后重试</p>
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

  const isGerenRiji = id === 'geren-riji'

  return (
    <div className="min-h-screen">
      {/* 项目头部 */}
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/3 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-4">
            <Link href="/projects" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
              ← 返回项目列表
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-4">
            {project.featured && (
              <span className="cyber-tag cyber-tag-yellow text-[10px]">★ 精选</span>
            )}
            <span className="cyber-tag cyber-tag-blue text-[10px]">PROJECT.DETAIL</span>
          </div>
          <h1
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-cyber-text mb-4 leading-tight"
            style={{ animation: 'fadeInUp 0.5s ease forwards', opacity: 0 }}
          >
            {project.title}
          </h1>
          {project.techStack.length > 0 && (
            <div
              className="flex flex-wrap gap-1.5 mb-6"
              style={{ animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 }}
            >
              {project.techStack.map((t) => (
                <span key={t} className="cyber-tag">{t}</span>
              ))}
            </div>
          )}
          <div
            className="flex items-center gap-3"
            style={{ animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 }}
          >
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button text-xs flex items-center gap-1.5"
                style={{ borderColor: 'var(--color-cyber-neon)', color: 'var(--color-cyber-neon)' }}
              >
                <GitHubIcon className="w-3.5 h-3.5" />
                查看源码
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button text-xs flex items-center gap-1.5"
                style={{ borderColor: 'var(--color-cyber-blue)', color: 'var(--color-cyber-blue)' }}
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                在线演示
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 项目背景 */}
        <section
          className="cyber-card p-5 sm:p-6"
          style={{ animation: 'fadeInUp 0.5s ease 0.3s forwards', opacity: 0 }}
        >
          <div className="section-title">
            <span className="neon-text">▸</span> 项目背景
            <span className="font-mono text-xs text-cyber-text-dim ml-2">BACKGROUND</span>
          </div>
          <p className="text-cyber-text text-sm leading-relaxed">
            {project.description}
          </p>
        </section>

        {/* 核心功能 - 仅心语日记项目展示 */}
        {isGerenRiji && (
          <section
            className="cyber-card p-5 sm:p-6"
            style={{ animation: 'fadeInUp 0.5s ease 0.4s forwards', opacity: 0 }}
          >
            <div className="section-title">
              <span className="neon-text-blue">▸</span> 核心功能
              <span className="font-mono text-xs text-cyber-text-dim ml-2">CORE.FEATURES</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coreFeatures.map((feature, i) => (
                <div
                  key={feature.title}
                  className="cyber-card p-4 group"
                  style={{
                    animation: `fadeInUp 0.4s ease ${0.5 + i * 0.08}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-[2px]"
                    style={{ backgroundColor: feature.color, boxShadow: `0 0 8px ${feature.color}60` }}
                  />
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3
                    className="font-display text-sm font-bold mb-1.5 transition-colors"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h3>
                  <p className="font-mono text-xs text-cyber-text-dim leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 技术架构 - 仅心语日记项目展示 */}
        {isGerenRiji && (
          <section
            className="cyber-card p-5 sm:p-6"
            style={{ animation: 'fadeInUp 0.5s ease 0.5s forwards', opacity: 0 }}
          >
            <div className="section-title">
              <span className="neon-text">▸</span> 技术架构
              <span className="font-mono text-xs text-cyber-text-dim ml-2">ARCHITECTURE</span>
            </div>

            {/* 架构流程图 */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex flex-col items-center gap-4 min-w-[320px] py-4">
                {/* 用户输入 */}
                <div className="cyber-card px-6 py-3 text-center" style={{ borderColor: 'var(--color-cyber-blue)' }}>
                  <div className="font-mono text-xs text-cyber-blue mb-1">INPUT</div>
                  <div className="font-display text-sm font-bold text-cyber-text">用户输入</div>
                </div>

                {/* 箭头 */}
                <div className="flex flex-col items-center">
                  <div className="w-[2px] h-6 bg-gradient-to-b from-cyber-blue to-cyber-neon" />
                  <svg className="w-4 h-4 text-cyber-neon -mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* 四个智能体 */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {[
                    { name: '情绪感知器', color: '#00ff9f', label: 'EMOTION' },
                    { name: '记忆管家', color: '#00d4ff', label: 'MEMORY' },
                    { name: '日记生成器', color: '#ff0080', label: 'GENERATOR' },
                    { name: '对话精灵', color: '#ffe600', label: 'DIALOG' },
                  ].map((agent) => (
                    <div
                      key={agent.name}
                      className="cyber-card px-4 py-3 text-center"
                      style={{ borderColor: `${agent.color}40` }}
                    >
                      <div className="font-mono text-[10px] mb-1" style={{ color: agent.color }}>{agent.label}</div>
                      <div className="font-display text-xs font-bold text-cyber-text">{agent.name}</div>
                    </div>
                  ))}
                </div>

                {/* 箭头 */}
                <div className="flex flex-col items-center">
                  <div className="w-[2px] h-6 bg-gradient-to-b from-cyber-neon to-cyber-pink" />
                  <svg className="w-4 h-4 text-cyber-pink -mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* 输出 */}
                <div className="cyber-card px-6 py-3 text-center" style={{ borderColor: 'var(--color-cyber-pink)' }}>
                  <div className="font-mono text-xs text-cyber-pink mb-1">OUTPUT</div>
                  <div className="font-display text-sm font-bold text-cyber-text">个性化日记</div>
                </div>
              </div>
            </div>

            {/* 技术栈说明 */}
            <div className="section-title mt-6">
              <span className="neon-text-blue">▸</span> 技术栈
              <span className="font-mono text-xs text-cyber-text-dim ml-2">TECH.STACK</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Python', desc: '后端语言', color: '#3572A5' },
                { name: 'FastAPI', desc: 'Web框架', color: '#00ff9f' },
                { name: 'DeepSeek', desc: '大模型API', color: '#00d4ff' },
                { name: 'ChromaDB', desc: '向量数据库', color: '#ff0080' },
                { name: 'BGE', desc: '嵌入模型', color: '#ffe600' },
                { name: 'SSE', desc: '实时推送', color: '#00ff9f' },
                { name: 'JavaScript', desc: '前端语言', color: '#f1e05a' },
                { name: 'localStorage', desc: '本地存储', color: '#00d4ff' },
              ].map((tech) => (
                <div key={tech.name} className="cyber-card p-3 text-center group">
                  <div
                    className="font-display text-xs font-bold mb-0.5 transition-colors"
                    style={{ color: tech.color }}
                  >
                    {tech.name}
                  </div>
                  <div className="font-mono text-[10px] text-cyber-text-dim">{tech.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 实现过程 - 仅心语日记项目展示 */}
        {isGerenRiji && (
          <section
            className="cyber-card p-5 sm:p-6"
            style={{ animation: 'fadeInUp 0.5s ease 0.6s forwards', opacity: 0 }}
          >
            <div className="section-title">
              <span className="neon-text">▸</span> 实现过程
              <span className="font-mono text-xs text-cyber-text-dim ml-2">IMPLEMENTATION</span>
            </div>
            <div className="relative">
              {/* 时间线竖线 */}
              <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-cyber-neon via-cyber-blue to-cyber-pink opacity-30" />

              <div className="space-y-4">
                {timelineSteps.map((step, i) => (
                  <div
                    key={step.phase}
                    className="flex items-start gap-4 relative"
                    style={{
                      animation: `fadeInUp 0.4s ease ${0.7 + i * 0.1}s forwards`,
                      opacity: 0,
                    }}
                  >
                    {/* 时间线节点 */}
                    <div className="flex-shrink-0 w-[32px] h-[32px] rounded-full bg-cyber-surface border border-cyber-border flex items-center justify-center z-10 relative">
                      <span className="text-sm">{step.icon}</span>
                    </div>

                    {/* 内容 */}
                    <div className="cyber-card p-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm font-bold text-cyber-neon">
                          {step.phase}
                        </span>
                        <span className="font-mono text-[10px] text-cyber-text-dim">
                          PHASE.{i + 1}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-cyber-text-dim leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 成果亮点 - 仅心语日记项目展示 */}
        {isGerenRiji && (
          <section
            className="cyber-card p-5 sm:p-6"
            style={{ animation: 'fadeInUp 0.5s ease 0.7s forwards', opacity: 0 }}
          >
            <div className="section-title">
              <span className="neon-text-blue">▸</span> 成果亮点
              <span className="font-mono text-xs text-cyber-text-dim ml-2">HIGHLIGHTS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, i) => (
                <div
                  key={item.title}
                  className="cyber-card p-4 group"
                  style={{
                    animation: `fadeInUp 0.4s ease ${0.8 + i * 0.08}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-[2px]"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                  />
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3
                      className="font-display text-sm font-bold transition-colors"
                      style={{ color: item.color }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-mono text-xs text-cyber-text-dim leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 底部操作 */}
        <section
          className="cyber-card p-5 sm:p-6"
          style={{ animation: 'fadeInUp 0.5s ease 0.8s forwards', opacity: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-cyber-text-dim">
              {'// 对这个项目感兴趣？'}
            </span>
            <div className="flex items-center gap-3">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button text-xs flex items-center gap-1.5"
                  style={{ borderColor: 'var(--color-cyber-neon)', color: 'var(--color-cyber-neon)' }}
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                  查看源码
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button text-xs flex items-center gap-1.5"
                  style={{ borderColor: 'var(--color-cyber-blue)', color: 'var(--color-cyber-blue)' }}
                >
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                  在线体验
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
