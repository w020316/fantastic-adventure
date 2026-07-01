'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Track {
  id: string
  title: string
  artist: string
  category: string
  region: string
  duration: number
  url: string
  cover: string
  album?: string | null
  mood?: string | null
  isHot: boolean
  source: string
  playable: boolean
  order: number
}

interface Mood {
  id: string
  key: string
  name: string
  icon: string
  color: string
  description?: string | null
  order: number
}

type TabType = 'tracks' | 'moods'

const CATEGORIES = [
  { id: 'pop', name: '流行' },
  { id: 'electronic', name: '电子' },
  { id: 'ambient', name: '氛围' },
  { id: 'beats', name: '节奏' },
  { id: 'guofeng', name: '古风' },
  { id: 'rock', name: '摇滚' },
  { id: 'online', name: '在线' },
]

function formatDuration(sec: number) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AdminMusicPage() {
  const { status: sessionStatus } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('tracks')

  const [tracks, setTracks] = useState<Track[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)

  // 新增曲目表单
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    title: '', artist: '', category: 'pop', region: 'cn',
    duration: 0, url: '', cover: '#00ff9f', album: '', mood: '', isHot: false, source: 'local',
  })
  const [submitting, setSubmitting] = useState(false)

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Track>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [trackRes, moodRes] = await Promise.all([
        fetch('/api/music?hot='),
        fetch('/api/music/moods'),
      ])
      if (trackRes.ok) {
        const data = await trackRes.json()
        setTracks(data.tracks || [])
      }
      if (moodRes.ok) {
        const data = await moodRes.json()
        setMoods(data.moods || [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    fetchData()
  }, [sessionStatus, fetchData])

  // ========== 曲目 CRUD ==========
  async function handleCreateTrack() {
    if (!form.title.trim() || !form.artist.trim() || !form.url.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setTracks((prev) => [...prev, { ...data.track, order: prev.length }])
        setForm({
          title: '', artist: '', category: 'pop', region: 'cn',
          duration: 0, url: '', cover: '#00ff9f', album: '', mood: '', isHot: false, source: 'local',
        })
        setShowAddForm(false)
      } else {
        const data = await res.json()
        alert(data.error || '创建失败')
      }
    } catch {
      alert('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateTrack(id: string) {
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/music/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data.track } : t)))
        setEditingId(null)
        setEditForm({})
      } else {
        const data = await res.json()
        alert(data.error || '更新失败')
      }
    } catch {
      alert('更新失败')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDeleteTrack(id: string, title: string) {
    if (!confirm(`确定删除曲目「${title}」？`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/music/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTracks((prev) => prev.filter((t) => t.id !== id))
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    } finally {
      setDeleting(null)
    }
  }

  function startEdit(track: Track) {
    setEditingId(track.id)
    setEditForm({ ...track })
  }

  // ========== 心情 CRUD ==========
  async function handleCreateMood(data: { key: string; name: string; icon: string; color: string; description: string }) {
    try {
      const res = await fetch('/api/music/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        setMoods((prev) => [...prev, result.mood].sort((a, b) => a.order - b.order))
        return true
      }
      const result = await res.json()
      alert(result.error || '创建失败')
      return false
    } catch {
      alert('创建失败')
      return false
    }
  }

  async function handleUpdateMood(id: string, data: Partial<Mood>) {
    try {
      const res = await fetch(`/api/music/moods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        setMoods((prev) => prev.map((m) => (m.id === id ? result.mood : m)))
        return true
      }
      const result = await res.json()
      alert(result.error || '更新失败')
      return false
    } catch {
      alert('更新失败')
      return false
    }
  }

  async function handleDeleteMood(id: string, name: string) {
    if (!confirm(`确定删除心情「${name}」？`)) return
    try {
      const res = await fetch(`/api/music/moods/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMoods((prev) => prev.filter((m) => m.id !== id))
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  const filteredTracks = search.trim()
    ? tracks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase())
      )
    : tracks

  const hotCount = tracks.filter((t) => t.isHot).length

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin" className="font-mono text-xs text-cyber-text-dim hover:text-cyber-neon transition-colors">
          ← 仪表盘
        </Link>

        <div className="flex items-center justify-between mt-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold neon-text">音乐管理</h1>
            <p className="font-mono text-xs text-cyber-text-dim mt-1">
              {'// 管理音乐库、心情推荐规则、热门曲目'}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="cyber-tag cyber-tag-green">{tracks.length} 首</span>
            <span className="cyber-tag cyber-tag-pink">{hotCount} 热门</span>
            <span className="cyber-tag cyber-tag-blue">{moods.length} 心情</span>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex items-center gap-1 mb-6 border-b border-cyber-border">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-4 py-2.5 font-mono text-xs transition-colors relative ${
              activeTab === 'tracks' ? 'text-cyber-neon' : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            🎵 曲目库
            {activeTab === 'tracks' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-neon" />}
          </button>
          <button
            onClick={() => setActiveTab('moods')}
            className={`px-4 py-2.5 font-mono text-xs transition-colors relative ${
              activeTab === 'moods' ? 'text-cyber-neon' : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            💖 心情推荐
            {activeTab === 'moods' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-neon" />}
          </button>
        </div>

        {/* ========== 曲目库 Tab ========== */}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            {/* 新增按钮 */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="cyber-input text-xs w-56"
                  style={{ paddingLeft: '1.75rem' }}
                  placeholder="搜索曲目..."
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyber-text-dim text-xs">⌕</span>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="cyber-button text-xs"
              >
                {showAddForm ? '取消' : '+ 新增曲目'}
              </button>
            </div>

            {/* 新增表单 */}
            {showAddForm && (
              <div className="cyber-card p-5">
                <div className="section-title mb-4">
                  <span className="neon-text">+</span> 新增曲目
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">标题 *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="歌曲名"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">歌手 *</label>
                    <input
                      type="text"
                      value={form.artist}
                      onChange={(e) => setForm({ ...form, artist: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="歌手名"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">播放URL *</label>
                    <input
                      type="text"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">分类</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                    >
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">地区</label>
                    <select
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                    >
                      <option value="cn">国内</option>
                      <option value="intl">国际</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">时长(秒)</label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">封面色值/URL</label>
                    <input
                      type="text"
                      value={form.cover}
                      onChange={(e) => setForm({ ...form, cover: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="#00ff9f"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">专辑</label>
                    <input
                      type="text"
                      value={form.album}
                      onChange={(e) => setForm({ ...form, album: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="可选"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cyber-text-dim mb-1">心情(逗号分隔)</label>
                    <input
                      type="text"
                      value={form.mood}
                      onChange={(e) => setForm({ ...form, mood: e.target.value })}
                      className="cyber-input text-sm w-full"
                      style={{ paddingLeft: '0.75rem' }}
                      placeholder="happy,relaxed"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 font-mono text-xs text-cyber-text-dim cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isHot}
                      onChange={(e) => setForm({ ...form, isHot: e.target.checked })}
                      className="accent-cyber-neon"
                    />
                    标记为热门（自动播放优先）
                  </label>
                  <button
                    onClick={handleCreateTrack}
                    disabled={submitting || !form.title.trim() || !form.artist.trim() || !form.url.trim()}
                    className="cyber-button text-xs disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    {submitting ? '创建中...' : '创建'}
                  </button>
                </div>
              </div>
            )}

            {/* 曲目列表表格 */}
            <div className="cyber-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase">封面</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase">标题</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase">歌手</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase hidden sm:table-cell">分类</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase hidden md:table-cell">地区</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase hidden lg:table-cell">时长</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase hidden lg:table-cell">心情</th>
                      <th className="text-left font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase">热门</th>
                      <th className="text-right font-mono text-xs text-cyber-text-dim px-3 py-3 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-cyber-border/50">
                          <td className="px-3 py-3"><div className="h-8 w-8 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3"><div className="h-4 w-28 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3 hidden sm:table-cell"><div className="h-4 w-12 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3 hidden md:table-cell"><div className="h-4 w-10 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3 hidden lg:table-cell"><div className="h-4 w-12 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3 hidden lg:table-cell"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3"><div className="h-4 w-8 bg-cyber-border animate-pulse rounded" /></td>
                          <td className="px-3 py-3"><div className="h-4 w-20 bg-cyber-border animate-pulse rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredTracks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <p className="font-mono text-xs text-cyber-text-dim">
                            {search ? '// 未找到匹配曲目' : '// 暂无曲目，点击右上角新增'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredTracks.map((track) => (
                        <tr key={track.id} className="border-b border-cyber-border/50 hover:bg-cyber-neon/5 transition-colors">
                          <td className="px-3 py-3">
                            {track.cover.startsWith('#') ? (
                              <span className="inline-block w-8 h-8 rounded" style={{ backgroundColor: track.cover }} />
                            ) : (
                              <img src={track.cover} alt="" className="w-8 h-8 rounded object-cover" />
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {editingId === track.id ? (
                              <input
                                type="text"
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="cyber-input text-sm w-full"
                                style={{ paddingLeft: '0.5rem' }}
                              />
                            ) : (
                              <span className="font-display text-sm text-cyber-text">{track.title}</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {editingId === track.id ? (
                              <input
                                type="text"
                                value={editForm.artist || ''}
                                onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                                className="cyber-input text-sm w-full"
                                style={{ paddingLeft: '0.5rem' }}
                              />
                            ) : (
                              <span className="font-mono text-xs text-cyber-text-dim">{track.artist}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            {editingId === track.id ? (
                              <select
                                value={editForm.category || 'pop'}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                className="cyber-input text-xs"
                                style={{ paddingLeft: '0.5rem' }}
                              >
                                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            ) : (
                              <span className="cyber-tag">{CATEGORIES.find((c) => c.id === track.category)?.name || track.category}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className="font-mono text-xs text-cyber-text-dim">
                              {track.region === 'cn' ? '国内' : '国际'}
                            </span>
                          </td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            <span className="font-mono text-xs text-cyber-text-dim">{formatDuration(track.duration)}</span>
                          </td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            {editingId === track.id ? (
                              <input
                                type="text"
                                value={editForm.mood || ''}
                                onChange={(e) => setEditForm({ ...editForm, mood: e.target.value })}
                                className="cyber-input text-xs w-full"
                                style={{ paddingLeft: '0.5rem' }}
                                placeholder="happy,relaxed"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {track.mood?.split(',').filter(Boolean).map((m) => {
                                  const mood = moods.find((mo) => mo.key === m)
                                  return (
                                    <span
                                      key={m}
                                      className="cyber-tag text-[10px]"
                                      style={{ color: mood?.color, borderColor: `${mood?.color}50` }}
                                    >
                                      {mood?.icon} {mood?.name || m}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {editingId === track.id ? (
                              <input
                                type="checkbox"
                                checked={editForm.isHot || false}
                                onChange={(e) => setEditForm({ ...editForm, isHot: e.target.checked })}
                                className="accent-cyber-neon"
                              />
                            ) : track.isHot ? (
                              <span className="cyber-tag cyber-tag-pink">🔥</span>
                            ) : (
                              <span className="font-mono text-xs text-cyber-text-dim">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {editingId === track.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateTrack(track.id)}
                                  disabled={editSubmitting}
                                  className="cyber-tag hover:!text-cyber-neon hover:!border-cyber-neon/50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {editSubmitting ? '...' : '保存'}
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditForm({}) }}
                                  className="cyber-tag hover:!text-cyber-text-dim transition-colors cursor-pointer"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEdit(track)}
                                  className="cyber-tag hover:!text-cyber-blue hover:!border-cyber-blue/50 transition-colors cursor-pointer"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDeleteTrack(track.id, track.title)}
                                  disabled={deleting === track.id}
                                  className="cyber-tag hover:!text-cyber-pink hover:!border-cyber-pink/50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {deleting === track.id ? '...' : '删除'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== 心情推荐 Tab ========== */}
        {activeTab === 'moods' && (
          <MoodManager
            moods={moods}
            loading={loading}
            onCreate={handleCreateMood}
            onUpdate={handleUpdateMood}
            onDelete={handleDeleteMood}
          />
        )}
      </div>
    </div>
  )
}

// ============ 心情管理子组件 ============
function MoodManager({
  moods,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  moods: Mood[]
  loading: boolean
  onCreate: (data: { key: string; name: string; icon: string; color: string; description: string }) => Promise<boolean>
  onUpdate: (id: string, data: Partial<Mood>) => Promise<boolean>
  onDelete: (id: string, name: string) => Promise<void>
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ key: '', name: '', icon: '♪', color: '#00ff9f', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Mood>>({})

  async function handleCreate() {
    if (!form.key.trim() || !form.name.trim()) return
    setSubmitting(true)
    const ok = await onCreate(form)
    if (ok) {
      setForm({ key: '', name: '', icon: '♪', color: '#00ff9f', description: '' })
      setShowAddForm(false)
    }
    setSubmitting(false)
  }

  async function handleUpdate(id: string) {
    const ok = await onUpdate(id, editForm)
    if (ok) {
      setEditingId(null)
      setEditForm({})
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs text-cyber-text-dim">
          {'// 心情与曲目关联：在曲目编辑中为每首歌标记 mood（逗号分隔的 key）'}
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="cyber-button text-xs">
          {showAddForm ? '取消' : '+ 新增心情'}
        </button>
      </div>

      {showAddForm && (
        <div className="cyber-card p-5">
          <div className="section-title mb-4"><span className="neon-text">+</span> 新增心情</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">Key *</label>
              <input
                type="text"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="cyber-input text-sm w-full"
                style={{ paddingLeft: '0.75rem' }}
                placeholder="happy"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="cyber-input text-sm w-full"
                style={{ paddingLeft: '0.75rem' }}
                placeholder="开心"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">图标</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="cyber-input text-sm w-full"
                style={{ paddingLeft: '0.75rem' }}
                placeholder="😊"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">主题色</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="cyber-input text-sm w-full h-10"
                style={{ paddingLeft: '0.25rem' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-mono text-xs text-cyber-text-dim mb-1">描述</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="cyber-input text-sm w-full"
                style={{ paddingLeft: '0.75rem' }}
                placeholder="心情描述"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={submitting || !form.key.trim() || !form.name.trim()}
              className="cyber-button text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '创建中...' : '创建心情'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="cyber-card p-5 animate-pulse">
              <div className="h-16 w-16 bg-cyber-border rounded-full mb-3" />
              <div className="h-4 w-24 bg-cyber-border rounded mb-2" />
              <div className="h-3 w-32 bg-cyber-border rounded" />
            </div>
          ))
        ) : moods.length === 0 ? (
          <div className="col-span-full cyber-card p-12 text-center">
            <p className="font-mono text-xs text-cyber-text-dim">{'// 暂无心情配置'}</p>
          </div>
        ) : (
          moods.map((mood) => (
            <div key={mood.id} className="cyber-card p-5" style={{ borderColor: `${mood.color}40` }}>
              {editingId === mood.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '0.5rem' }}
                    placeholder="名称"
                  />
                  <input
                    type="text"
                    value={editForm.icon || ''}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="cyber-input text-sm w-full"
                    style={{ paddingLeft: '0.5rem' }}
                    placeholder="图标"
                  />
                  <input
                    type="color"
                    value={editForm.color || '#00ff9f'}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="cyber-input text-sm w-full h-8"
                    style={{ paddingLeft: '0.25rem' }}
                  />
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="cyber-input text-xs w-full"
                    style={{ paddingLeft: '0.5rem' }}
                    placeholder="描述"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(mood.id)}
                      className="cyber-tag hover:!text-cyber-neon hover:!border-cyber-neon/50 cursor-pointer"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditForm({}) }}
                      className="cyber-tag hover:!text-cyber-text-dim cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${mood.color}20`, border: `1px solid ${mood.color}` }}
                    >
                      {mood.icon}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingId(mood.id); setEditForm({ ...mood }) }}
                        className="cyber-tag hover:!text-cyber-blue hover:!border-cyber-blue/50 cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => onDelete(mood.id, mood.name)}
                        className="cyber-tag hover:!text-cyber-pink hover:!border-cyber-pink/50 cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display text-base font-bold" style={{ color: mood.color }}>
                    {mood.name}
                  </h3>
                  <p className="font-mono text-xs text-cyber-text-dim mt-1">{mood.description || '—'}</p>
                  <p className="font-mono text-[10px] text-cyber-text-dim mt-2">key: {mood.key}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
