'use client'

import { useState, useCallback, useEffect } from 'react'
import SectionReveal from '@/components/ui/SectionReveal'

// 图片数据：赛博朋克风格的项目与生活瞬间
const GALLERY_IMAGES = [
  {
    prompt: 'cyberpunk portfolio website homepage with neon green accents on dark background, modern UI dashboard, Orbitron font, glitch effects',
    title: '作品集首页',
    desc: '赛博朋克风格的个人作品集入口',
    size: 'landscape_16_9',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    prompt: 'cyberpunk code editor screen with green syntax highlighting on black terminal, neon glow, programming workspace',
    title: '深夜编码',
    desc: '凌晨两点的代码与咖啡',
    size: 'landscape_4_3',
    span: '',
  },
  {
    prompt: 'neon city skyline at night with purple and cyan lights, futuristic urban landscape, cyberpunk aesthetic',
    title: '城市霓虹',
    desc: '灵感来源于城市的脉动',
    size: 'portrait_4_3',
    span: '',
  },
  {
    prompt: 'abstract AI neural network visualization with glowing nodes and connections, dark tech background, data flow',
    title: 'AI 架构',
    desc: 'RAG 检索增强生成系统可视化',
    size: 'landscape_4_3',
    span: '',
  },
  {
    prompt: 'cyberpunk mechanical keyboard with RGB backlight on dark desk setup, developer workspace, neon green glow',
    title: '开发装备',
    desc: '生产力工具全览',
    size: 'landscape_16_9',
    span: 'md:col-span-2',
  },
  {
    prompt: 'futuristic holographic dashboard with charts and data visualization, dark UI, neon cyan and green accents',
    title: '数据看板',
    desc: '项目监控与数据分析',
    size: 'landscape_4_3',
    span: '',
  },
]

function buildImageUrl(prompt: string, size: string) {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

export default function GallerySection() {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [loaded, setLoaded] = useState<Set<number>>(new Set())

  const closeLightbox = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') setLightbox((p) => (p === null ? p : (p + 1) % GALLERY_IMAGES.length))
      if (e.key === 'ArrowLeft') setLightbox((p) => (p === null ? p : (p - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, closeLightbox])

  return (
    <section className="relative py-24 sm:py-32 px-4">
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
            <span className="text-[#ccff00]">05</span>
            GALLERY
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            影像 <span className="text-[#ccff00]">瞬间</span>
          </h2>
          <p className="text-sm text-[#888] mb-12 max-w-lg">
            项目截图、开发日常与灵感碎片，点击图片可放大查看。
          </p>
        </SectionReveal>

        {/* 瀑布流网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[150px] md:auto-rows-[180px]">
          {GALLERY_IMAGES.map((img, i) => (
            <SectionReveal
              key={i}
              delay={i * 60}
              className={`${img.span} group relative overflow-hidden rounded-lg border border-[#222] hover:border-[#ccff00]/50 transition-all duration-300 cursor-pointer`}
            >
              <button
                onClick={() => setLightbox(i)}
                className="w-full h-full block relative"
                aria-label={`查看图片: ${img.title}`}
              >
                {!loaded.has(i) && (
                  <div className="absolute inset-0 bg-[#111] animate-pulse flex items-center justify-center">
                    <span className="font-mono text-[10px] text-[#333]">LOADING...</span>
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildImageUrl(img.prompt, img.size)}
                  alt={img.title}
                  loading="lazy"
                  onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    loaded.has(i) ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-display text-sm font-bold text-white mb-0.5">{img.title}</h3>
                  <p className="text-[10px] text-[#888] font-mono">{img.desc}</p>
                </div>
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#ccff00]/0 group-hover:bg-[#ccff00]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-3.5 h-3.5 text-[#ccff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
              </button>
            </SectionReveal>
          ))}
        </div>
      </div>

      {/* 灯箱 Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border border-[#333] text-white hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all z-10"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((p) => (p === null ? p : (p - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-[#333] text-white hover:bg-[#ccff00] hover:text-[#0a0a0a] hover:border-[#ccff00] transition-all"
            aria-label="上一张"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((p) => (p === null ? p : (p + 1) % GALLERY_IMAGES.length)) }}
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
              src={buildImageUrl(GALLERY_IMAGES[lightbox].prompt, 'landscape_16_9')}
              alt={GALLERY_IMAGES[lightbox].title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg border border-[#ccff00]/20 shadow-[0_0_40px_rgba(204,255,0,0.15)]"
            />
            <figcaption className="mt-4 text-center">
              <h3 className="font-display text-lg font-bold text-[#ccff00]">
                {GALLERY_IMAGES[lightbox].title}
              </h3>
              <p className="text-xs text-[#888] font-mono mt-1">
                {GALLERY_IMAGES[lightbox].desc} · {lightbox + 1} / {GALLERY_IMAGES.length}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
