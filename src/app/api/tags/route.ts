import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { articles: { where: { article: { status: 'PUBLISHED' } } } } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      tags: tags.map((t) => ({
        ...t,
        count: t._count.articles,
        _count: undefined,
      })),
    })
  } catch (error) {
    console.error('GET /api/tags error:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}
