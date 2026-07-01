import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// ============ PATCH：更新心情 ============
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const { id } = await params
    const body = await request.json()
    const { key, name, icon, color, description, order } = body

    const mood = await prisma.mood.update({
      where: { id },
      data: {
        ...(key !== undefined && { key: String(key) }),
        ...(name !== undefined && { name: String(name) }),
        ...(icon !== undefined && { icon: String(icon) }),
        ...(color !== undefined && { color: String(color) }),
        ...(description !== undefined && { description: description ? String(description) : null }),
        ...(order !== undefined && { order: Number(order) || 0 }),
      },
    })

    return NextResponse.json({ mood })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ error: `更新失败：${msg}` }, { status: 500 })
  }
}

// ============ DELETE：删除心情 ============
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const { id } = await params
    await prisma.mood.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ error: `删除失败：${msg}` }, { status: 500 })
  }
}
