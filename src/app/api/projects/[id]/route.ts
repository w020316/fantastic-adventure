import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { projectSchema } from '@/lib/validations'

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
    const validated = projectSchema.partial().parse(body)

    const project = await prisma.project.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json({ project })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('PATCH /api/projects/[id] error:', error)
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 })
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
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ message: '项目已删除' })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 })
  }
}
