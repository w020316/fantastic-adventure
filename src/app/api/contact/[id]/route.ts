import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// 更新联系消息状态（需要管理员权限）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 鉴权：仅管理员可操作
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 })
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('更新联系消息状态失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取单条联系消息（需要管理员权限）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 鉴权：仅管理员可查看留言详情
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json({ error: '消息不存在' }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('获取联系消息失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
