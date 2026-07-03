'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import SectionReveal from '@/components/ui/SectionReveal'

// 上下两排照片展示 + 左右转动交互
// 赛博朋克风格：荧光绿边框、霓虹发光、暗色背景
// 上排正向滚动，下排反向滚动（视觉错落）

interface PhotoItem {
  prompt: string
  title: string
  desc: string
  size: string
}

// 上排照片（项目相关）
const TOP_ROW: PhotoItem[] = [
  {
    prompt: 'cyberpunk portfolio website with neon green code on dark screen, modern web design, glitch effect',
    title: '作品集首页',
    desc: '赛博朋克风格入口',
    size: 'landscape_4_3',
  },
  {
    prompt: 'cyberpunk code editor with green syntax highlighting, terminal screen, programming at night',
    title: '深夜编码',
    desc: '凌晨两点的代码',
    size: 'landscape_4_3',
  },
  {
    prompt: 'neon city skyline at night with purple cyan lights, futuristic urban landscape',
    title: '城市霓虹',
    desc: '灵感来源',
    size: 'landscape_4_3',
  },
  {
    prompt: 'abstract AI neural network visualization with glowing nodes, dark tech background, data flow',
    title: 'AI 架构',
    desc: 'RAG 系统可视化',
    size: 'landscape_4_3',
  },
  {
    prompt: 'cyberpunk mechanical keyboard with RGB backlight on dark desk, developer workspace',
    title: '开发装备',
    desc: '生产力工具',
    size: 'landscape_4_3',
  },
  {
    prompt: 'futuristic holographic dashboard with charts, dark UI, neon cyan green accents',
    title: '数据看板',
    desc: '项目监控',
    size: 'landscape_4_3',
  },
]

// 下排照片（生活与灵感）
const BOTTOM_ROW: PhotoItem[] = [
  {
    prompt: 'cyberpunk coffee cup with steam on dark desk, neon green glow, late night programming',
    title: '咖啡与代码',
    desc: '最佳搭档',
    size: 'landscape_4_3',
  },
  {
    prompt: 'cyberpunk city street at night with rain reflection, neon signs, futuristic atmosphere',
    title: '雨夜街头',
    desc: '城市脉动',
    size: 'landscape_4_3',
  },
  {
    prompt: 'abstract digital art with green matrix code rain, cyberpunk aesthetic, data stream',
    title: '数据矩阵',
    desc: '信息洪流',
    size: 'landscape_4_3',
  },
  {
    prompt: 'futuristic workspace with multiple monitors showing code, dark room, neon lights',
    title: '工作站',
    desc: '多屏协作',
    size: 'landscape_4_3',
  },
  {
    prompt: 'cyberpunk robot AI assistant hologram, green blue neon glow, dark background',
    title: 'AI 助手',
    desc: '智能协作',
    size: 'landscape_4_3',
  },
  {
    prompt: 'abstract 3D render of geometric shapes with neon green edges on black background',
    title: '几何美学',
    desc: '设计灵感',
    size: 'landscape_4_3',
  },
]

