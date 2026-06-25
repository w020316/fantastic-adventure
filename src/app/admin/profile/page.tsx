'use client'

import { useState, useEffect } from 'react'

interface SiteProfileData {
  brandName: string
  authorNameCn: string
  authorNameEn: string
  tagline: string
  role: string
  bio: string
  location: string
  email: string
  github: string
  twitter: string
  linkedin: string
  available: boolean
  yearsExp: number
  projectCount: number
  userReach: string
  uptime: string
  spotlightCursor: boolean
  brandColor: string
}

const defaultProfile: SiteProfileData = {
  brandName: 'XIAO/WU',
  authorNameCn: '周末',
  authorNameEn: 'Cris',
  tagline: '用代码把想法真正实现出来',
  role: '全栈工程师',
  bio: '',
  location: 'China',
  email: 'hello@xiaowu.dev',
  github: 'https://github.com/w020316',
  twitter: '',
  linkedin: '',
  available: true,
  yearsExp: 3,
  projectCount: 20,
  userReach: '10万+',
  uptime: '99.9%',
  spotlightCursor: true,
  brandColor: '#ccff00',
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<SiteProfileData>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile({ ...defaultProfile, ...data })
        }
      } catch (err) {
        console.error('获取站点资料失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  function handleChange(field: keyof SiteProfileData, value: string | number | boolean) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: '站点资料已保存' })
      } else {
        const data = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: data.error || '保存失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="cyber-card p-8 text-center">
          <p className="font-mono text-xs text-cyber-text-dim">加载中...</p>
        </div>
      </div>
    )
  }

  const inputClass = 'cyber-input w-full'
  const labelClass = 'block font-mono text-xs text-cyber-text-dim mb-1.5'

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <div className="section-title mb-6">
        <span className="neon-text">▸</span> 站点资料
      </div>

      {message && (
        <div
          className={`font-mono text-xs px-3 py-2 rounded border mb-4 ${
            message.type === 'success'
              ? 'text-green-400 border-green-400/30 bg-green-400/5'
              : 'text-cyber-pink border-cyber-pink/30 bg-cyber-pink/5'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* 品牌信息 */}
        <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease forwards', opacity: 0 }}>
          <div className="section-title mb-4">
            <span className="neon-text">▸</span> 品牌信息
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>品牌名</label>
              <input
                value={profile.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                className={inputClass}
                placeholder="XIAO/WU"
              />
            </div>
            <div>
              <label className={labelClass}>职业角色</label>
              <input
                value={profile.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className={inputClass}
                placeholder="全栈工程师"
              />
            </div>
            <div>
              <label className={labelClass}>作者中文名</label>
              <input
                value={profile.authorNameCn}
                onChange={(e) => handleChange('authorNameCn', e.target.value)}
                className={inputClass}
                placeholder="周末"
              />
            </div>
            <div>
              <label className={labelClass}>作者英文名</label>
              <input
                value={profile.authorNameEn}
                onChange={(e) => handleChange('authorNameEn', e.target.value)}
                className={inputClass}
                placeholder="Cris"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>定位语 / Tagline</label>
              <input
                value={profile.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className={inputClass}
                placeholder="用代码把想法真正实现出来"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>个人简介</label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="全栈工程师，专注于将产品从概念推向落地..."
              />
            </div>
          </div>
        </div>

        {/* 数据指标 */}
        <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.1s forwards', opacity: 0 }}>
          <div className="section-title mb-4">
            <span className="neon-text-pink">▸</span> 数据指标
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>工作年限</label>
              <input
                type="number"
                value={profile.yearsExp}
                onChange={(e) => handleChange('yearsExp', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>项目数量</label>
              <input
                type="number"
                value={profile.projectCount}
                onChange={(e) => handleChange('projectCount', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>用户触达</label>
              <input
                value={profile.userReach}
                onChange={(e) => handleChange('userReach', e.target.value)}
                className={inputClass}
                placeholder="10万+"
              />
            </div>
            <div>
              <label className={labelClass}>服务可用性</label>
              <input
                value={profile.uptime}
                onChange={(e) => handleChange('uptime', e.target.value)}
                className={inputClass}
                placeholder="99.9%"
              />
            </div>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.2s forwards', opacity: 0 }}>
          <div className="section-title mb-4">
            <span className="neon-text-blue">▸</span> 联系方式与社交
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>邮箱</label>
              <input
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={inputClass}
                placeholder="hello@xiaowu.dev"
              />
            </div>
            <div>
              <label className={labelClass}>所在地</label>
              <input
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={inputClass}
                placeholder="China"
              />
            </div>
            <div>
              <label className={labelClass}>GitHub</label>
              <input
                value={profile.github}
                onChange={(e) => handleChange('github', e.target.value)}
                className={inputClass}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input
                value={profile.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                className={inputClass}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                value={profile.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className={inputClass}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* 主题配置 */}
        <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.3s forwards', opacity: 0 }}>
          <div className="section-title mb-4">
            <span className="neon-text-yellow">▸</span> 主题与交互
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>品牌色</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profile.brandColor}
                  onChange={(e) => handleChange('brandColor', e.target.value)}
                  className="w-12 h-10 rounded border border-cyber-border bg-transparent cursor-pointer"
                />
                <input
                  value={profile.brandColor}
                  onChange={(e) => handleChange('brandColor', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChange('available', !profile.available)}
                className={`relative w-12 h-6 rounded-full transition-colors ${profile.available ? 'bg-cyber-neon' : 'bg-cyber-border'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${profile.available ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
              <span className="font-mono text-xs text-cyber-text">开放合作中 (Available for work)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChange('spotlightCursor', !profile.spotlightCursor)}
                className={`relative w-12 h-6 rounded-full transition-colors ${profile.spotlightCursor ? 'bg-cyber-neon' : 'bg-cyber-border'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${profile.spotlightCursor ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
              <span className="font-mono text-xs text-cyber-text">启用鼠标跟随光斑</span>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="cyber-button text-xs py-2.5 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存资料'}
          </button>
        </div>
      </div>
    </div>
  )
}
