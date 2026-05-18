import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { articleSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
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
      },
    })

    if (!article) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 })
    }

    await prisma.article.update({
      where: { id },
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
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

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
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { id } = await params
    await prisma.article.delete({ where: { id } })
    return NextResponse.json({ message: '文章已删除' })
  } catch (error) {
    console.error('DELETE /api/articles/[id] error:', error)
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 })
  }
}
