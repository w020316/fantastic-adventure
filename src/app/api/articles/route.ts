import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { articleSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') === 'likes' ? 'likes' : 'publishedAt'

    const where: Record<string, unknown> = { status: 'PUBLISHED' }

    if (category) {
      where.category = { slug: category }
    }
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { comments: { where: { status: 'APPROVED' } } } },
        },
        orderBy: { [sort]: sort === 'likes' ? 'desc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      articles: articles.map((a) => ({
        ...a,
        tags: a.tags.map((at) => at.tag),
        commentCount: a._count.comments,
        _count: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('GET /api/articles error:', error)
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const body = await request.json()
    const validated = articleSchema.parse(body)

    const article = await prisma.article.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt || null,
        content: validated.content,
        coverImage: validated.coverImage || null,
        status: validated.status,
        categoryId: validated.categoryId || null,
        authorId: (session.user as { id: string }).id,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
        tags: validated.tagIds
          ? { create: validated.tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('POST /api/articles error:', error)
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 })
  }
}
