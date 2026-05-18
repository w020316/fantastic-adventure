'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('邮箱或密码错误')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg p-4">
      <div className="cyber-card w-full max-w-md p-8" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold neon-text mb-2">ADMIN</h1>
          <p className="font-mono text-xs text-cyber-text-dim">{'// 管理后台登录'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-mono text-xs text-cyber-text-dim mb-1">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input text-sm"
              style={{ paddingLeft: '1rem' }}
              placeholder="admin@cyberblog.dev"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-mono text-xs text-cyber-text-dim mb-1">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input text-sm"
              style={{ paddingLeft: '1rem' }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-center font-mono text-xs text-cyber-pink" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cyber-button w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/home" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
