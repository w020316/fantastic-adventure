import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CyberBlog - 赛博朋克个人博客',
    template: '%s | CyberBlog',
  },
  description: '一个赛博朋克风格的全栈个人博客系统，技术文章 + 生活随笔 + 作品展示',
  keywords: ['博客', '赛博朋克', '全栈开发', 'Next.js', 'React', 'TypeScript', 'Prisma'],
  authors: [{ name: 'CyberBlog', url: 'https://github.com/w020316' }],
  creator: 'CyberBlog',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'CyberBlog',
    title: 'CyberBlog - 赛博朋克个人博客',
    description: '探索技术 · 记录生活 · 展示作品',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CyberBlog - 赛博朋克个人博客',
    description: '探索技术 · 记录生活 · 展示作品',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} font-body antialiased`}>
        <div className="min-h-screen md:grid-bg">
          {children}
        </div>
      </body>
    </html>
  )
}
