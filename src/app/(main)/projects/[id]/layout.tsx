import type { Metadata } from 'next'

// 动态项目详情页的静态 metadata（数据库不可靠时不使用 generateMetadata）
export const metadata: Metadata = {
  title: '项目详情',
  description: '查看项目的技术栈、实现思路与在线体验链接。',
  openGraph: {
    title: '项目详情 | XIAO/WU',
    description: '查看项目的技术栈、实现思路与在线体验链接',
  },
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
