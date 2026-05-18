import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({ where: { id } })

    if (!project) {
      return NextResponse.json({ error: '项目未找到' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
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
    const validated = projectSchema.partial().parse(body)

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: '项目未找到' }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.coverImage !== undefined && { coverImage: validated.coverImage || null }),
        ...(validated.demoUrl !== undefined && { demoUrl: validated.demoUrl || null }),
        ...(validated.repoUrl !== undefined && { repoUrl: validated.repoUrl || null }),
        ...(validated.techStack !== undefined && { techStack: validated.techStack }),
        ...(validated.featured !== undefined && { featured: validated.featured }),
        ...(validated.order !== undefined && { order: validated.order }),
      },
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
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: '项目未找到' }, { status: 404 })
    }

    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ message: '项目已删除' })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 })
  }
}
