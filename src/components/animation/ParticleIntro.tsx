'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  color: string
  speed: number
  alpha: number
}

const COLORS = ['#00ff9f', '#ff0080', '#00d4ff', '#ffe600']

export default function ParticleIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'gathering' | 'exploding' | 'title' | 'fadeout'>('gathering')
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    const count = 200
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.max(canvas.width, canvas.height)
      particles.push({
        x: cx + Math.cos(angle) * dist * (0.5 + Math.random()),
        y: cy + Math.sin(angle) * dist * (0.5 + Math.random()),
        targetX: cx + (Math.random() - 0.5) * 30,
        targetY: cy + (Math.random() - 0.5) * 30,
        size: 1 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 0.01 + Math.random() * 0.03,
        alpha: 0.5 + Math.random() * 0.5,
      })
    }
    particlesRef.current = particles

    let animFrame: number
    let startTime = Date.now()

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const elapsed = Date.now() - startTime

      for (const p of particles) {
        if (phase === 'gathering') {
          p.x += (p.targetX - p.x) * p.speed
          p.y += (p.targetY - p.y) * p.speed
        } else if (phase === 'exploding') {
          const angle = Math.atan2(p.y - cy, p.x - cx)
          p.x += Math.cos(angle) * 8
          p.y += Math.sin(angle) * 8
          p.alpha = Math.max(0, p.alpha - 0.02)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        if (p.size > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha * 0.1
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      if (phase === 'gathering' && elapsed > 2000) {
        setPhase('exploding')
        startTime = Date.now()
      }

      if (phase === 'exploding' && elapsed > 800) {
        setPhase('title')
        return
      }

      animFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animFrame)
  }, [phase])

  useEffect(() => {
    if (phase === 'title') {
      const timer = setTimeout(() => setPhase('fadeout'), 1500)
      return () => clearTimeout(timer)
    }
    if (phase === 'fadeout') {
      const timer = setTimeout(() => onComplete(), 800)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg transition-opacity duration-700 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {phase === 'title' && (
        <div className="relative z-10 text-center">
          <h1
            className="glitch-text font-display text-5xl md:text-7xl font-bold neon-text"
            data-text="CYBERBLOG"
          >
            CYBERBLOG
          </h1>
          <p className="mt-4 font-mono text-cyber-text-dim text-sm tracking-widest">
            {'> SYSTEM INITIALIZED_'}
          </p>
        </div>
      )}
      {phase === 'exploding' && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      )}
    </div>
  )
}
