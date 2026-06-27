'use client'

import { useEffect, useState } from 'react'
import SectionReveal from '@/components/ui/SectionReveal'

interface Repo {
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
  updatedAt: string
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

export default function GitHubReposSection() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchRepos() {
      try {
        const res = await fetch('/api/github', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (!cancelled) {
          setRepos(data.repos?.slice(0, 6) ?? [])
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }
    fetchRepos()
    return () => {
      cancelled = true
    }
  }, [])

  // 加载中或出错时不显示该区块
  if (loading || error || repos.length === 0) return null

  return (
    <section className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">04</span>
            OPEN SOURCE
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            GitHub 开源
          </h2>
          <p className="text-sm text-[#888] mb-12 max-w-lg">
            实时同步我的 GitHub 仓库，点击直接访问源码或在线体验。
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo, i) => (
            <SectionReveal key={repo.id} delay={i * 60}>
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block cyber-card p-5 h-full hover:border-[#ccff00]/50 transition-all duration-300 group"
              >
                {/* 仓库名 */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-base font-bold text-white group-hover:text-[#ccff00] transition-colors truncate">
                    {repo.name}
                  </h3>
                  <svg className="w-4 h-4 text-[#555] group-hover:text-[#ccff00] transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>

                {/* 描述 */}
                <p className="text-xs text-[#888] leading-relaxed mb-4 min-h-[2.5rem] line-clamp-2">
                  {repo.description || '暂无描述'}
                </p>

                {/* 底部信息 */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-[#666]">
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

                {/* 在线体验（如果有 homepage） */}
                {repo.homepage && (
                  <div className="mt-3 pt-3 border-t border-[#222]">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#ccff00]">
                      <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse" />
                      在线体验可用
                    </span>
                  </div>
                )}
              </a>
            </SectionReveal>
          ))}
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
