'use client'

import { useState, useEffect } from 'react'
import { SITE_CONFIG, CHANGELOG } from '@/lib/site-config'

const STORAGE_KEY = 'cyberblog-seen-version'

export default function UpdateNoticeModal() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    // 尊重 prefers-reduced-motion：不自动弹窗动画
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    try {
      const seenVersion = localStorage.getItem(STORAGE_KEY)
      const currentVersion = SITE_CONFIG.version
      // 仅在「访问过旧版本」时弹窗：首次访问（无记录）静默写入版本号，不打扰新用户
      if (seenVersion && seenVersion !== currentVersion) {
        // 延迟 1.5s 弹出，确保首屏渲染完成、用户已浏览到内容后再提示
        const timer = setTimeout(() => setVisible(true), reduceMotion ? 0 : 1500)
        return () => clearTimeout(timer)
      }
      // 首次访问或版本一致：静默记录当前版本
      localStorage.setItem(STORAGE_KEY, currentVersion)
    } catch {
      // localStorage 不可用时静默忽略
    }
  }, [])

  const dismiss = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      try {
        localStorage.setItem(STORAGE_KEY, SITE_CONFIG.version)
      } catch {
        // 忽略写入失败
      }
    }, 250)
  }

  if (!visible) return null

  const latest = CHANGELOG[0]
  if (!latest) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-250 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-notice-title"
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* 弹窗主体 */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-250 ${
          closing ? 'scale-95 translate-y-2 opacity-0' : 'scale-100 translate-y-0 opacity-100'
        }`}
      >
        <div className="cyber-card overflow-hidden">
          {/* 顶部荧光条 */}
          <div className="h-1 bg-gradient-to-r from-[#ccff00] via-[#00ff9f] to-[#ccff00]" />

          {/* 头部 */}
          <div className="px-6 pt-6 pb-4 border-b border-[#222]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse" />
                    <span className="font-mono text-[10px] text-[#ccff00]">NEW</span>
                  </span>
                  <span className="font-mono text-xs text-[#666]">v{latest.version}</span>
                </div>
                <h2 id="update-notice-title" className="font-display text-xl font-bold text-white">
                  站点已更新
                </h2>
                <p className="font-mono text-[10px] text-[#555] mt-0.5">{latest.date}</p>
              </div>
              <button
                onClick={dismiss}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#666] hover:text-white hover:bg-[#222] transition-all"
                aria-label="关闭"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 更新内容列表 */}
          <div className="px-6 py-5">
            <p className="font-mono text-xs text-[#888] mb-3">本次更新内容：</p>
            <ul className="space-y-2.5">
              {latest.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center">
                    <span className="text-[#ccff00] text-[10px]">▸</span>
                  </span>
                  <span className="text-sm text-[#ccc] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 底部操作 */}
          <div className="px-6 py-4 border-t border-[#222] flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#444]">
              {SITE_CONFIG.brandName} · 感谢你的访问
            </span>
            <button
              onClick={dismiss}
              className="px-5 py-2 bg-[#ccff00] text-[#0a0a0a] text-xs font-mono font-semibold rounded-md hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:-translate-y-0.5 transition-all"
            >
              知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
