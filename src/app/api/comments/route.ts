import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { commentSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    const status = searchParams.get('status')

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user && (session.user as { role?: string }).role === 'ADMIN'

    const where: Record<string, unknown> = {}
    if (articleId) where.articleId = articleId
    if (status && isAdmin) where.status = status
    if (!isAdmin) where.status = 'APPROVED'

    const comments = await prisma.comment.findMany({
      where,
      include: {
        replies: {
          where: !isAdmin ? { status: 'APPROVED' } : undefined,
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('GET /api/comments error:', error)
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content: validated.content,
        nickname: validated.nickname,
        email: validated.email || null,
        articleId: validated.articleId,
        parentId: validated.parentId || null,
        ip: request.headers.get('x-forwarded-for') || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('POST /api/comments error:', error)
    return NextResponse.json({ error: '提交评论失败' }, { status: 500 })
  }
}
