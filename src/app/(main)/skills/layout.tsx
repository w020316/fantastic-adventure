import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Skills 指令集',
  description: 'Agent 可直接加载的结构化指令集 — 覆盖全栈开发、AI 应用、计算机视觉等领域的技能卡片与触发词。',
  openGraph: {
    title: 'AI Skills 指令集 | XIAO/WU',
    description: 'Agent 可直接加载的结构化指令集',
  },
}

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children
}
