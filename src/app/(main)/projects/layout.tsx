import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '作品集',
  description: '个人项目展示和开源作品',
  openGraph: {
    title: '作品集 | CyberBlog',
    description: '个人项目展示和开源作品',
  },
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
