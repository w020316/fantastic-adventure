import { Suspense } from 'react'
import LandingClient from './landing-client'

export default function LandingPage() {
  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/home" />
        <style>{`body { margin: 0; background: #0a0a0f; color: #00ff9f; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; } a { color: #00ff9f; }`}</style>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>CYBERBLOG</h1>
          <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>需要 JavaScript 才能获得完整体验</p>
          <a href="/home" style={{ border: '1px solid #00ff9f', padding: '0.75rem 2rem', textDecoration: 'none', borderRadius: '4px' }}>
            进入主页 →
          </a>
        </div>
      </noscript>

      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--color-cyber-bg, #0a0a0f)' }}
      >
        <div className="grid-bg absolute inset-0" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin" style={{ animationDuration: '120s' }}>
            <div className="absolute top-1/4 left-1/4 h-px w-96 bg-gradient-to-r from-transparent via-cyber-neon/20 to-transparent rotate-45" />
            <div className="absolute top-1/3 left-1/3 h-px w-80 bg-gradient-to-r from-transparent via-cyber-pink/15 to-transparent -rotate-12" />
            <div className="absolute top-1/2 left-1/4 h-px w-72 bg-gradient-to-r from-transparent via-cyber-blue/10 to-transparent rotate-30" />
          </div>
        </div>

        <div className="relative z-10 text-center px-4">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-neon/60 border border-cyber-neon/20 px-3 py-1 rounded-sm">
              SYSTEM.ONLINE
            </span>
          </div>

          <h1
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold neon-text mb-4 leading-none"
            style={{ fontFamily: 'var(--font-display), Orbitron, system-ui, sans-serif' }}
          >
            CYBERBLOG
          </h1>

          <p className="font-mono text-cyber-text-dim text-sm sm:text-base tracking-[0.2em] mb-2">
            {'// 赛博朋克个人博客系统'}
          </p>

          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-cyber-neon/50" />
            <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-pulse" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-cyber-neon/50" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/home"
              className="cyber-button group flex items-center gap-3 px-8 py-3 text-sm"
            >
              <span className="w-2 h-2 bg-cyber-neon rounded-full group-hover:animate-pulse" />
              浏览文章
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <a
              href="/about"
              className="cyber-button group flex items-center gap-3 px-8 py-3 text-sm"
              style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
            >
              <span className="w-2 h-2 bg-cyber-pink rounded-full group-hover:animate-pulse" />
              了解更多
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          <div className="mt-16 font-mono text-xs text-cyber-text-dim/40 space-y-1">
            <p>{'>'} NEXT.JS 16 · PRISMA 6 · TAILWIND CSS 4</p>
            <p>{'>'} V6.0.0_BUILD.2026.05.18</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-neon/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-pink/20 to-transparent" />
      </div>

      <Suspense fallback={null}>
        <LandingClient />
      </Suspense>
    </>
  )
}
