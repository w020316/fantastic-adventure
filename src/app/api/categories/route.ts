import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      categories: categories.map((c) => ({
        ...c,
        count: c._count.articles,
        _count: undefined,
      })),
    })
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
  }
}
