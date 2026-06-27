import type { Metadata, Viewport } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'XIAO/WU — 周末 | 在校大学生个人作品集',
    template: '%s | XIAO/WU',
  },
  description: '用代码把想法真正实现出来。在校大学生周末的个人作品集 — 独立项目展示、技术文章、全栈开发与AI应用实践。',
  keywords: ['在校大学生', '个人作品集', '周末', 'Cris', 'XIAO/WU', 'Next.js', 'React', 'TypeScript', 'Vue', 'Python', 'YOLO', '全栈开发'],
  authors: [{ name: '周末 (Cris)', url: 'https://github.com/w020316' }],
  creator: '周末 (Cris)',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'XIAO/WU',
    title: 'XIAO/WU — 周末 | 在校大学生个人作品集',
    description: '用代码把想法真正实现出来。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIAO/WU — 周末 | 在校大学生个人作品集',
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
      suppressHydrationWarning
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
        <SpeedInsights />
      </body>
    </html>
  )
}
