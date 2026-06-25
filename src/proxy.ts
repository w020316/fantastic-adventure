import { withAuth } from 'next-auth/middleware'

// Next.js 16 proxy（原 middleware）保护 /admin/* 页面路由（登录页除外）
// API 鉴权仍由各 route handler 内的 requireAdmin() 负责
export default withAuth({
  pages: { signIn: '/admin/login' },
  callbacks: {
    // 仅放行 ADMIN 角色的 token，其他重定向到登录页
    authorized: ({ token }) => (token?.role as string | undefined) === 'ADMIN',
  },
})

export const config = {
  // 匹配所有 /admin/* 但排除 /admin/login（避免登录页被拦截导致无限重定向）
  matcher: ['/admin/((?!login).*)'],
}
