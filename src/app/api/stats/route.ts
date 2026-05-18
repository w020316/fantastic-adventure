import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 10 * 1000
const RATE_LIMIT_MAX = 10

function checkRateLimit(ip: string | null): boolean {
  const key = ip || 'unknown'
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

const ALLOWED_PATHS = /^\/[a-zA-Z0-9\-_/.]*$/

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body = await request.json()

    let path = typeof body.path === 'string' ? body.path.trim() : '/'
    if (!path || !ALLOWED_PATHS.test(path)) {
      path = '/'
    }
    if (path.length > 500) path = path.slice(0, 500)

    let referrer: string | null = null
    if (typeof body.referrer === 'string') {
      referrer = body.referrer.trim().slice(0, 500)
      try { if (referrer) new URL(referrer) } catch { referrer = null }
    }

    await prisma.siteStats.create({
      data: {
        path,
        ip,
        referrer,
        userAgent: (request.headers.get('user-agent') || '').slice(0, 500),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/stats error:', error)
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}

export async function GET() {
  try {
    const [totalViews, todayViews, articleCount, commentCount] = await Promise.all([
      prisma.siteStats.count(),
      prisma.siteStats.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
    ])

    return NextResponse.json({ totalViews, todayViews, articleCount, commentCount })
  } catch (error) {
    console.error('GET /api/stats error:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
