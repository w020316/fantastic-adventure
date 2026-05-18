import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { projectSchema } from '@/lib/validations'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const body = await request.json()
    const validated = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        title: validated.title,
        description: validated.description,
        coverImage: validated.coverImage || null,
        demoUrl: validated.demoUrl || null,
        repoUrl: validated.repoUrl || null,
        techStack: validated.techStack,
        featured: validated.featured ?? false,
        order: validated.order ?? 0,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 })
  }
}
