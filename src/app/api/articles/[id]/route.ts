import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { articleSchema } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const articleInclude = {
      author: { select: { id: true, name: true } },
      category: true,
      tags: { include: { tag: true } },
      comments: {
        where: { status: 'APPROVED', parentId: null },
        include: {
          replies: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    } as const

    let article = await prisma.article.findUnique({
      where: { id },
      include: articleInclude,
    })

    if (!article) {
      article = await prisma.article.findUnique({
        where: { slug: id },
        include: articleInclude,
      })
    }

    if (!article) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 })
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      ...article,
      tags: article.tags.map((at) => at.tag),
    })
  } catch (error) {
    console.error('GET /api/articles/[id] error:', error)
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const body = await request.json()
    const validated = articleSchema.partial().parse(body)

    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 })
    }

    if (validated.tagIds) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } })
      await prisma.articleTag.createMany({
        data: validated.tagIds.map((tagId: string) => ({ articleId: id, tagId })),
      })
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.slug && { slug: validated.slug }),
        ...(validated.excerpt !== undefined && { excerpt: validated.excerpt || null }),
        ...(validated.content && { content: validated.content }),
        ...(validated.coverImage !== undefined && { coverImage: validated.coverImage || null }),
        ...(validated.status && {
          status: validated.status,
          publishedAt: validated.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
        }),
        ...(validated.categoryId !== undefined && { categoryId: validated.categoryId || null }),
      },
      include: { category: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json({ article })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('PATCH /api/articles/[id] error:', error)
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 })
    }

    await prisma.article.delete({ where: { id } })
    return NextResponse.json({ message: '文章已删除' })
  } catch (error) {
    console.error('DELETE /api/articles/[id] error:', error)
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 })
  }
}
