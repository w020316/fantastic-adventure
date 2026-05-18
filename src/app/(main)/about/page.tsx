'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const skills = [
  { name: 'React / Next.js', level: 85, color: '#00ff9f' },
  { name: 'TypeScript', level: 80, color: '#00d4ff' },
  { name: 'Node.js', level: 75, color: '#00ff9f' },
  { name: 'CSS / Tailwind', level: 90, color: '#ff0080' },
  { name: 'PostgreSQL / Prisma', level: 70, color: '#ffe600' },
  { name: 'Python', level: 65, color: '#00d4ff' },
]

const timeline = [
  { year: '2024', title: '开始编程之旅', desc: '学习 HTML/CSS/JavaScript 基础' },
  { year: '2025', title: '深入前端开发', desc: '掌握 React、Vue 等现代框架' },
  { year: '2025', title: '全栈探索', desc: '学习 Node.js、数据库、部署' },
  { year: '2026', title: '项目实战', desc: '独立完成 CyberBlog 全栈项目' },
]

function SkillBar({ name, level, color }: { name: string; level: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), 100)
    return () => clearTimeout(timer)
  }, [level])

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-mono text-xs text-cyber-text">{name}</span>
        <span className="font-mono text-xs text-cyber-text-dim">{level}%</span>
      </div>
      <div className="h-1.5 bg-cyber-border rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
        />
      </div>
    </div>
  )
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <section className="relative border-b border-cyber-border overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="mb-6 h-6 w-36 skeleton-pulse rounded-sm" />
            <div className="h-10 w-48 skeleton-pulse rounded-sm mb-3" />
            <div className="h-5 w-64 skeleton-pulse rounded-sm" />
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 skeleton-pulse rounded-sm" />
              <div className="h-48 skeleton-pulse rounded-sm" />
            </div>
            <div className="space-y-6">
              <div className="h-48 skeleton-pulse rounded-sm" />
              <div className="h-36 skeleton-pulse rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-pink/3 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-cyber-pink/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-pink/60 border border-cyber-pink/20 px-3 py-1 rounded-sm">
              PROFILE.LOADED
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            关于<span className="neon-text-pink">我</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider">
            {'// 一个热爱编程的学生开发者'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="cyber-card p-6 sm:p-8" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyber-neon/20 to-cyber-pink/20 rounded-sm flex items-center justify-center flex-shrink-0 border border-cyber-border">
                  <span className="font-display text-xl font-bold neon-text">C</span>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-cyber-text mb-1">CyberBlog 作者</h2>
                  <p className="font-mono text-xs text-cyber-text-dim">@student · @developer · @creator</p>
                </div>
              </div>
              <div className="space-y-4 text-cyber-text text-sm leading-relaxed">
                <p>
                  你好！我是一名热爱编程的学生开发者。对技术充满热情，喜欢用代码创造有趣的东西。
                </p>
                <p>
                  从最初接触 HTML/CSS 到现在能够独立完成全栈项目，这段旅程让我深刻体会到：最好的学习方式就是动手实践。CyberBlog 就是我学习全栈开发的一个里程碑项目。
                </p>
                <p>
                  我相信技术的力量可以改变世界，也相信持续学习是开发者最重要的品质。在这个赛博空间里，我记录自己的技术探索、生活感悟和创意作品。
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <a
                  href="https://github.com/w020316/fantastic-adventure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button px-4 py-2 text-xs inline-flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  GitHub
                </a>
                <Link href="/articles" className="cyber-button px-4 py-2 text-xs inline-flex items-center gap-2" style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}>
                  阅读文章
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="cyber-card p-6 sm:p-8" style={{ animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 }}>
              <div className="section-title">
                <span className="neon-text-blue">▸</span> 成长历程
              </div>
              <div className="relative pl-6 border-l border-cyber-border space-y-6">
                {timeline.map((item, i) => (
                  <div key={item.year} className="relative" style={{ animation: `fadeInUp 0.4s ease ${0.2 + i * 0.1}s forwards`, opacity: 0 }}>
                    <div className="absolute -left-[1.55rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-cyber-neon bg-cyber-bg" />
                    <div className="font-mono text-xs text-cyber-neon mb-1">{item.year}</div>
                    <h3 className="font-display text-sm font-bold text-cyber-text mb-1">{item.title}</h3>
                    <p className="text-cyber-text-dim text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Skills */}
            <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.5s ease 0.15s forwards', opacity: 0 }}>
              <div className="section-title">
                <span className="neon-text">▸</span> 技能
              </div>
              {skills.map((skill) => (
                <SkillBar key={skill.name} name={skill.name} level={skill.level} color={skill.color} />
              ))}
            </div>

            {/* Info */}
            <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 }}>
              <div className="section-title">
                <span className="neon-text-pink">▸</span> 信息
              </div>
              <div className="space-y-3">
                {[
                  { label: '身份', value: '学生开发者' },
                  { label: '方向', value: '全栈开发' },
                  { label: '语言', value: 'TypeScript / Python' },
                  { label: '框架', value: 'Next.js / React' },
                  { label: '数据库', value: 'PostgreSQL' },
                  { label: '部署', value: 'Vercel + Neon' },
                ].map((info) => (
                  <div key={info.label} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-cyber-text-dim">{info.label}</span>
                    <span className="font-mono text-xs text-cyber-text">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motto */}
            <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.5s ease 0.25s forwards', opacity: 0 }}>
              <div className="section-title">
                <span className="neon-text-yellow">▸</span> 座右铭
              </div>
              <blockquote className="border-l-2 border-cyber-neon/50 pl-4 py-2">
                <p className="font-mono text-xs text-cyber-text leading-relaxed italic">
                  &ldquo;代码是写给人看的，顺便能在机器上运行。&rdquo;
                </p>
                <cite className="font-mono text-xs text-cyber-text-dim mt-2 block">— Harold Abelson</cite>
              </blockquote>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
