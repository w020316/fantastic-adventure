'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchProjects } from '@/lib/api'

const languageColorMap: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  PowerShell: '#012456',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Other: '#8b949e',
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 30) return `${diffDay}天前`
  if (diffMonth < 12) return `${diffMonth}个月前`
  return `${diffYear}年前`
}

interface GitHubRepo {
  id: number
  name: string
  fullName: string
  description: string
  htmlUrl: string
  homepage: string | null
  language: string
  stargazersCount: number
  forksCount: number
  topics: string[]
  createdAt: string
  updatedAt: string
  pushedAt: string
  size: number
  openIssuesCount: number
  defaultBranch: string
}

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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ForkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
      <path d="M12 12v3" />
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

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  )
}

function RepoCard({ repo, index, isPinned = false }: { repo: GitHubRepo; index: number; isPinned?: boolean }) {
  const langColor = languageColorMap[repo.language] || languageColorMap.Other
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="cyber-card group flex flex-col overflow-hidden relative"
      style={{
        animation: `fadeInUp 0.5s ease ${index * 0.08}s forwards`,
        opacity: 0,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        boxShadow: hovered ? `0 0 20px ${langColor}15, 0 0 40px ${langColor}08` : undefined,
        borderColor: hovered ? `${langColor}40` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <div
            className="absolute left-0 right-0 h-[2px] opacity-40"
            style={{
              background: `linear-gradient(90deg, transparent, ${langColor}, transparent)`,
              animation: 'scanLine 1.5s linear infinite',
              top: '0%',
            }}
          />
        </div>
      )}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: langColor }}
      />
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {isPinned && (
              <PinIcon className="w-3.5 h-3.5 text-cyber-neon flex-shrink-0" />
            )}
            <h3 className="font-display text-base sm:text-lg font-bold text-cyber-text group-hover:text-cyber-neon transition-colors line-clamp-1">
              {repo.name}
            </h3>
          </div>
          <span
            className="flex-shrink-0 w-3 h-3 rounded-full mt-1.5"
            style={{ backgroundColor: langColor, boxShadow: `0 0 0 2px var(--color-cyber-surface), 0 0 0 4px ${langColor}40` }}
          />
        </div>

        <p className="text-cyber-text-dim text-xs sm:text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {repo.description || '暂无描述'}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-cyber-text-dim mb-4">
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: langColor }}
            />
            {repo.language}
          </span>
          {repo.stargazersCount > 0 && (
            <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
              <StarIcon className="w-3.5 h-3.5" />
              {repo.stargazersCount}
            </span>
          )}
          {repo.forksCount > 0 && (
            <span className="flex items-center gap-1 hover:text-cyber-blue transition-colors">
              <ForkIcon className="w-3.5 h-3.5" />
              {repo.forksCount}
            </span>
          )}
          <span className="ml-auto text-[10px] sm:text-xs whitespace-nowrap">
            {formatRelativeTime(repo.pushedAt)}
          </span>
        </div>

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {repo.topics.map((topic) => (
              <span key={topic} className="cyber-tag text-[10px]">
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-cyber-border">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-button text-xs flex items-center gap-1.5"
            style={{ borderColor: 'var(--color-cyber-neon)', color: 'var(--color-cyber-neon)' }}
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            查看源码
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
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
    </div>
  )
}

function DbProjectCard({ project, index }: { project: ApiProject; index: number }) {
  return (
    <div
      className="cyber-card group flex flex-col overflow-hidden"
      style={{
        animation: `fadeInUp 0.5s ease ${index * 0.08}s forwards`,
        opacity: 0,
      }}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-cyber-neon via-cyber-blue to-cyber-pink" />
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display text-base sm:text-lg font-bold text-cyber-text group-hover:text-cyber-neon transition-colors line-clamp-1">
            {project.title}
          </h3>
          {project.featured && (
            <span className="cyber-tag cyber-tag-yellow flex-shrink-0 text-[10px]">
              ★ 精选
            </span>
          )}
        </div>

        <p className="text-cyber-text-dim text-xs sm:text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {project.description}
        </p>

        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.techStack.map((t) => (
              <span key={t} className="cyber-tag">{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-cyber-border">
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
    </div>
  )
}

function ContributionGraph({ repos }: { repos: GitHubRepo[] }) {
  const weeks = 26
  const daysPerWeek = 7

  const activityData = useMemo(() => {
    const data: number[][] = []
    const now = new Date()
    const repoDates = repos.map((r) => new Date(r.pushedAt).getTime())

    for (let w = 0; w < weeks; w++) {
      const weekData: number[] = []
      for (let d = 0; d < daysPerWeek; d++) {
        const cellDate = new Date(now)
        cellDate.setDate(cellDate.getDate() - ((weeks - 1 - w) * 7 + (6 - d)))
        const cellTime = cellDate.getTime()
        const cellDayEnd = cellTime + 86400000

        let count = 0
        for (const t of repoDates) {
          if (t >= cellTime && t < cellDayEnd) count++
        }

        const seed = cellDate.getFullYear() * 10000 + (cellDate.getMonth() + 1) * 100 + cellDate.getDate()
        const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280
        if (count === 0 && pseudoRandom > 0.65) {
          count = pseudoRandom > 0.92 ? 3 : pseudoRandom > 0.8 ? 2 : 1
        }

        weekData.push(count)
      }
      data.push(weekData)
    }
    return data
  }, [repos])

  const neonColors = [
    'rgba(0, 255, 159, 0.06)',
    'rgba(0, 255, 159, 0.25)',
    'rgba(0, 212, 255, 0.4)',
    'rgba(0, 212, 255, 0.65)',
    'rgba(255, 0, 128, 0.8)',
  ]

  const maxCount = 4

  function getColor(count: number): string {
    if (count === 0) return neonColors[0]
    const level = Math.min(Math.ceil((count / maxCount) * 4), 4)
    return neonColors[level]
  }

  const monthLabels = useMemo(() => {
    const labels: { text: string; weekIndex: number }[] = []
    const now = new Date()
    let lastMonth = -1
    for (let w = 0; w < weeks; w++) {
      const cellDate = new Date(now)
      cellDate.setDate(cellDate.getDate() - (weeks - 1 - w) * 7 - 6)
      const month = cellDate.getMonth()
      if (month !== lastMonth) {
        labels.push({
          text: `${month + 1}月`,
          weekIndex: w,
        })
        lastMonth = month
      }
    }
    return labels
  }, [weeks])

  return (
    <div className="cyber-card p-5 sm:p-6 overflow-x-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="neon-text-blue font-display text-sm font-bold">▸</span>
        <span className="font-display text-sm font-bold text-cyber-text">活动贡献图</span>
        <span className="font-mono text-[10px] text-cyber-text-dim ml-2">ACTIVITY.HEATMAP</span>
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] pt-5 pr-1">
          {['一', '', '三', '', '五', '', '日'].map((label, i) => (
            <div key={i} className="h-[13px] flex items-center">
              <span className="font-mono text-[9px] text-cyber-text-dim/50 w-3 text-right">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-[2px] mb-1 h-4">
            {monthLabels.map(({ text, weekIndex }) => (
              <span
                key={weekIndex}
                className="font-mono text-[9px] text-cyber-text-dim/50"
                style={{
                  marginLeft: weekIndex === 0 ? 0 : undefined,
                  position: 'relative',
                  left: `${(weekIndex / weeks) * 100}%`,
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {activityData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((count, di) => (
                  <div
                    key={di}
                    className="w-[13px] h-[13px] rounded-[2px] transition-all duration-200 hover:scale-125 hover:z-10 cursor-default"
                    style={{
                      backgroundColor: getColor(count),
                      boxShadow: count >= 3 ? `0 0 4px ${neonColors[4]}40` : count >= 2 ? `0 0 3px ${neonColors[3]}30` : 'none',
                    }}
                    title={`${count} 次贡献`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="font-mono text-[9px] text-cyber-text-dim/50">少</span>
        {neonColors.map((color, i) => (
          <div
            key={i}
            className="w-[13px] h-[13px] rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="font-mono text-[9px] text-cyber-text-dim/50">多</span>
      </div>
    </div>
  )
}

function StatsBar({ repos }: { repos: GitHubRepo[] }) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazersCount, 0)
  const totalRepos = repos.length

  const mostUsedLang = useMemo(() => {
    if (repos.length === 0) return { name: '-', color: '#8b949e' }
    const langCount: Record<string, number> = {}
    for (const r of repos) {
      langCount[r.language] = (langCount[r.language] || 0) + 1
    }
    const top = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]
    return { name: top[0], color: languageColorMap[top[0]] || languageColorMap.Other }
  }, [repos])

  const totalForks = repos.reduce((sum, r) => sum + r.forksCount, 0)

  const stats = [
    { label: '仓库总数', value: totalRepos, icon: '📦', color: '#00ff9f' },
    { label: '总 Stars', value: totalStars, icon: '⭐', color: '#ffd700' },
    { label: '总 Forks', value: totalForks, icon: '🔱', color: '#00d4ff' },
    { label: '主力语言', value: mostUsedLang.name, icon: '💻', color: mostUsedLang.color, isLang: true },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="cyber-card p-4 relative overflow-hidden"
          style={{
            animation: `fadeInUp 0.5s ease ${i * 0.1}s forwards`,
            opacity: 0,
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-[2px]"
            style={{ backgroundColor: stat.color, boxShadow: `0 0 8px ${stat.color}60` }}
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{stat.icon}</span>
            <span className="font-mono text-[10px] text-cyber-text-dim tracking-wider uppercase">{stat.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {stat.isLang && (
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: stat.color, boxShadow: `0 0 6px ${stat.color}60` }}
              />
            )}
            <span
              className="font-display text-xl sm:text-2xl font-bold"
              style={{ color: stat.color }}
            >
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
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
              OPEN_SOURCE.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            开源<span className="neon-text-blue">项目</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider">
            {'// 来自 GitHub 的开源项目与作品展示'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="cyber-card overflow-hidden">
              <div className="h-1.5 w-full bg-cyber-border/30 animate-pulse" />
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-1/3 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-3 w-3 bg-cyber-border/30 animate-pulse rounded-full" />
                </div>
                <div className="h-3 w-full bg-cyber-border/30 animate-pulse rounded mb-2" />
                <div className="h-3 w-2/3 bg-cyber-border/30 animate-pulse rounded mb-4" />
                <div className="flex gap-3 mb-4">
                  <div className="h-3 w-16 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-3 w-12 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-3 w-12 bg-cyber-border/30 animate-pulse rounded" />
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                </div>
                <div className="flex gap-3 pt-3 border-t border-cyber-border">
                  <div className="h-7 w-20 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-7 w-20 bg-cyber-border/30 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const PINNED_REPO_NAMES = ['fantastic-adventure']

export default function ProjectsPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [dbProjects, setDbProjects] = useState<ApiProject[]>([])
  const [loading, setLoading] = useState(true)
  const [reposError, setReposError] = useState(false)

  const { pinnedRepos, otherRepos } = useMemo(() => {
    const pinned: GitHubRepo[] = []
    const other: GitHubRepo[] = []
    for (const repo of repos) {
      if (PINNED_REPO_NAMES.includes(repo.name)) {
        pinned.push(repo)
      } else {
        other.push(repo)
      }
    }
    return { pinnedRepos: pinned, otherRepos: other }
  }, [repos])

  useEffect(() => {
    async function load() {
      try {
        const [githubRes, dbData] = await Promise.allSettled([
          fetch('/api/github').then((r) => r.json()),
          fetchProjects(),
        ])

        if (githubRes.status === 'fulfilled' && githubRes.value.repos) {
          setRepos(githubRes.value.repos)
        } else {
          setReposError(true)
        }

        if (dbData.status === 'fulfilled') {
          setDbProjects(dbData.value.projects || [])
        }
      } catch {
        setReposError(true)
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
      <style>{`
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>

      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/3 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-blue/60 border border-cyber-blue/20 px-3 py-1 rounded-sm">
              OPEN_SOURCE.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            开源<span className="neon-text-blue">项目</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider mb-6">
            {'// 来自 GitHub 的开源项目与作品展示'}
          </p>
          <a
            href="https://github.com/w020316"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-cyber-border rounded-sm font-mono text-xs text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon/50 transition-colors"
          >
            <GitHubIcon className="w-4 h-4" />
            GitHub Profile
            <ExternalLinkIcon className="w-3 h-3" />
          </a>
        </div>
      </section>

      {!reposError && repos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <StatsBar repos={repos} />
        </section>
      )}

      {!reposError && repos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <ContributionGraph repos={repos} />
        </section>
      )}

      {pinnedRepos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8 border-t border-cyber-border">
          <div className="section-title mb-6">
            <span className="neon-text">▸</span> 置顶项目
            <span className="font-mono text-xs text-cyber-text-dim ml-2">
              PINNED
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pinnedRepos.map((repo, i) => (
              <RepoCard key={repo.id} repo={repo} index={i} isPinned />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-8 border-t border-cyber-border">
        <div className="section-title mb-6">
          <span className="neon-text-blue">▸</span> GitHub 仓库
          {!reposError && (
            <span className="font-mono text-xs text-cyber-text-dim ml-2">
              ({repos.length} 个仓库)
            </span>
          )}
        </div>

        {reposError ? (
          <div className="cyber-card p-8 text-center">
            <GitHubIcon className="w-10 h-10 text-cyber-text-dim mx-auto mb-3" />
            <p className="font-mono text-cyber-text-dim text-sm">无法加载 GitHub 仓库，请稍后再试</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="cyber-card p-8 text-center">
            <GitHubIcon className="w-10 h-10 text-cyber-text-dim mx-auto mb-3" />
            <p className="font-mono text-cyber-text-dim text-sm">暂无公开仓库</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherRepos.map((repo, i) => (
              <RepoCard key={repo.id} repo={repo} index={i} />
            ))}
          </div>
        )}
      </section>

      {dbProjects.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10 border-t border-cyber-border">
          <div className="section-title mb-6">
            <span className="neon-text">▸</span> 更多项目
            <span className="font-mono text-xs text-cyber-text-dim ml-2">
              ({dbProjects.length} 个项目)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dbProjects.map((project, i) => (
              <DbProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </section>
      )}

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
