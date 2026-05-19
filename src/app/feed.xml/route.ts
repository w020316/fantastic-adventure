import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'https://cyberblog.top'

    const rssItems = articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/articles/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${new Date(article.publishedAt!).toUTCString()}</pubDate>
      <category>${article.category?.name ?? '未分类'}</category>
      <author>${article.author?.name ?? '匿名'}</author>
    </item>`).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CyberBlog - 赛博朋克个人博客</title>
    <link>${baseUrl}</link>
    <description>探索技术 · 记录生活 · 展示作品</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('RSS feed error:', error)
    return new NextResponse('RSS feed generation failed', { status: 500 })
  }
}
