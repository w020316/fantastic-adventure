'use client'

import { useState } from 'react'
import ParticleIntro from '@/components/animation/ParticleIntro'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function Home() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem('cyberblog-intro-shown')
  })

  function handleIntroComplete() {
    sessionStorage.setItem('cyberblog-intro-shown', '1')
    setShowIntro(false)
  }

  return (
    <>
      {showIntro && <ParticleIntro onComplete={handleIntroComplete} />}
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0 bg-gradient-to-b from-cyber-neon/5 via-transparent to-transparent" />
            <div className="relative z-10 text-center">
              <p className="font-mono text-cyber-neon text-sm tracking-widest mb-4">
                {'> WELCOME TO_'}
              </p>
              <h1 className="glitch-text font-display text-5xl md:text-7xl lg:text-8xl font-bold neon-text mb-6" data-text="CYBERBLOG">
                CYBERBLOG
              </h1>
              <p className="text-cyber-text-dim text-lg md:text-xl max-w-2xl mx-auto mb-8">
                技术探索 · 生活记录 · 创意作品
              </p>
              <div className="flex gap-4 justify-center">
                <a href="/articles" className="cyber-button">
                  浏览文章
                </a>
                <a href="/about" className="cyber-button" style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}>
                  了解更多
                </a>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <svg className="w-6 h-6 text-cyber-neon/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="font-display text-2xl neon-text mb-8">
              {'> LATEST_POSTS_'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cyber-card p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-0.5 text-xs font-mono border border-cyber-neon/30 text-cyber-neon rounded">
                      Next.js
                    </span>
                    <span className="px-2 py-0.5 text-xs font-mono border border-cyber-blue/30 text-cyber-blue rounded">
                      React
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-cyber-text mb-2">
                    示例文章标题 {i}
                  </h3>
                  <p className="text-cyber-text-dim text-sm line-clamp-2">
                    这是一篇示例文章的摘要内容，展示赛博朋克风格的博客卡片效果...
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-mono text-cyber-text-dim">
                    <span>2026-05-17</span>
                    <span>5 min read</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="font-display text-2xl neon-text-pink mb-8">
              {'> FEATURED_PROJECTS_'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="cyber-card p-6" style={{ '--tw-border-opacity': 1, borderColor: 'rgba(255, 0, 128, 0.3)' } as React.CSSProperties}>
                  <h3 className="font-display text-lg neon-text-pink mb-2">
                    项目名称 {i}
                  </h3>
                  <p className="text-cyber-text-dim text-sm mb-4">
                    项目描述内容，展示赛博朋克风格的作品集卡片效果...
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-xs font-mono bg-cyber-pink/10 text-cyber-pink rounded">
                      TypeScript
                    </span>
                    <span className="px-2 py-0.5 text-xs font-mono bg-cyber-pink/10 text-cyber-pink rounded">
                      Node.js
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
