import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '阅读历史',
  description: '我最近阅读的文章',
  openGraph: {
    title: '阅读历史 | CyberBlog',
    description: '我最近阅读的文章',
  },
}

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
