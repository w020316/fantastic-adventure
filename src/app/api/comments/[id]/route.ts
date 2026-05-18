import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

    const comment = await prisma.comment.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('PATCH /api/comments/[id] error:', error)
    return NextResponse.json({ error: '更新评论失败' }, { status: 500 })
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
    await prisma.comment.delete({ where: { id } })
    return NextResponse.json({ message: '评论已删除' })
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error)
    return NextResponse.json({ error: '删除评论失败' }, { status: 500 })
  }
}
