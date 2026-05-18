'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyberblog-theme')
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
      try { localStorage.setItem('cyberblog-theme', 'light') } catch {}
    } else {
      document.documentElement.classList.remove('light-mode')
      try { localStorage.setItem('cyberblog-theme', 'dark') } catch {}
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? '切换到暗色模式' : '切换到亮色模式'}
      className="flex items-center justify-center w-10 h-10 rounded-sm border border-cyber-border text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon transition-colors font-mono text-lg"
    >
      {isLight ? '☽' : '☀'}
    </button>
  )
}
