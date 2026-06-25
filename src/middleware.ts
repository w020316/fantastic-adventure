import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 路由鉴权中间件：保护 /admin/* 页面（登录页除外）
// 使用 next-auth/jwt 的 getToken 手动校验 JWT token，
// 兼容 Next.js 16（next-auth v4 的 withAuth 在 Next.js 16 中失效）
// API 鉴权仍由各 route handler 内的 requireAdmin() 负责
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 非 ADMIN 用户重定向到登录页
  if (token?.role !== 'ADMIN') {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // 匹配所有 /admin/* 但排除 /admin/login（避免登录页被拦截导致无限重定向）
  matcher: ['/admin/((?!login).*)'],
}
