'use client'

import Link from 'next/link'
import SectionReveal from '@/components/ui/SectionReveal'

interface ArticleItem {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
}

// 静态示例文章（后续从 API 获取）
const articles: ArticleItem[] = [
  {
    slug: 'nextjs-15-app-router',
    title: 'Next.js 15 App Router 实战：从迁移到性能优化',
    excerpt: '深入探讨 Next.js 15 App Router 的核心机制，包括 RSC、Streaming SSR、Server Actions 的最佳实践。',
    date: '2026-06-20',
    category: '前端工程',
    readTime: '12 min',
  },
  {
    slug: 'prisma-best-practices',
    title: 'Prisma ORM 最佳实践：Schema 设计与性能调优',
    excerpt: '从 Schema 建模到 N+1 查询优化，系统梳理 Prisma 在生产环境中的工程实践。',
    date: '2026-06-15',
    category: '后端架构',
    readTime: '10 min',
  },
  {
    slug: 'rag-system-design',
    title: '从零构建 RAG 系统：向量检索与 Prompt 工程',
    excerpt: '手把手搭建一个生产可用的 RAG 系统，覆盖文档切分、向量化、检索增强全流程。',
    date: '2026-06-10',
    category: 'AI 应用',
    readTime: '15 min',
  },
]

/**
 * Articles 区块 - 最新技术文章
 */
export default function ArticlesSection() {
  return (
    <section id="articles" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <p className="section-label">
            <span className="text-[#ccff00]">04</span>
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
          {articles.map((article, i) => (
            <SectionReveal key={article.slug} delay={i * 80}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block cyber-card p-6 hover:translate-x-2 transition-transform duration-300"
              >
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

                  {/* 阅读时间 + 箭头 */}
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
