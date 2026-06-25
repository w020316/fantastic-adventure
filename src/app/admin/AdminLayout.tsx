'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { label: '仪表盘', href: '/admin', icon: '◈' },
  { label: '文章管理', href: '/admin/articles', icon: '▤' },
  { label: '分类标签', href: '/admin/categories', icon: '🏷' },
  { label: '评论审核', href: '/admin/comments', icon: '◈' },
  { label: '项目管理', href: '/admin/projects', icon: '◆' },
  { label: '联系消息', href: '/admin/messages', icon: '✉' },
  { label: '站点资料', href: '/admin/profile', icon: '👤' },
  { label: '系统设置', href: '/admin/settings', icon: '⚙️' },
]

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
    if (status === 'authenticated' && (session?.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [status, session, router])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-xl neon-text mb-2">LOADING</div>
          <div className="font-mono text-xs text-cyber-text-dim">{'// 验证身份...'}</div>
        </div>
      </div>
    )
  }

  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-cyber-surface border-r border-cyber-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-cyber-border">
          <h1 className="font-display text-lg font-bold neon-text">XIAO/WU</h1>
          <p className="font-mono text-xs text-cyber-text-dim mt-1">{'// 管理后台'}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition-colors ${
                isActive(pathname, item.href)
                  ? 'bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/20'
                  : 'text-cyber-text-dim hover:text-cyber-neon hover:bg-cyber-neon/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-cyber-border">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-sm bg-cyber-neon/10 border border-cyber-neon/30 flex items-center justify-center">
              <span className="font-display text-xs neon-text">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-cyber-text truncate">{session.user?.name}</div>
              <div className="font-mono text-[10px] text-cyber-text-dim truncate">{session.user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full cyber-button text-xs py-2"
            style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-cyber-bg/90 backdrop-blur-sm border-b border-cyber-border px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 border border-cyber-border rounded text-cyber-text-dim hover:text-cyber-neon hover:border-cyber-neon transition-colors"
              aria-label="菜单"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <h2 className="font-display text-sm font-bold text-cyber-text">
                {navItems.find((item) => isActive(pathname, item.href))?.label ?? '管理后台'}
              </h2>
              <p className="font-mono text-[10px] text-cyber-text-dim">{'// ' + (navItems.find((item) => isActive(pathname, item.href))?.label ?? '管理后台')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="cyber-tag cyber-tag-green text-[10px]">ONLINE</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
