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
  title: 'CyberBlog - 赛博朋克个人博客',
  description: '一个赛博朋克风格的全栈个人博客系统，技术文章 + 生活随笔 + 作品展示',
  keywords: ['博客', '赛博朋克', '全栈开发', 'Next.js', 'React'],
  authors: [{ name: 'CyberBlog' }],
  openGraph: {
    title: 'CyberBlog',
    description: '赛博朋克风格个人博客',
    type: 'website',
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
        <div className="grid-bg min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
