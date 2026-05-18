'use client'

import Link from 'next/link'
import { useState } from 'react'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/articles', label: '文章' },
  { href: '/projects', label: '作品集' },
  { href: '/about', label: '关于' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-cyber-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold neon-text tracking-wider">
          CYBERBLOG
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-sm text-cyber-text-dim hover:text-cyber-neon transition-colors relative group"
            >
              {`> ${item.label}_`}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyber-neon group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden text-cyber-neon p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
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

      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-cyber-border">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 font-mono text-sm text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {`> ${item.label}_`}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
