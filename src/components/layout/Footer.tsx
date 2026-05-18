'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      className={`fixed bottom-6 right-6 z-30 w-10 h-10 flex items-center justify-center border border-cyber-border bg-cyber-surface/90 backdrop-blur-sm text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon/50 transition-all duration-300 rounded-sm ${
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
      <footer className="border-t border-cyber-border mt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-neon/3 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-neon/30 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-sm neon-text mb-3">CYBERBLOG</h3>
              <p className="text-cyber-text-dim text-sm leading-relaxed">
                赛博朋克风格个人博客
                <br />
                技术探索 · 生活记录 · 创意作品
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-pulse" />
                <span className="font-mono text-xs text-cyber-text-dim">SYSTEM.ACTIVE</span>
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm text-cyber-text mb-3">{'> LINKS_'}</h3>
              <div className="flex flex-col gap-2">
                <a href="https://github.com/w020316/fantastic-adventure" target="_blank" rel="noopener noreferrer" className="text-cyber-text-dim text-sm hover:text-cyber-neon transition-colors font-mono flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  GitHub
                </a>
                <Link href="/articles" className="text-cyber-text-dim text-sm hover:text-cyber-neon transition-colors font-mono">
                  文章归档
                </Link>
                <Link href="/projects" className="text-cyber-text-dim text-sm hover:text-cyber-neon transition-colors font-mono">
                  项目展示
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm text-cyber-text mb-3">{'> TECH_STACK_'}</h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'Prisma', 'PostgreSQL', 'Tailwind'].map((tech) => (
                  <span key={tech} className="cyber-tag">{tech}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-cyber-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-mono text-xs text-cyber-text-dim">
              &copy; {new Date().getFullYear()} CyberBlog. All rights reserved.
            </p>
            <p className="font-mono text-xs text-cyber-text-dim/50">
              NEXT.JS 16 · PRISMA 6 · TAILWIND CSS 4
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
