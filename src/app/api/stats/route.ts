import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null

    await prisma.siteStats.create({
      data: {
        path: body.path || '/',
        ip,
        referrer: body.referrer || null,
        userAgent: request.headers.get('user-agent'),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/stats error:', error)
    return NextResponse.json({ error: '统计上报失败' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [totalViews, todayViews, articleCount, commentCount] = await Promise.all([
      prisma.siteStats.count(),
      prisma.siteStats.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
    ])

    return NextResponse.json({ totalViews, todayViews, articleCount, commentCount })
  } catch (error) {
    console.error('GET /api/stats error:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
