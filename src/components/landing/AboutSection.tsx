'use client'

import SectionReveal from '@/components/ui/SectionReveal'

/**
 * About 区块 - 个人定位与理念
 */
export default function AboutSection() {
  return (
    <section id="about" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">01</span>
            ABOUT
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          {/* 左侧 - 定位语 */}
          <SectionReveal className="md:col-span-7" delay={100}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
              把<span className="text-[#ccff00]">想法</span>
              <br />
              真正<span className="text-[#ccff00]">实现</span>出来
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#888] leading-relaxed max-w-xl">
              我是一名全栈工程师，专注于将产品从概念推向落地。
              从前端交互到后端架构，从数据库设计到部署运维，
              我相信优秀的工程师不仅写代码，更要用技术解决真实问题。
            </p>
            <p className="mt-4 text-sm text-[#555] leading-relaxed max-w-xl">
              热衷于探索 AI 与 Web 的结合点，追求简洁优雅的工程实现，
              注重性能与用户体验的平衡。
            </p>
          </SectionReveal>

          {/* 右侧 - 关键数据 */}
          <SectionReveal className="md:col-span-5" delay={200}>
            <div className="grid grid-cols-2 gap-4">
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">3+</p>
                <p className="mt-1 text-xs text-[#888]">年开发经验</p>
              </div>
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">20+</p>
                <p className="mt-1 text-xs text-[#888]">完成项目</p>
              </div>
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">10万+</p>
                <p className="mt-1 text-xs text-[#888]">用户触达</p>
              </div>
              <div className="cyber-card p-5">
                <p className="font-display text-3xl font-bold text-[#ccff00]">99.9%</p>
                <p className="mt-1 text-xs text-[#888]">服务可用性</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