function buildImageUrl(prompt: string, size: string) {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

// 单张照片卡片
function PhotoCard({
  item,
  index,
  loaded,
  onLoad,
  onClick,
}: {
  item: PhotoItem
  index: number
  loaded: boolean
  onLoad: () => void
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] aspect-[4/3] overflow-hidden rounded-lg border border-[#222] hover:border-[#ccff00]/60 transition-all duration-300 group"
      aria-label={`查看图片: ${item.title}`}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-[#0a0a0a] animate-pulse flex items-center justify-center">
          <span className="font-mono text-[10px] text-[#333]">LOADING...</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={buildImageUrl(item.prompt, item.size)}
        alt={item.title}
        loading="lazy"
        onLoad={onLoad}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
      {/* 标题信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-display text-sm font-bold text-white mb-0.5">{item.title}</h3>
        <p className="text-[10px] text-[#888] font-mono">{item.desc}</p>
      </div>
      {/* 序号 */}
      <div className="absolute top-3 left-3 font-mono text-[10px] text-[#ccff00]/60">
        {String(index + 1).padStart(2, '0')}
      </div>
      {/* hover 放大图标 */}
      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#ccff00]/0 group-hover:bg-[#ccff00]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <svg className="w-3.5 h-3.5 text-[#ccff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </div>
    </button>
  )
}

export default function PhotoStripSection() {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [topLoaded, setTopLoaded] = useState<Set<number>>(new Set())
  const [bottomLoaded, setBottomLoaded] = useState<Set<number>>(new Set())
  const [lightbox, setLightbox] = useState<{ row: 'top' | 'bottom'; index: number } | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  // 自动滚动：悬停或灯箱打开时暂停
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
  }, [])

  // 左右滚动（上排正向，下排反向）
  const scrollBy = useCallback((direction: 'left' | 'right', row: 'top' | 'bottom') => {
    const ref = row === 'top' ? topRef.current : bottomRef.current
    if (!ref) return
    const amount = 380 // 单张卡片宽度 + gap
    // 下排反向：右按钮向左滚，左按钮向右滚
    const sign = row === 'bottom' ? -1 : 1
    const delta = direction === 'left' ? -amount * sign : amount * sign
    ref.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

  // 自动滚动：上排正向、下排反向，到末尾循环回开头
  useEffect(() => {
    if (reduceMotion || paused || lightbox !== null) return
    const STEP = 380 // 单张卡片宽度 + gap
    const INTERVAL = 3000 // 每 3 秒滚动一张

    const timer = setInterval(() => {
      // 上排：向右滚动，到末尾回到开头
      const top = topRef.current
      if (top) {
        const maxScroll = top.scrollWidth - top.clientWidth
        if (maxScroll <= 0) return
        const next = top.scrollLeft + STEP
        if (next >= maxScroll) {
          top.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          top.scrollBy({ left: STEP, behavior: 'smooth' })
        }
      }
      // 下排：向左滚动（反向），到开头回到末尾
      const bottom = bottomRef.current
      if (bottom) {
        const maxScroll = bottom.scrollWidth - bottom.clientWidth
        if (maxScroll <= 0) return
        const next = bottom.scrollLeft - STEP
        if (bottom.scrollLeft <= 0) {
          bottom.scrollTo({ left: maxScroll, behavior: 'smooth' })
        } else {
          bottom.scrollBy({ left: -STEP, behavior: 'smooth' })
        }
      }
    }, INTERVAL)

    return () => clearInterval(timer)
  }, [reduceMotion, paused, lightbox])

  // 灯箱键盘导航
  const allPhotos = [
    ...TOP_ROW.map((p, i) => ({ ...p, row: 'top' as const, index: i })),
    ...BOTTOM_ROW.map((p, i) => ({ ...p, row: 'bottom' as const, index: i })),
  ]

  useEffect(() => {
    if (lightbox === null) return
    const currentIdx = allPhotos.findIndex(
      (p) => p.row === lightbox.row && p.index === lightbox.index
    )
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') {
        const next = (currentIdx + 1) % allPhotos.length
        setLightbox({ row: allPhotos[next].row, index: allPhotos[next].index })
      }
      if (e.key === 'ArrowLeft') {
        const prev = (currentIdx - 1 + allPhotos.length) % allPhotos.length
        setLightbox({ row: allPhotos[prev].row, index: allPhotos[prev].index })
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox])

  const lightboxPhoto = lightbox
    ? allPhotos.find((p) => p.row === lightbox.row && p.index === lightbox.index)
    : null

  return (
    <section
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 背景网格 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#ccff00 1px, transparent 1px), linear-gradient(90deg, #ccff00 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">06</span>
            PHOTOS
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            影像 <span className="text-[#ccff00]">长廊</span>
          </h2>
          <p className="text-sm text-[#888] mb-12 max-w-lg">
            上下两排照片自动滚动浏览，鼠标悬停暂停，点击左右按钮手动转动，点击图片可放大查看。
          </p>
        </SectionReveal>

        {/* 上排照片（正向滚动） */}
        <div className="relative mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#ccff00] tracking-widest">ROW 01 ↑</span>
              <span className="font-mono text-[10px] text-[#444]">项目瞬间</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollBy('left', 'top')}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222] text-[#888] hover:border-[#ccff00] hover:text-[#ccff00] transition-all"
                aria-label="上排向左滚动"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollBy('right', 'top')}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222] text-[#888] hover:border-[#ccff00] hover:text-[#ccff00] transition-all"
                aria-label="上排向右滚动"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={topRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#222 #0a0a0a',
              // 隐藏 webkit 滚动条
              msOverflowStyle: 'none',
            }}
          >
            {TOP_ROW.map((item, i) => (
              <PhotoCard
                key={i}
                item={item}
                index={i}
                loaded={topLoaded.has(i)}
                onLoad={() => setTopLoaded((prev) => new Set(prev).add(i))}
                onClick={() => setLightbox({ row: 'top', index: i })}
              />
            ))}
            {/* 末尾占位 */}
            <div className="flex-shrink-0 w-1" />
          </div>
        </div>

        {/* 下排照片（反向滚动） */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => scrollBy('left', 'bottom')}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222] text-[#888] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all"
                aria-label="下排向左滚动"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollBy('right', 'bottom')}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222] text-[#888] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all"
                aria-label="下排向右滚动"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#444]">生活灵感</span>
              <span className="font-mono text-[10px] text-[#00d4ff] tracking-widest">↓ ROW 02</span>
            </div>
          </div>
          <div
            ref={bottomRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#222 #0a0a0a',
              msOverflowStyle: 'none',
            }}
          >
            {BOTTOM_ROW.map((item, i) => (
              <PhotoCard
                key={i}
                item={item}
                index={i}
                loaded={bottomLoaded.has(i)}
                onLoad={() => setBottomLoaded((prev) => new Set(prev).add(i))}
                onClick={() => setLightbox({ row: 'bottom', index: i })}
              />
            ))}
            <div className="flex-shrink-0 w-1" />
          </div>
        </div>
      </div>

      {/* 灯箱 Lightbox */}
      {lightbox && lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border border-[#333] text-white hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all z-10"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              const currentIdx = allPhotos.findIndex(
                (p) => p.row === lightbox.row && p.index === lightbox.index
              )
              const prev = (currentIdx - 1 + allPhotos.length) % allPhotos.length
              setLightbox({ row: allPhotos[prev].row, index: allPhotos[prev].index })
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-[#333] text-white hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all"
            aria-label="上一张"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const currentIdx = allPhotos.findIndex(
                (p) => p.row === lightbox.row && p.index === lightbox.index
              )
              const next = (currentIdx + 1) % allPhotos.length
              setLightbox({ row: allPhotos[next].row, index: allPhotos[next].index })
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-[#333] text-white hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all"
            aria-label="下一张"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <figure
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buildImageUrl(lightboxPhoto.prompt, 'landscape_16_9')}
              alt={lightboxPhoto.title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg border border-[#ccff00]/20 shadow-[0_0_40px_rgba(204,255,0,0.15)]"
            />
            <figcaption className="mt-4 text-center">
              <h3 className="font-display text-lg font-bold text-[#ccff00]">
                {lightboxPhoto.title}
              </h3>
              <p className="text-xs text-[#888] font-mono mt-1">
                {lightboxPhoto.desc} · {lightbox.row === 'top' ? '上排' : '下排'} {lightbox.index + 1}
              </p>
            </figcaption>
          </figure>
        </div>
      )}

      {/* 内联样式：隐藏 webkit 滚动条 */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        div::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #ccff00;
        }
      `}</style>
    </section>
  )
}
