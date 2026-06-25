'use client'

import { useState, useEffect } from 'react'

interface Skill {
  id: string
  name: string
  englishName: string
  icon: string
  oneLiner: string
  tags: string[]
  description: string
  features: string[]
  triggerWords: string[]
  platform: string
  repoUrl: string
}

function SkillCard({ skill, index, expanded, onToggle }: { skill: Skill; index: number; expanded: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="cyber-card group flex flex-col overflow-hidden relative cursor-pointer"
      style={{
        animation: `fadeInUp 0.5s ease ${index * 0.08}s forwards`,
        opacity: 0,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        boxShadow: hovered ? '0 0 20px rgba(0, 255, 159, 0.1), 0 0 40px rgba(0, 255, 159, 0.05)' : undefined,
        borderColor: hovered ? 'rgba(0, 255, 159, 0.4)' : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
    >
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <div
            className="absolute left-0 right-0 h-[2px] opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, #00ff9f, transparent)',
              animation: 'scanLine 1.5s linear infinite',
              top: '0%',
            }}
          />
        </div>
      )}
      <div className="h-1.5 w-full bg-gradient-to-r from-cyber-neon via-cyber-blue to-cyber-pink" />
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl flex-shrink-0">{skill.icon}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base sm:text-lg font-bold text-cyber-text group-hover:text-cyber-neon transition-colors line-clamp-1">
              {skill.name}
            </h3>
            <span className="font-mono text-[10px] text-cyber-text-dim tracking-wider uppercase">
              {skill.englishName}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-cyber-text-dim transition-transform duration-300 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <p className="text-cyber-text-dim text-xs sm:text-sm leading-relaxed mb-4 flex-1">
          {skill.oneLiner}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {skill.tags.map((tag) => (
            <span key={tag} className="cyber-tag text-[10px]">
              {tag}
            </span>
          ))}
        </div>

        {expanded && (
          <div className="border-t border-cyber-border pt-4 space-y-4" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
            <div>
              <span className="font-mono text-[10px] text-cyber-blue tracking-wider uppercase block mb-2">
                {'// 详细描述'}
              </span>
              <p className="text-cyber-text-dim text-xs sm:text-sm leading-relaxed">
                {skill.description}
              </p>
            </div>

            <div>
              <span className="font-mono text-[10px] text-cyber-neon tracking-wider uppercase block mb-2">
                {'// 核心功能'}
              </span>
              <ul className="space-y-1.5">
                {skill.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-cyber-text-dim">
                    <span className="text-cyber-neon mt-0.5 flex-shrink-0">▸</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-mono text-[10px] text-cyber-pink tracking-wider uppercase block mb-2">
                {'// 触发词'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skill.triggerWords.map((word) => (
                  <span key={word} className="cyber-tag cyber-tag-pink text-[10px]">
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-cyber-border">
              <span className="font-mono text-[10px] text-cyber-text-dim">
                🖥 {skill.platform}
              </span>
              <a
                href={skill.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button text-xs flex items-center gap-1.5 ml-auto"
                style={{ borderColor: 'var(--color-cyber-neon)', color: 'var(--color-cyber-neon)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                查看源码
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SkillsSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-pink/3 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyber-pink/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-pink/60 border border-cyber-pink/20 px-3 py-1 rounded-sm">
              AGENT_SKILLS.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            AI <span className="neon-text-pink">Skills</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider">
            {'// Agent 可直接加载的结构化指令集'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="cyber-card overflow-hidden">
              <div className="h-1.5 w-full bg-cyber-border/30 animate-pulse" />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="flex-1">
                    <div className="h-5 w-1/3 bg-cyber-border/30 animate-pulse rounded mb-1" />
                    <div className="h-3 w-1/4 bg-cyber-border/30 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-cyber-border/30 animate-pulse rounded mb-2" />
                <div className="h-3 w-2/3 bg-cyber-border/30 animate-pulse rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-5 w-14 bg-cyber-border/30 animate-pulse rounded" />
                  <div className="h-5 w-10 bg-cyber-border/30 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/skills')
        if (!res.ok) throw new Error('Failed to fetch skills')
        const data = await res.json()
        setSkills(data.skills || [])
      } catch {
        setSkills([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <SkillsSkeleton />
  }

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>

      <section className="relative border-b border-cyber-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-pink/3 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyber-pink/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6">
            <span className="inline-block font-mono text-xs tracking-[0.3em] text-cyber-pink/60 border border-cyber-pink/20 px-3 py-1 rounded-sm">
              AGENT_SKILLS.MODE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-text mb-3">
            AI <span className="neon-text-pink">Skills</span>
          </h1>
          <p className="font-mono text-cyber-text-dim text-sm tracking-wider mb-6">
            {'// Agent 可直接加载的结构化指令集，遵循 Agent Skills 开放标准'}
          </p>
          <a
            href="https://github.com/KKKKhazix/khazix-skills"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-cyber-border rounded-sm font-mono text-xs text-cyber-text-dim hover:text-cyber-pink hover:border-cyber-pink/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Khazix Skills
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {skills.map((skill, i) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={i}
              expanded={expandedId === skill.id}
              onToggle={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-cyber-border">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="section-title">
            <span className="neon-text-pink">▸</span> 兼容平台
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Claude Code', color: '#ff0080' },
              { name: 'Codex CLI', color: '#00ff9f' },
              { name: 'OpenCode', color: '#00d4ff' },
              { name: 'OpenClaw', color: '#8b5cf6' },
              { name: 'Cursor', color: '#ffe600' },
              { name: 'Gemini CLI', color: '#00d4ff' },
            ].map((platform) => (
              <div key={platform.name} className="cyber-card p-4 text-center group">
                <div className="font-display text-sm font-bold mb-1 transition-colors" style={{ color: platform.color }}>
                  {platform.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
