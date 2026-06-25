'use client'

import { useEffect, useRef } from 'react'

/**
 * 鼠标跟随光斑组件
 * 全局荧光绿圆形光斑跟随鼠标，营造高级科技感
 * 移动端和 prefers-reduced-motion 下不启用
 */
export default function SpotlightCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 检测是否为触屏设备或偏好减少动画
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouchDevice || prefersReducedMotion) return

    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let rafId = 0
    let isVisible = false

    function handleMouseMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
      const el = cursorRef.current
      if (!el) return
      if (!isVisible) {
        isVisible = true
        el.style.opacity = '1'
      }
    }

    function handleMouseLeave() {
      isVisible = false
      const el = cursorRef.current
      if (el) el.style.opacity = '0'
    }

    function handleMouseEnter() {
      isVisible = true
      const el = cursorRef.current
      if (el) el.style.opacity = '1'
    }

    // 检测是否悬停在可交互元素上，放大光斑
    function handleMouseOver(e: MouseEvent) {
      const el = cursorRef.current
      if (!el) return
      const target = e.target as HTMLElement
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"]')
      if (isInteractive) {
        el.classList.add('cursor-expanded')
      } else {
        el.classList.remove('cursor-expanded')
      }
    }

    function animate() {
      const el = cursorRef.current
      if (!el) {
        rafId = requestAnimationFrame(animate)
        return
      }
      // 平滑跟随（lerp）
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15
      el.style.transform = `translate3d(${cursorX - 250}px, ${cursorY - 250}px, 0)`
      rafId = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none opacity-0 transition-opacity duration-300"
      style={{
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, rgba(204,255,0,0.03) 40%, transparent 70%)',
        willChange: 'transform',
        mixBlendMode: 'screen',
      }}
    />
  )
}
