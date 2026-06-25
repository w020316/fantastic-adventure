'use client'

const stats = [
  { value: '3+', label: '年经验', hint: '全栈开发' },
  { value: '20+', label: '项目', hint: '已交付' },
  { value: '10万+', label: '用户触达', hint: '累计' },
  { value: '99.9%', label: '可用性', hint: '生产服务' },
]

const capabilities = [
  {
    title: '前端',
    desc: '以 Next.js / React 为核心，构建高性能、可访问、视觉精致的产品界面。',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    title: '后端',
    desc: '基于 Node.js 与 Prisma 设计可靠的 API 与数据模型，覆盖鉴权、缓存与任务队列。',
    skills: ['Node.js', 'Prisma', 'PostgreSQL', 'NextAuth', 'Redis'],
  },
  {
    title: 'AI',
    desc: '围绕 LLM 与 RAG 构建可落地的智能应用，关注检索质量与上下文工程。',
    skills: ['LangChain', 'RAG', 'Embedding', 'Prompt Engineering', 'OpenAI API'],
  },
  {
    title: 'DevOps',
    desc: '从 CI/CD 到容器化部署，保障服务稳定上线与持续迭代。',
    skills: ['Docker', 'GitHub Actions', 'Vercel', 'Nginx', 'Linux'],
  },
]

const timeline = [
  { year: '2023', title: '开始全栈开发之旅', desc: '系统学习前端与后端体系，独立交付第一个全栈应用。' },
  { year: '2024', title: '深入 AI 应用开发', desc: '构建 RAG 系统，探索 LLM 在业务场景中的落地。' },
  { year: '2025', title: '开源个人作品集引擎', desc: '将个人品牌站点沉淀为可复用的作品集引擎并开源。' },
  { year: '2026', title: '持续探索 AI 与 Web 的结合', desc: '聚焦智能体与 Web 体验的融合，打磨可用的产品。' },
]

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/w020316',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:hello@xiao-wu.dev',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border-subtle)] grid-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-[var(--color-brand-dim)] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div style={{ animation: 'fadeInUp 0.6s ease forwards', opacity: 0 }}>
            <span className="section-label !mb-4">
              <span className="neon-text">●</span> ABOUT
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">
              关于<span className="neon-text">我</span>
            </h1>
            <p className="font-mono text-sm sm:text-base text-[var(--color-text-secondary)] tracking-wider">
              全栈工程师 · 周末（Cris）
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        {/* 价值主张 */}
        <section
          className="cyber-card p-8 sm:p-12 relative overflow-hidden"
          style={{ animation: 'fadeInUp 0.6s ease 0.1s forwards', opacity: 0 }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[var(--color-brand-glow)] rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <span className="tag tag-brand mb-5">VALUE PROPOSITION</span>
            <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-[var(--color-text-primary)]">
              把前沿技术变成<span className="neon-text">简洁、优雅、可落地</span>的解决方案。
            </p>
            <p className="mt-5 text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
              我是周末（Cris），一名全栈工程师。专注用工程化的方式把想法真正实现出来——从前端体验、后端服务到 AI 能力，端到端交付可靠的产品。
            </p>
          </div>
        </section>

        {/* 数据卡片 */}
        <section style={{ animation: 'fadeInUp 0.6s ease 0.15s forwards', opacity: 0 }}>
          <span className="section-label">
            <span className="neon-text">▸</span> BY THE NUMBERS
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="cyber-card p-6">
                <div className="font-display text-3xl sm:text-4xl font-bold neon-text mb-2">
                  {s.value}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-primary)]">{s.label}</div>
                <div className="font-mono text-xs text-[var(--color-text-tertiary)] mt-1">{s.hint}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 能力 */}
        <section style={{ animation: 'fadeInUp 0.6s ease 0.2s forwards', opacity: 0 }}>
          <span className="section-label">
            <span className="neon-text">▸</span> CAPABILITIES
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {capabilities.map((c, idx) => (
              <div key={c.title} className="cyber-card p-6 sm:p-7">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">{c.title}</h3>
                  <span className="font-mono text-xs text-[var(--color-text-tertiary)] tracking-widest">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {c.skills.map((skill) => (
                    <span key={skill} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 时间轴 */}
        <section style={{ animation: 'fadeInUp 0.6s ease 0.25s forwards', opacity: 0 }}>
          <span className="section-label">
            <span className="neon-text">▸</span> TIMELINE
          </span>
          <div className="cyber-card p-6 sm:p-8">
            <div className="relative pl-8">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-border-default)]" />
              <div className="space-y-8">
                {timeline.map((item) => (
                  <div key={item.year} className="relative">
                    <span className="absolute -left-[1.95rem] top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--color-brand)] ring-4 ring-[var(--color-bg-primary)] shadow-[0_0_12px_var(--color-brand-glow)]" />
                    <div className="font-mono text-xs neon-text tracking-widest mb-1">{item.year}</div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 社交链接 */}
        <section style={{ animation: 'fadeInUp 0.6s ease 0.3s forwards', opacity: 0 }}>
          <span className="section-label">
            <span className="neon-text">▸</span> GET IN TOUCH
          </span>
          <div className="flex flex-wrap gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="btn-outline"
              >
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
