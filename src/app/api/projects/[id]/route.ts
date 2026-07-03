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

    if (id === 'geren-riji') {
      return NextResponse.json({
        project: {
          id: 'geren-riji',
          title: '心语日记 - 多智能体AI日记助手',
          description: '基于多智能体协作的AI日记应用，通过情绪感知器、记忆管家、日记生成器和对话精灵四个智能体协同工作，实现情绪识别、记忆管理、个性化日记生成和温暖对话。支持SSE实时进度推送、ChromaDB向量记忆、在线体验版等功能。',
          coverImage: null,
          demoUrl: 'https://w020316.github.io/geren-riji/',
          repoUrl: 'https://github.com/w020316/geren-riji',
          techStack: ['Python', 'FastAPI', 'DeepSeek API', 'ChromaDB', 'BGE嵌入模型', 'SSE', 'JavaScript', 'localStorage'],
          featured: true,
          order: 0,
        },
      })
    }

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
        ...(validated.subtitle !== undefined && { subtitle: validated.subtitle || null }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.impact !== undefined && { impact: validated.impact || null }),
        ...(validated.metrics !== undefined && { metrics: validated.metrics ?? null }),
        ...(validated.coverImage !== undefined && { coverImage: validated.coverImage || null }),
        ...(validated.demoUrl !== undefined && { demoUrl: validated.demoUrl || null }),
        ...(validated.repoUrl !== undefined && { repoUrl: validated.repoUrl || null }),
        ...(validated.caseStudyUrl !== undefined && { caseStudyUrl: validated.caseStudyUrl || null }),
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
