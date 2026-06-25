'use client'

import { useState, useEffect } from 'react'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  ip: string | null
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'
  createdAt: string
}

const statusConfig = {
  NEW: { label: '新消息', color: 'cyber-tag-green' },
  READ: { label: '已读', color: 'cyber-tag-blue' },
  REPLIED: { label: '已回复', color: 'cyber-tag-yellow' },
  ARCHIVED: { label: '已归档', color: '' },
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      // NextAuth session 通过 cookie 自动鉴权，无需手动加 authorization header
      const res = await fetch('/api/contact')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || data || [])
      }
    } catch (err) {
      console.error('获取消息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchMessages()
      if (selected?.id === id) {
        setSelected({ ...selected, status: status as ContactMessage['status'] })
      }
    } catch (err) {
      console.error('更新状态失败:', err)
    }
  }

  const filtered = filter === 'ALL' ? messages : messages.filter((m) => m.status === filter)
  const newCount = messages.filter((m) => m.status === 'NEW').length

  return (
    <div className="p-4 lg:p-6 max-w-6xl">
      <div className="section-title mb-6">
        <span className="neon-text">▸</span> 联系消息
        {newCount > 0 && (
          <span className="cyber-tag cyber-tag-green text-[10px] ml-2">{newCount} 新</span>
        )}
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'NEW', 'READ', 'REPLIED', 'ARCHIVED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`cyber-tag text-xs ${filter === s ? 'cyber-tag-green' : ''}`}
          >
            {s === 'ALL' ? '全部' : statusConfig[s as keyof typeof statusConfig]?.label || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cyber-card p-8 text-center">
          <p className="font-mono text-xs text-cyber-text-dim">加载中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cyber-card p-8 text-center">
          <p className="font-mono text-xs text-cyber-text-dim">暂无消息</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* 消息列表 */}
          <div className="space-y-2">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelected(msg)
                  if (msg.status === 'NEW') updateStatus(msg.id, 'READ')
                }}
                className={`cyber-card p-4 w-full text-left ${selected?.id === msg.id ? 'border-cyber-neon/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm text-cyber-text">{msg.name}</span>
                  <span className={`cyber-tag text-[10px] ${statusConfig[msg.status].color}`}>
                    {statusConfig[msg.status].label}
                  </span>
                </div>
                <p className="font-mono text-xs text-cyber-text-dim mb-1">{msg.email}</p>
                <p className="text-xs text-cyber-text-dim line-clamp-2">{msg.message}</p>
                <p className="font-mono text-[10px] text-cyber-text-dim mt-2">
                  {new Date(msg.createdAt).toLocaleString('zh-CN')}
                </p>
              </button>
            ))}
          </div>

          {/* 消息详情 */}
          <div className="lg:sticky lg:top-20 h-fit">
            {selected ? (
              <div className="cyber-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base text-cyber-text">{selected.name}</h3>
                  <span className={`cyber-tag text-[10px] ${statusConfig[selected.status].color}`}>
                    {statusConfig[selected.status].label}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="font-mono text-[10px] text-cyber-text-dim mb-0.5">邮箱</p>
                    <a href={`mailto:${selected.email}`} className="text-xs text-cyber-neon hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-cyber-text-dim mb-0.5">时间</p>
                    <p className="text-xs text-cyber-text">{new Date(selected.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  {selected.ip && (
                    <div>
                      <p className="font-mono text-[10px] text-cyber-text-dim mb-0.5">IP</p>
                      <p className="text-xs text-cyber-text-dim">{selected.ip}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-mono text-[10px] text-cyber-text-dim mb-0.5">留言内容</p>
                    <p className="text-sm text-cyber-text whitespace-pre-wrap bg-cyber-bg/50 p-3 rounded border border-cyber-border">
                      {selected.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`mailto:${selected.email}?subject=Re: 联系表单`}
                    className="cyber-button text-xs"
                  >
                    回复邮件
                  </a>
                  {selected.status !== 'REPLIED' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'REPLIED')}
                      className="cyber-button text-xs"
                      style={{ borderColor: 'var(--color-cyber-yellow)', color: 'var(--color-cyber-yellow)' }}
                    >
                      标记已回复
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(selected.id, 'ARCHIVED')}
                    className="cyber-button text-xs"
                    style={{ borderColor: 'var(--color-cyber-pink)', color: 'var(--color-cyber-pink)' }}
                  >
                    归档
                  </button>
                </div>
              </div>
            ) : (
              <div className="cyber-card p-8 text-center">
                <p className="font-mono text-xs text-cyber-text-dim">← 选择一条消息查看详情</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
