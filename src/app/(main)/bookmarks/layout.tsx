import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '书签',
  description: '我收藏的文章',
  openGraph: {
    title: '书签 | CyberBlog',
    description: '我收藏的文章',
  },
}

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children
}
