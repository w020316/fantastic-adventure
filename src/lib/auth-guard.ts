import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  }
  return null
}
