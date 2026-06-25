import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取站点资料
export async function GET() {
  try {
    const profile = await prisma.siteProfile.findUnique({
      where: { id: 'main' },
    })

    if (!profile) {
      // 如果不存在，创建默认记录
      const created = await prisma.siteProfile.create({
        data: { id: 'main' },
      })
      return NextResponse.json(created)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('获取站点资料失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 更新站点资料
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // 白名单字段
    const allowedFields = [
      'brandName', 'authorNameCn', 'authorNameEn', 'tagline', 'role',
      'bio', 'location', 'email', 'github', 'twitter', 'linkedin',
      'available', 'yearsExp', 'projectCount', 'userReach', 'uptime',
      'spotlightCursor', 'brandColor',
    ]

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field]
      }
    }

    const profile = await prisma.siteProfile.upsert({
      where: { id: 'main' },
      update: data,
      create: { id: 'main', ...data },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('更新站点资料失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
