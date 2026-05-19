import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '文章',
  description: '浏览所有技术文章、生活随笔和作品展示',
  openGraph: {
    title: '文章 | CyberBlog',
    description: '浏览所有技术文章、生活随笔和作品展示',
  },
}

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children
}
