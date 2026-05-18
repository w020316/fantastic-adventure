import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    const existing = await prisma.siteStats.findFirst({
      where: { path: `/api/articles/${id}/like`, ip, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    })

    if (existing) {
      return NextResponse.json({ error: '今天已经点过赞了' }, { status: 429 })
    }

    const article = await prisma.article.update({
      where: { id },
      data: { likes: { increment: 1 } },
    })

    await prisma.siteStats.create({
      data: { path: `/api/articles/${id}/like`, ip },
    })

    return NextResponse.json({ likes: article.likes })
  } catch (error) {
    console.error('POST /api/articles/[id]/like error:', error)
    return NextResponse.json({ error: '点赞失败' }, { status: 500 })
  }
}
