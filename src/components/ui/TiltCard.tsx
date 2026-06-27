'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

/**
 * 3D 倾斜卡片 Hook
 * 桌面端：鼠标移动时卡片产生 3D 倾斜效果
 * 移动端：陀螺仪驱动 3D 倾斜（iOS 需权限请求），不支持时降级为入场动画
 */
export function use3DTilt<T extends HTMLElement>(maxTilt = 8) {
  const ref = useRef<T>(null)
  const [transform, setTransform] = useState('')
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

  // 桌面端：鼠标驱动
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

  // 移动端：陀螺仪驱动
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isTouchDevice || prefersReducedMotion) return

    // 检查是否支持陀螺仪
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') return

    let gyroActive = false

    function handleOrientation(e: DeviceOrientationEvent) {
      const el = ref.current
      if (!el) return

      // beta: 前后倾斜 (-180~180), gamma: 左右倾斜 (-90~90)
      const beta = e.beta ?? 0
      const gamma = e.gamma ?? 0

      // 限制范围并映射到 maxTilt
      const rotateX = Math.max(-maxTilt, Math.min(maxTilt, ((beta - 45) / 45) * -maxTilt))
      const rotateY = Math.max(-maxTilt, Math.min(maxTilt, (gamma / 45) * maxTilt))

      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`)
      setGlarePos({ x: 50 + (gamma / 45) * 30, y: 50 + ((beta - 45) / 45) * 30 })
      gyroActive = true
    }

    // iOS 13+ 需要请求权限
    function requestPermissionOnTouch() {
      const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>
      }
      if (typeof DOE.requestPermission === 'function') {
        DOE.requestPermission()
          .then((state: string) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation)
            }
          })
          .catch(() => {})
      } else {
        // 非 iOS，直接监听
        window.addEventListener('deviceorientation', handleOrientation)
      }
      // 移除触摸监听（只需请求一次）
      document.removeEventListener('touchstart', requestPermissionOnTouch)
    }

    // iOS 需要用户手势触发权限请求
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (isIOS && typeof (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      document.addEventListener('touchstart', requestPermissionOnTouch, { once: true })
    } else {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    // 降级方案：3秒内没有陀螺仪数据，触发入场动画
    const fallbackTimer = setTimeout(() => {
      if (!gyroActive) {
        setTransform(`perspective(1000px) rotateX(${maxTilt * 0.5}deg) rotateY(${maxTilt * 0.5}deg) scale3d(1, 1, 1)`)
        setTimeout(() => {
          setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
        }, 600)
      }
    }, 1500)

    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener('deviceorientation', handleOrientation)
      document.removeEventListener('touchstart', requestPermissionOnTouch)
    }
  }, [maxTilt])

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
