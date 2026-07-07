'use client'

import { useEffect, useState } from 'react'
import SectionReveal from '@/components/ui/SectionReveal'

interface Stats {
  projectCount: number
  deployedCount: number
  articleCount: number
}

/**
 * About 区块 - 个人定位与理念
 * 统计数据从数据库实时更新
 */
export default function AboutSection() {
  const [stats, setStats] = useState<Stats>({ projectCount: 0, deployedCount: 0, articleCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        if (!cancelled) {
          setStats({
            projectCount: data.projectCount ?? 0,
            deployedCount: data.deployedCount ?? 0,
            articleCount: data.articleCount ?? 0,
          })
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()

    // 每 5 分钟自动刷新
    const timer = setInterval(fetchStats, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return (
    <section id="about" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">01</span>
            ABOUT
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          {/* 左侧 - 定位语 */}
          <SectionReveal className="md:col-span-7" delay={100}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
              把<span className="text-[#ccff00]">想法</span>
              <br />
              真正<span className="text-[#ccff00]">实现</span>出来
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#888] leading-relaxed max-w-xl">
              我是一名在校大学生，通过独立项目实践全栈开发与 AI 应用。
              从 Vue 前端到 Next.js 全栈，从 Python 计算机视觉到 RAG 知识库，
              每个项目都是一次从想法到上线的完整实践。
            </p>
            <p className="mt-4 text-sm text-[#555] leading-relaxed max-w-xl">
              热衷于探索 AI 与 Web 的结合点，追求简洁优雅的工程实现。
              相信最好的学习方式就是把想法真正做出来。
            </p>
          </SectionReveal>

          {/* 右侧 - 关键数据（实时更新） */}
          <SectionReveal className="md:col-span-5" delay={200}>
            <div className="grid grid-cols-2 gap-4">
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">
                  {loading ? '...' : stats.projectCount}
                  {!loading && stats.projectCount > 0 && '+'}
                </p>
                <p className="mt-1 text-xs text-[#888]">独立项目</p>
              </div>
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">
                  {loading ? '...' : stats.articleCount}
                  {!loading && stats.articleCount > 0 && '+'}
                </p>
                <p className="mt-1 text-xs text-[#888]">技术文章</p>
              </div>
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">
                  {loading ? '...' : stats.deployedCount}
                  {!loading && stats.deployedCount > 0 && '+'}
                </p>
                <p className="mt-1 text-xs text-[#888]">上线部署</p>
              </div>
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">AI</p>
                <p className="mt-1 text-xs text-[#888]">/CV/全栈</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
