'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import SectionReveal from '@/components/ui/SectionReveal'

interface Repo {
  id: number
  name: string
  fullName: string
  description: string
  htmlUrl: string
  homepage: string | null
  hasPages: boolean
  language: string
  stargazersCount: number
  forksCount: number
  topics: string[]
  updatedAt: string
  difficulty?: number
}

// 语言颜色映射
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Shell: '#89e051',
  'C++': '#f34b7d',
  Java: '#b07219',
  Other: '#888888',
}

// 难度等级标签
const difficultyLabels: Record<number, { label: string; color: string }> = {
  5: { label: '★★★★★', color: '#ff0080' },
  4: { label: '★★★★', color: '#ff8c00' },
  3: { label: '★★★', color: '#ffe600' },
  2: { label: '★★', color: '#00d4ff' },
  1: { label: '★', color: '#888888' },
}

// GitHub 用户名（用于推断 Pages URL）
const GITHUB_USERNAME = 'w020316'

// 将可能缺协议的 homepage 补全为完整 URL
function normalizeUrl(url: string | null): string {
  if (!url) return '#'
  const trimmed = url.trim()
  if (!trimmed) return '#'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

// 推断仓库的在线体验 URL：优先 homepage，其次 GitHub Pages
function resolveDemoUrl(repo: Repo): { url: string; hasDemo: boolean } {
  // 1. 优先使用仓库设置的 homepage
  if (repo.homepage && repo.homepage.trim()) {
    return { url: normalizeUrl(repo.homepage), hasDemo: true }
  }
  // 2. 启用了 GitHub Pages 的仓库，推断 URL
  if (repo.hasPages) {
    return { url: `https://${GITHUB_USERNAME}.github.io/${repo.name}/`, hasDemo: true }
  }
  return { url: '#', hasDemo: false }
}

export default function GitHubReposSection() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)
  // 用于避免并发请求
  const fetchingRef = useRef(false)

  const fetchRepos = useCallback(async (silent = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    if (silent) setRefreshing(true)
    try {
      const res = await fetch('/api/github', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      // 后端已按难度从高到低排序，取前 6 个
      setRepos(data.repos?.slice(0, 6) ?? [])
      setLastUpdated(data.updatedAt ?? new Date().toISOString())
      setError(false)
    } catch {
      if (!silent) setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchRepos()

    // 实时更新机制：每 5 分钟自动刷新一次（与后端缓存周期对齐）
    const refreshTimer = setInterval(() => fetchRepos(true), 5 * 60 * 1000)

    // 页面从后台切回前台时立即刷新
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchRepos(true)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(refreshTimer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [fetchRepos])

  // 加载中或出错时不显示该区块
  if (loading || error || repos.length === 0) return null

  return (
    <section className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="section-label">
                <span className="text-[#ccff00]">04</span>
                OPEN SOURCE
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                GitHub 开源
              </h2>
              <p className="text-sm text-[#888] mb-12 max-w-lg">
                实时同步我的 GitHub 仓库，按技术难度从高到低排列，点击直接访问源码或在线体验。
              </p>
            </div>
            {/* 实时更新指示器 */}
            <button
              onClick={() => fetchRepos(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#222] text-[10px] font-mono text-[#666] hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-all rounded-full disabled:opacity-50"
              aria-label="刷新仓库列表"
              title={lastUpdated ? `最后更新：${new Date(lastUpdated).toLocaleString('zh-CN')}` : '刷新'}
            >
              <svg
                className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0h-4.018m4.018 0a8.001 8.001 0 01-15.357-2" />
              </svg>
              {refreshing ? '同步中...' : '刷新'}
            </button>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo, i) => {
            const { url: demoUrl, hasDemo } = resolveDemoUrl(repo)
            const diff = repo.difficulty ?? 2
            const diffInfo = difficultyLabels[diff] ?? difficultyLabels[2]
            return (
              <SectionReveal key={repo.id} delay={i * 60}>
                <div className="cyber-card p-5 h-full flex flex-col hover:border-[#ccff00]/50 transition-all duration-300 group">
                  {/* 仓库名 + 难度 */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-base font-bold text-white group-hover:text-[#ccff00] transition-colors truncate">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {/* 难度标签 */}
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 border rounded-full"
                        style={{ borderColor: diffInfo.color + '60', color: diffInfo.color, background: diffInfo.color + '12' }}
                        title={`技术难度 ${diff}/5`}
                      >
                        {diffInfo.label}
                      </span>
                      {hasDemo && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#ccff00] px-1.5 py-0.5 border border-[#ccff00]/30 rounded-full bg-[#ccff00]/5">
                          <span className="w-1 h-1 bg-[#ccff00] rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-xs text-[#888] leading-relaxed mb-4 min-h-[2.5rem] line-clamp-2">
                    {repo.description || '暂无描述'}
                  </p>

                  {/* 底部信息 */}
                  <div className="flex items-center gap-4 text-[10px] font-mono text-[#666] mb-4">
                    {/* 语言 */}
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: languageColors[repo.language] ?? '#888' }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {/* 星标 */}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {repo.stargazersCount}
                    </span>
                    {/* Fork */}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 3a3 3 0 100 6 3 3 0 000-6zM18 3a3 3 0 100 6 3 3 0 000-6zM6 15a3 3 0 100 6 3 3 0 000-6zM18 15a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                      {repo.forksCount}
                    </span>
                  </div>

                  {/* 操作按钮区：源码 + 在线体验（有前端页面时） */}
                  <div className="mt-auto pt-3 border-t border-[#222] flex flex-col gap-2">
                    {hasDemo && (
                      <div>
                        <a
                          href={demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-[#ccff00] text-[#0a0a0a] text-xs font-mono font-semibold rounded-md hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:-translate-y-0.5 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          在线体验
                        </a>
                        <p className="mt-1.5 text-[10px] text-[#666] leading-relaxed text-center">
                          访问实际运行的前端页面，体验完整功能与交互效果
                        </p>
                      </div>
                    )}
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 border border-[#333] text-xs font-mono rounded-md hover:border-[#ccff00] hover:text-[#ccff00] transition-all ${hasDemo ? 'text-[#888]' : 'text-[#888] py-2.5'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      查看源码
                    </a>
                  </div>
                </div>
              </SectionReveal>
            )
          })}
        </div>

        {/* 查看更多 */}
        <SectionReveal delay={300}>
          <div className="mt-10 text-center">
            <a
              href="https://github.com/w020316"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#333] text-white text-sm font-medium rounded-full hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              查看全部仓库
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
