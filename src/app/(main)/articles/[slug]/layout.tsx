import type { Metadata } from 'next'

// 动态文章详情页的静态 metadata（数据库不可靠时不使用 generateMetadata）
export const metadata: Metadata = {
  title: '文章阅读',
  description: '技术文章与编程实践分享 — 涵盖 Next.js、React、AI 应用、全栈开发等主题。',
  openGraph: {
    title: '文章阅读 | XIAO/WU',
    description: '技术文章与编程实践分享',
  },
}

export default function ArticleDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
