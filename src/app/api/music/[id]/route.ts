import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// ============ PATCH：更新曲目 ============
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const { id } = await params
    const body = await request.json()
    const { title, artist, category, region, duration, url, cover, album, mood, isHot, source, playable, order } = body

    const track = await prisma.musicTrack.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title) }),
        ...(artist !== undefined && { artist: String(artist) }),
        ...(category !== undefined && { category: String(category) }),
        ...(region !== undefined && { region: String(region) }),
        ...(duration !== undefined && { duration: Number(duration) || 0 }),
        ...(url !== undefined && { url: String(url) }),
        ...(cover !== undefined && { cover: String(cover) }),
        ...(album !== undefined && { album: album ? String(album) : null }),
        ...(mood !== undefined && { mood: mood ? String(mood) : null }),
        ...(isHot !== undefined && { isHot: Boolean(isHot) }),
        ...(source !== undefined && { source: String(source) }),
        ...(playable !== undefined && { playable: Boolean(playable) }),
        ...(order !== undefined && { order: Number(order) || 0 }),
      },
    })

    return NextResponse.json({ track })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ error: `更新失败：${msg}` }, { status: 500 })
  }
}

// ============ DELETE：删除曲目 ============
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const { id } = await params
    await prisma.musicTrack.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ error: `删除失败：${msg}` }, { status: 500 })
  }
}
