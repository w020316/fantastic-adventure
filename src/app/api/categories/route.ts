import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { categorySchema } from '@/lib/validations'

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

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const body = await request.json()
    const validated = categorySchema.parse(body)

    const slugExists = await prisma.category.findUnique({ where: { slug: validated.slug } })
    if (slugExists) return NextResponse.json({ error: 'Slug 已存在' }, { status: 409 })

    const category = await prisma.category.create({ data: validated })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : '创建失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
