'use client'

import { useRef, useState, type ReactNode } from 'react'

/**
 * 3D 倾斜卡片 Hook
 * 鼠标移动时卡片产生 3D 倾斜效果，参考视频 Capability 区
 */
export function use3DTilt<T extends HTMLElement>(maxTilt = 8) {
  const ref = useRef<T>(null)
  const [transform, setTransform] = useState('')
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

  function handleMouseMove(e: React.MouseEvent<T>) {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }

  function handleMouseLeave() {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setGlarePos({ x: 50, y: 50 })
  }

  return { ref, transform, glarePos, handleMouseMove, handleMouseLeave }
}

/**
 * 3D 倾斜卡片组件
 */
interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}

export default function TiltCard({ children, className = '', maxTilt = 8, glare = true }: TiltCardProps) {
  const { ref, transform, glarePos, handleMouseMove, handleMouseLeave } = use3DTilt<HTMLDivElement>(maxTilt)

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform, transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(204,255,0,0.08), transparent 50%)`,
            opacity: transform !== '' ? 1 : 0,
          }}
        />
      )}
    </div>
  )
}
