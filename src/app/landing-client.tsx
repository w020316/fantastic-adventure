'use client'

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'

function FallbackIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1500)
    return () => clearTimeout(t)
  }, [onComplete])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg">
      <div className="text-center">
        <h1 className="font-display text-5xl md:text-7xl font-bold neon-text mb-4">CYBERBLOG</h1>
        <p className="font-mono text-cyber-neon text-sm animate-pulse">{'> SYSTEM INITIALIZED_'}</p>
      </div>
    </div>
  )
}

const ParticleIntro = lazy(() =>
  import('@/components/animation/ParticleIntro').catch(() => ({ default: FallbackIntro }))
)

class ParticleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export default function LandingClient() {
  const [showIntro, setShowIntro] = useState(false)
  const [entered, setEntered] = useState(false)
  const router = useRouter()
  const introSkippedRef = useRef(false)
  const introCompletedRef = useRef(false)

  useEffect(() => {
    try {
      if (!sessionStorage.getItem('cyberblog-intro-shown')) {
        setShowIntro(true)
      }
    } catch {
      setShowIntro(true)
    }
  }, [])

  const handleIntroComplete = useCallback(() => {
    if (introSkippedRef.current || introCompletedRef.current) return
    introSkippedRef.current = true
    introCompletedRef.current = true
    try {
      sessionStorage.setItem('cyberblog-intro-shown', '1')
    } catch {}
    setShowIntro(false)
  }, [])

  useEffect(() => {
    if (!showIntro) return
    const timeout = setTimeout(() => handleIntroComplete(), 5000)
    return () => clearTimeout(timeout)
  }, [showIntro, handleIntroComplete])

  function handleEnter(target: string) {
    setEntered(true)
    setTimeout(() => router.push(target), 600)
  }

  if (showIntro) {
    return (
      <ParticleErrorBoundary
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg">
            <div className="text-center">
              <h1 className="font-display text-5xl md:text-7xl font-bold neon-text mb-4">CYBERBLOG</h1>
              <p className="font-mono text-cyber-neon text-sm animate-pulse">{'> SYSTEM INITIALIZED_'}</p>
            </div>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg">
              <div className="text-center">
                <h1 className="font-display text-5xl md:text-7xl font-bold neon-text mb-4">CYBERBLOG</h1>
                <p className="font-mono text-cyber-neon text-sm animate-pulse">{'> LOADING...'}</p>
              </div>
            </div>
          }
        >
          <ParticleIntro onComplete={handleIntroComplete} />
        </Suspense>
      </ParticleErrorBoundary>
    )
  }

  return (
    <>
      {!showIntro && (
        <>
          <button
            onClick={() => handleEnter('/home')}
            className="fixed bottom-6 right-6 z-[60] font-mono text-xs tracking-wider text-cyber-text-dim/70 border border-cyber-border/50 px-4 py-2 rounded-sm hover:border-cyber-neon hover:text-cyber-neon transition-all duration-300 backdrop-blur-sm bg-cyber-bg/50"
          >
            进入主页 →
          </button>

          <button
            onClick={() => handleEnter('/about')}
            className="fixed bottom-16 right-6 z-[60] font-mono text-xs tracking-wider text-cyber-text-dim/70 border border-cyber-border/50 px-4 py-2 rounded-sm hover:border-cyber-pink hover:text-cyber-pink transition-all duration-300 backdrop-blur-sm bg-cyber-bg/50"
          >
            了解更多 →
          </button>

          <div
            className={`fixed inset-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-700 ${
              entered ? 'scale-105 opacity-0 blur-sm' : ''
            }`}
          >
            <p className="font-mono text-xs text-cyber-neon/60 animate-pulse">
              {'> 正在跳转...'}
            </p>
          </div>
        </>
      )}
    </>
  )
}
