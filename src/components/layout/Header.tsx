'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { href: '/home', label: '首页' },
  { href: '/articles', label: '文章' },
  { href: '/bookmarks', label: '书签' },
  { href: '/projects', label: '作品集' },
  { href: '/about', label: '关于' },
  { href: '/history', label: '历史' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyber-neon focus:text-cyber-bg focus:font-mono focus:text-sm focus:rounded-sm"
      >
        跳转到主要内容
      </a>
      <header className="sticky top-0 z-40 border-b border-cyber-border bg-cyber-surface/95 md:backdrop-blur-md md:bg-cyber-surface/80" ref={menuRef}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/home" className="font-display text-xl font-bold neon-text tracking-wider">
            CYBERBLOG
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="主导航">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-mono text-sm transition-colors relative group ${
                    isActive ? 'text-cyber-neon' : 'text-cyber-text-dim hover:text-cyber-neon'
                  }`}
                >
                  {`> ${item.label}_`}
                  <span className={`absolute -bottom-1 left-0 h-px bg-cyber-neon transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              )
            })}
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-cyber-neon p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-cyber-border bg-cyber-surface/95 md:backdrop-blur-md md:bg-cyber-surface/80">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block px-4 py-3 font-mono text-sm transition-colors min-h-[44px] flex items-center ${
                    isActive ? 'text-cyber-neon bg-cyber-neon/5' : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {`> ${item.label}_`}
                </Link>
              )
            })}
          </div>
        </div>
      </header>
    </>
  )
}
