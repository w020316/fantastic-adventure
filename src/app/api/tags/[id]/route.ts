import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { tagSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const body = await request.json()
    const validated = tagSchema.partial().parse(body)

    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '标签不存在' }, { status: 404 })

    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.tag.findUnique({ where: { slug: validated.slug } })
      if (slugExists) return NextResponse.json({ error: 'Slug 已存在' }, { status: 409 })
    }

    const tag = await prisma.tag.update({ where: { id }, data: validated })
    return NextResponse.json({ tag })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: '数据验证失败', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : '更新失败'
    return NextResponse.json({ error: message }, { status: 500 })
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
    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '标签不存在' }, { status: 404 })

    await prisma.articleTag.deleteMany({ where: { tagId: id } })
    await prisma.tag.delete({ where: { id } })
    return NextResponse.json({ message: '标签已删除' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '删除失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
