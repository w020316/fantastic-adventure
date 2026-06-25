'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('xiaowu-theme')
      if (stored === 'light') {
        setIsLight(true)
        document.documentElement.classList.add('light-mode')
      }
    } catch {}
  }, [])

  function toggle() {
    const next = !isLight
    setIsLight(next)
    if (next) {
      document.documentElement.classList.add('light-mode')
      try { localStorage.setItem('xiaowu-theme', 'light') } catch {}
    } else {
      document.documentElement.classList.remove('light-mode')
      try { localStorage.setItem('xiaowu-theme', 'dark') } catch {}
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? '切换到暗色模式' : '切换到亮色模式'}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-[#2a2a2a] text-[#888] hover:text-[#ccff00] hover:border-[#ccff00]/50 transition-colors min-w-[44px] min-h-[44px]"
    >
      {isLight ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  )
}
