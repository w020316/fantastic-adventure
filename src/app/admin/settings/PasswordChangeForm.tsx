'use client'

import { useState } from 'react'

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChangePassword = async () => {
    setMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: '请填写所有字段' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少6个字符' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' })
      return
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: '新密码不能与当前密码相同' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: '密码修改成功' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.error || '密码修改失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease forwards', opacity: 0 }}>
      <div className="section-title mb-4">
        <span className="neon-text-pink">▸</span> 修改密码
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block font-mono text-xs text-cyber-text-dim mb-1.5">
            当前密码
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="cyber-input w-full"
            placeholder="输入当前密码"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-cyber-text-dim mb-1.5">
            新密码
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="cyber-input w-full"
            placeholder="至少6个字符"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-cyber-text-dim mb-1.5">
            确认新密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="cyber-input w-full"
            placeholder="再次输入新密码"
            onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword() }}
          />
        </div>

        {message && (
          <div
            className={`font-mono text-xs px-3 py-2 rounded-sm border ${
              message.type === 'success'
                ? 'text-green-400 border-green-400/30 bg-green-400/5'
                : 'text-cyber-pink border-cyber-pink/30 bg-cyber-pink/5'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="cyber-button text-xs py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '修改中...' : '确认修改'}
        </button>
      </div>
    </div>
  )
}
