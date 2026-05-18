'use client'

import { useState, useEffect } from 'react'
import { fetchProjects } from '@/lib/api'

const projectGradients = [
  'from-emerald-900/40 via-cyan-900/30 to-teal-900/40',
  'from-violet-900/40 via-purple-900/30 to-fuchsia-900/40',
  'from-rose-900/40 via-orange-900/30 to-amber-900/40',
  'from-sky-900/40 via-blue-900/30 to-indigo-900/40',
  'from-cyan-900/40 via-teal-900/30 to-emerald-900/40',
]

interface ApiProject {
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

function ProjectsSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/3 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-blue/60 border border-cyber-blue/20 px-3 py-1 rounded-sm">
              PORTFOLIO.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            项目<span className="neon-text-blue">展示</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider">
            {'// 从想法到现实，每个项目都是一次探索'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cyber-card">
              <div className="h-48 bg-cyber-border/20 animate-pulse" />
              <div className="p-5 sm:p-6">
                <div className="h-5 w-1/3 bg-cyber-border/30 animate-pulse rounded mb-3" />
                <div className="h-3 w-full bg-cyber-border/30 animate-pulse rounded mb-2" />
                <div className="h-3 w-2/3 bg-cyber-border/30 animate-pulse rounded mb-4" />
                <div className="flex gap-2 mb-5">
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ApiProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProjects()
        setProjects(data.projects || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <ProjectsSkeleton />
  }

  return (
    <div className="min-h-screen">
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/3 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-blue/60 border border-cyber-blue/20 px-3 py-1 rounded-sm">
              PORTFOLIO.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            项目<span className="neon-text-blue">展示</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider">
            {'// 从想法到现实，每个项目都是一次探索'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="cyber-card group"
              style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s forwards`, opacity: 0 }}
            >
              <div className={`relative h-48 bg-gradient-to-br ${projectGradients[i % projectGradients.length]} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-surface via-transparent to-transparent" />
                <span className="font-display text-3xl md:text-4xl font-bold text-white/15 group-hover:text-white/30 transition-colors">
                  {project.title.toUpperCase()}
                </span>
                {project.featured && (
                  <span className="absolute top-3 right-3 cyber-tag cyber-tag-yellow">
                    ★ 精选
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold text-cyber-text group-hover:text-cyber-blue transition-colors mb-3">
                  {project.title}
                </h2>
                <p className="text-cyber-text-dim text-sm leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.techStack.map((t) => (
                    <span key={t} className="cyber-tag">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-cyber-border">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      查看源码
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-cyber-text-dim hover:text-cyber-blue transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      在线演示
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-cyber-border">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="section-title">
            <span className="neon-text">▸</span> 技术栈
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { name: 'Next.js', desc: 'React 全栈框架', color: '#00ff9f' },
              { name: 'React', desc: 'UI 组件库', color: '#00d4ff' },
              { name: 'TypeScript', desc: '类型安全', color: '#00d4ff' },
              { name: 'Prisma', desc: 'ORM 数据库', color: '#ff0080' },
              { name: 'PostgreSQL', desc: '关系型数据库', color: '#00d4ff' },
              { name: 'Tailwind CSS', desc: '原子化 CSS', color: '#00ff9f' },
              { name: 'NextAuth', desc: '身份认证', color: '#ffe600' },
              { name: 'Vercel', desc: '部署平台', color: '#e0e0e0' },
            ].map((tech) => (
              <div key={tech.name} className="cyber-card p-4 text-center group">
                <div className="font-display text-sm font-bold mb-1 transition-colors" style={{ color: tech.color }}>
                  {tech.name}
                </div>
                <div className="font-mono text-xs text-cyber-text-dim">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
