'use client'

import SectionReveal from '@/components/ui/SectionReveal'
import TiltCard from '@/components/ui/TiltCard'

interface Capability {
  id: string
  title: string
  description: string
  skills: string[]
  icon: React.ReactNode
}

const capabilities: Capability[] = [
  {
    id: 'frontend',
    title: '前端工程',
    description: '构建高性能、可访问、体验流畅的现代 Web 界面，注重交互细节与动画质感。',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7l3-3 3 3v10M9 17H5a2 2 0 01-2-2V7a2 2 0 012-2h4M9 17h6m0 0h4a2 2 0 002-2V7a2 2 0 00-2-2h-4m-6 0V5a2 2 0 012-2h2a2 2 0 012 2v0" />
      </svg>
    ),
  },
  {
    id: 'backend',
    title: '后端架构',
    description: '设计可扩展的服务端架构，处理高并发场景，保障数据一致性与服务稳定性。',
    skills: ['Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'RESTful API'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
      </svg>
    ),
  },
  {
    id: 'ai',
    title: 'AI 应用',
    description: '将大模型能力融入产品，构建智能交互体验，从 Prompt 工程到 RAG 系统落地。',
    skills: ['LLM', 'RAG', 'Prompt Engineering', 'Vector DB', 'AI Agent'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'devops',
    title: '工程化与部署',
    description: '搭建 CI/CD 流水线，容器化部署，监控告警，保障产品从开发到上线的全链路质量。',
    skills: ['Docker', 'GitHub Actions', 'Vercel', 'Nginx', 'Linux'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 9h-6L8 4z" />
      </svg>
    ),
  },
]

/**
 * Capability 区块 - 3D Tilt 能力卡片
 */
export default function CapabilitySection() {
  return (
    <section id="capability" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">02</span>
            CAPABILITY
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12">
            我能做什么
          </h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap, i) => (
            <SectionReveal key={cap.id} delay={i * 100}>
              <TiltCard
                className="cyber-card p-6 h-full relative"
                maxTilt={6}
              >
                <div style={{ transform: 'translateZ(40px)' }} className="relative">
                  {/* 图标 */}
                  <div className="w-12 h-12 flex items-center justify-center text-[#ccff00] mb-4">
                    {cap.icon}
                  </div>

                  {/* 标题 */}
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    {cap.title}
                  </h3>

                  {/* 描述 */}
                  <p className="text-xs text-[#888] leading-relaxed mb-4 min-h-[3rem]">
                    {cap.description}
                  </p>

                  {/* 技能标签 */}
                  <div className="flex flex-wrap gap-1.5">
                    {cap.skills.map((skill) => (
                      <span key={skill} className="tag text-[10px] px-2 py-0.5">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* 序号 */}
                  <span className="absolute top-0 right-0 font-mono text-xs text-[#333]">
                    0{i + 1}
                  </span>
                </div>
              </TiltCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
