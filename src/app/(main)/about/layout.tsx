import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于',
  description: '关于 CyberBlog 和作者的信息',
  openGraph: {
    title: '关于 | CyberBlog',
    description: '关于 CyberBlog 和作者的信息',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
