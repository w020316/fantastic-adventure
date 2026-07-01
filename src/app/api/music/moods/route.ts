import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// 默认心情配置（数据库不可用时 fallback，与 /api/music 保持一致）
const FALLBACK_MOODS = [
  { key: 'happy', name: '开心', icon: '😊', color: '#ffe600', description: '欢快明亮，让心情飞扬', order: 1 },
  { key: 'relaxed', name: '放松', icon: '🌿', color: '#00ff9f', description: '舒缓悠扬，身心舒展', order: 2 },
  { key: 'sad', name: '伤感', icon: '🌧', color: '#00d4ff', description: '低吟浅唱，治愈心灵', order: 3 },
  { key: 'energetic', name: '激情', icon: '⚡', color: '#ff0080', description: '热血澎湃，能量满满', order: 4 },
  { key: 'focused', name: '专注', icon: '🎯', color: '#ccff00', description: '深度聚焦，心流状态', order: 5 },
  { key: 'passionate', name: '浪漫', icon: '💜', color: '#a855f7', description: '温柔缱绻，情意绵绵', order: 6 },
]

// ============ GET：获取所有心情（公开，数据库不可用时 fallback）============
export async function GET() {
  try {
    const moods = await prisma.mood.findMany({ orderBy: { order: 'asc' } })
    if (moods.length === 0) {
      return NextResponse.json({ moods: FALLBACK_MOODS, source: 'fallback' })
    }
    return NextResponse.json({ moods, source: 'db' })
  } catch {
    // 数据库连接失败时返回默认心情，保证前端可用
    return NextResponse.json({ moods: FALLBACK_MOODS, source: 'fallback' })
  }
}

// ============ POST：新增心情（管理）============
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const body = await request.json()
    const { key, name, icon, color, description, order } = body

    if (!key || !name) {
      return NextResponse.json({ error: 'key 和 name 为必填项' }, { status: 400 })
    }

    const mood = await prisma.mood.create({
      data: {
        key: String(key),
        name: String(name),
        icon: String(icon || '♪'),
        color: String(color || '#00ff9f'),
        description: description ? String(description) : null,
        order: Number(order) || 0,
      },
    })

    return NextResponse.json({ mood })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ error: `创建失败：${msg}` }, { status: 500 })
  }
}
