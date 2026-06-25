'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const marqueeItems = [
  'FULL STACK',
  'NEXT.JS',
  'REACT',
  'TYPESCRIPT',
  'NODE.JS',
  'PRISMA',
  'POSTGRESQL',
  'TAILWIND CSS',
  'SYSTEM DESIGN',
  'PRODUCT THINKING',
]

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到顶部"
      className={`fixed bottom-6 right-6 z-30 w-10 h-10 flex items-center justify-center border border-[#2a2a2a] bg-[#111]/90 backdrop-blur-sm text-[#888] hover:text-[#ccff00] hover:border-[#ccff00]/50 transition-all duration-300 rounded-full ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}

export default function Footer() {
  return (
    <>
      <BackToTop />

      {/* 底部跑马灯 */}
      <div className="bg-[#ccff00] text-[#0a0a0a] py-3 overflow-hidden border-y border-[#ccff00]">
        <div className="flex animate-marquee whitespace-nowrap">
          <div className="flex items-center gap-8 px-4">
            {marqueeItems.map((item, i) => (
              <span key={i} className="font-display text-sm font-bold tracking-wider flex items-center gap-8">
                {item}
                <span className="text-[#0a0a0a]/40">•</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-8 px-4" aria-hidden>
            {marqueeItems.map((item, i) => (
              <span key={i} className="font-display text-sm font-bold tracking-wider flex items-center gap-8">
                {item}
                <span className="text-[#0a0a0a]/40">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer 主体 */}
      <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 品牌 */}
            <div>
              <h3 className="font-display text-base font-bold text-white mb-3">
                XIAO<span className="text-[#ccff00]">/</span>WU
              </h3>
              <p className="text-[#888] text-sm leading-relaxed">
                用代码把想法真正实现出来。
                <br />
                全栈工程师 · 项目 · 文章 · 合作
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse" />
                <span className="font-mono text-xs text-[#555]">AVAILABLE FOR WORK</span>
              </div>
            </div>

            {/* 链接 */}
            <div>
              <h3 className="font-display text-sm text-white mb-3">链接</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="https://github.com/w020316"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888] text-sm hover:text-[#ccff00] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <Link href="/articles" className="text-[#888] text-sm hover:text-[#ccff00] transition-colors">
                  文章归档
                </Link>
                <Link href="/projects" className="text-[#888] text-sm hover:text-[#ccff00] transition-colors">
                  项目展示
                </Link>
                <Link href="/#contact" className="text-[#888] text-sm hover:text-[#ccff00] transition-colors">
                  联系合作
                </Link>
              </div>
            </div>

            {/* 技术栈 */}
            <div>
              <h3 className="font-display text-sm text-white mb-3">技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind'].map((tech) => (
                  <span key={tech} className="tag">{tech}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 版权 */}
          <div className="mt-8 pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-mono text-xs text-[#555]">
              &copy; {new Date().getFullYear()} XIAO/WU. All rights reserved.
            </p>
            <p className="font-mono text-xs text-[#333]">
              BUILT WITH NEXT.JS · REACT · TAILWIND
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
