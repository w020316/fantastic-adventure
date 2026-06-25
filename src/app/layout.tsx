import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'XIAO/WU — 周末 | 全栈工程师个人作品集',
    template: '%s | XIAO/WU',
  },
  description: '用代码把想法真正实现出来。全栈工程师周末的个人数字品牌作品集 — 项目展示、技术文章、能力与经验。',
  keywords: ['全栈工程师', '个人作品集', '周末', 'Cris', 'XIAO/WU', 'Next.js', 'React', 'TypeScript', '全栈开发'],
  authors: [{ name: '周末 (Cris)', url: 'https://github.com/w020316' }],
  creator: '周末 (Cris)',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'XIAO/WU',
    title: 'XIAO/WU — 周末 | 全栈工程师个人作品集',
    description: '用代码把想法真正实现出来。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIAO/WU — 周末 | 全栈工程师个人作品集',
    description: '用代码把想法真正实现出来。',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'XIAO/WU',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ccff00',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh-CN"
      className="dark"
      style={{
        '--font-inter': 'system-ui, sans-serif',
        '--font-space-grotesk': 'system-ui, sans-serif',
        '--font-jetbrains-mono': 'ui-monospace, monospace',
      } as React.CSSProperties}
    >
      <body className="font-body antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
