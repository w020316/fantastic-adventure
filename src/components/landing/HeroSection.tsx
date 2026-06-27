'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hero 区 - 个人品牌首屏
 * 核心交互：鼠标光斑跟随，覆盖姓名时中文名渐变为英文名
 * 参考视频 ZHOU/MO 的姓名揭示效果
 */
export default function HeroSection() {
  const nameRef = useRef<HTMLDivElement>(null)
  const [revealProgress, setRevealProgress] = useState(0) // 0 = 中文名, 1 = 英文名

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 触屏设备：自动循环揭示动画（中文名 ↔ 英文名）
    if (isTouchDevice && !prefersReducedMotion) {
      // 循环周期 4s：中文 2.5s → 渐变 0.5s → 英文 1s → 渐变回 0.5s
      const cycle = 4000
      const fadeIn = 500
      const showEn = 1000
      const fadeOut = 500
      const showCn = 2000

      const startTime = Date.now()
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) % cycle
        let progress = 0
        if (elapsed < showCn) {
          // 显示中文
          progress = 0
        } else if (elapsed < showCn + fadeIn) {
          // 中文 → 英文渐变
          progress = (elapsed - showCn) / fadeIn
        } else if (elapsed < showCn + fadeIn + showEn) {
          // 显示英文
          progress = 1
        } else {
          // 英文 → 中文渐变
          progress = 1 - (elapsed - showCn - fadeIn - showEn) / fadeOut
        }
        setRevealProgress(Math.max(0, Math.min(1, progress)))
      }, 16)
      return () => clearInterval(timer)
    }

    // 桌面端：鼠标驱动揭示
    if (isTouchDevice || prefersReducedMotion) return

    const nameEl = nameRef.current
    if (!nameEl) return

    let rafId = 0

    function handleMouseMove(e: MouseEvent) {
      const el = nameRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // 计算鼠标到名字中心的距离
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // 名字区域的半径（对角线的一半）
      const maxDistance = Math.sqrt(rect.width * rect.width + rect.height * rect.height) / 2

      // 鼠标越接近名字中心，揭示进度越高
      if (distance < maxDistance) {
        const progress = 1 - distance / maxDistance
        setRevealProgress(Math.min(1, progress * 1.5))
      } else {
        setRevealProgress(0)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* 网格背景 */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* 顶部标语 */}
      <div className="relative z-10 text-center mb-8">
        <p
          className="font-mono text-xs sm:text-sm tracking-[0.3em] text-[#888] uppercase animate-[fadeInUp_0.8s_ease-out]"
          style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
        >
          Hello, I&apos;m
        </p>
      </div>

      {/* 姓名揭示区 - 核心交互 */}
      <div
        ref={nameRef}
        className="relative z-10 cursor-default select-none"
        style={{ perspective: '1000px' }}
      >
        {/* 中文名 - 默认显示 */}
        <h1
          className="font-display text-[20vw] sm:text-[16vw] md:text-[14vw] lg:text-[12rem] font-bold leading-none tracking-tight transition-opacity duration-300"
          style={{
            opacity: 1 - revealProgress * 0.9,
            color: '#ffffff',
          }}
        >
          周末
        </h1>

        {/* 英文名 - 光斑覆盖时揭示 */}
        <h1
          className="absolute inset-0 font-display text-[20vw] sm:text-[16vw] md:text-[14vw] lg:text-[12rem] font-bold leading-none tracking-tight transition-opacity duration-300 flex items-center justify-center"
          style={{
            opacity: revealProgress,
            color: '#ccff00',
            textShadow: revealProgress > 0.3 ? `0 0 ${40 * revealProgress}px rgba(204,255,0,0.4)` : 'none',
          }}
          aria-hidden="true"
        >
          Cris
        </h1>

        {/* 描边版本 - 始终可见的轮廓 */}
        <h1
          className="absolute inset-0 font-display text-[20vw] sm:text-[16vw] md:text-[14vw] lg:text-[12rem] font-bold leading-none tracking-tight text-stroke pointer-events-none"
          aria-hidden="true"
        >
          Cris
        </h1>
      </div>

      {/* 副标题 */}
      <div
        className="relative z-10 text-center mt-8 max-w-2xl"
        style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
      >
        <p className="text-lg sm:text-xl text-white font-medium">
          在校大学生 · 全栈开发实践者
        </p>
        <p className="mt-2 text-sm sm:text-base text-[#888] leading-relaxed">
          用代码把想法真正实现出来
        </p>
      </div>

      {/* CTA 按钮 */}
      <div
        className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mt-10"
        style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}
      >
        <a href="#projects" className="btn-brand w-full sm:w-auto">
          查看作品
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
        <a href="#contact" className="btn-outline w-full sm:w-auto">
          联系合作
        </a>
      </div>

      {/* 滚动提示 */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        style={{ animation: 'fadeInUp 0.8s ease-out 0.7s both' }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#555] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#ccff00]/50 to-transparent animate-pulse" />
        </div>
      </div>

      {/* 角落装饰 - 状态信息 */}
      <div className="absolute top-24 left-4 sm:left-8 z-10 hidden sm:block" style={{ animation: 'fadeInUp 1s ease-out 0.9s both' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse" />
          <span className="font-mono text-xs text-[#555]">OPEN TO INTERNSHIP</span>
        </div>
      </div>

      <div className="absolute top-24 right-4 sm:right-8 z-10 hidden sm:block" style={{ animation: 'fadeInUp 1s ease-out 1s both' }}>
        <p className="font-mono text-xs text-[#555] text-right">
          BASED IN CHINA<br />
          <span className="text-[#888]">CS STUDENT · DEVELOPER</span>
        </p>
      </div>
    </section>
  )
}
