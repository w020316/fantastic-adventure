'use client'

import Link from 'next/link'
import Image from 'next/image'
import SectionReveal from '@/components/ui/SectionReveal'

interface ArticleItem {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  coverImage?: string | null
}

// Fallback 数据：当数据库无数据时使用
// 使用 prisma/seed.ts 中真实存在的 slug，避免点击 404
const fallbackArticles: ArticleItem[] = [
  {
    slug: 'nextjs-16-features',
    title: 'Next.js 16 新特性深度解析',
    excerpt: '探索 Next.js 16 带来的革命性变化，包括 Turbopack 稳定版、改进的 App Router 和全新的服务端组件模式。',
    date: '2026-06-28',
    category: '技术',
    readTime: '256 次阅读',
  },
  {
    slug: 'cyberpunk-ui-guide',
    title: '赛博朋克 UI 设计指南',
    excerpt: '从霓虹灯效到故障艺术，从玻璃拟态到扫描线，全面解析赛博朋克风格 UI 的设计原则与实现技巧。',
    date: '2026-06-20',
    category: '技术',
    readTime: '189 次阅读',
  },
  {
    slug: 'my-2026-coding-journey',
    title: '我的 2026 编程之旅',
    excerpt: '从 Vue 到 React，从 Monorepo 到 Next.js 全栈，记录我在 2026 年的技术成长与思考。',
    date: '2026-06-15',
    category: '生活',
    readTime: '134 次阅读',
  },
]

interface ArticlesSectionProps {
  articles?: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    category: { name: string; slug: string } | null
    tags: Array<{ name: string; slug: string }>
    publishedAt: string | null
    views: number
  }>
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: string | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Articles 区块 - 最新技术文章
 * 优先使用数据库文章数据，无数据时使用 fallback
 */
export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  let displayArticles: ArticleItem[] = fallbackArticles

  if (articles && articles.length > 0) {
    displayArticles = articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt ?? '',
      date: formatDate(a.publishedAt),
      category: a.category?.name ?? '未分类',
      readTime: `${a.views} 次阅读`,
      coverImage: a.coverImage,
    }))
  }

  return (
    <section id="articles" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">05</span>
            ARTICLES
          </p>
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              最新文章
            </h2>
            <Link
              href="/articles"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-[#888] hover:text-[#ccff00] transition-colors"
            >
              全部文章
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </SectionReveal>

        <div className="space-y-4">
          {displayArticles.map((article, i) => (
            <SectionReveal key={article.slug} delay={i * 80}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block cyber-card hover:translate-x-2 transition-transform duration-300"
              >
                {/* 封面图 / 渐变占位背景 */}
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    width={400}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f3460] relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(204,255,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.12) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />
                    <span className="absolute bottom-2 right-3 font-mono text-[10px] text-[#ccff00]/40 tracking-wider">
                      CYBER//BLOG
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* 日期 */}
                    <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:min-w-[100px]">
                      <span className="font-mono text-xs text-[#555]">{article.date}</span>
                      <span className="tag-brand text-[10px]">{article.category}</span>
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold text-white group-hover:text-[#ccff00] transition-colors mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#888] leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* 阅读量 + 箭头 */}
                    <div className="flex items-center gap-3 sm:ml-4">
                      <span className="font-mono text-xs text-[#555]">{article.readTime}</span>
                      <svg
                        className="w-5 h-5 text-[#555] group-hover:text-[#ccff00] transition-all transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>

        {/* 移动端查看更多 */}
        <SectionReveal delay={300}>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/articles" className="btn-outline">
              查看全部文章
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
