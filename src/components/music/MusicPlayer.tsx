'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'

// ============ 类型定义 ============
interface Track {
  id: string
  title: string
  artist: string
  category: string
  duration: number
  url: string
  cover: string
}

interface Category {
  id: string
  name: string
  desc: string
}

interface MusicState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  favorites: string[]
  history: Track[]
  repeat: 'off' | 'all' | 'one'
}

interface MusicContextValue extends MusicState {
  tracks: Track[]
  categories: Category[]
  play: (track?: Track) => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  seek: (time: number) => void
  toggleFavorite: (id: string) => void
  setRepeat: (r: 'off' | 'all' | 'one') => void
  panelOpen: boolean
  setPanelOpen: (o: boolean) => void
  libraryOpen: boolean
  setLibraryOpen: (o: boolean) => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used within MusicPlayer')
  return ctx
}

// localStorage 键
const LS_FAV = 'cyberblog-music-favorites'
const LS_VOL = 'cyberblog-music-volume'
const LS_HIST = 'cyberblog-music-history'

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ============ Provider ============
export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.5)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<Track[]>([])
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [panelOpen, setPanelOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  // 初始化：加载音乐库 + 读取本地存储
  useEffect(() => {
    fetch('/api/music')
      .then((r) => r.json())
      .then((data) => {
        setTracks(data.tracks || [])
        setCategories(data.categories || [])
      })
      .catch(() => {})

    try {
      const fav = localStorage.getItem(LS_FAV)
      if (fav) setFavorites(JSON.parse(fav))
      const vol = localStorage.getItem(LS_VOL)
      if (vol) setVolumeState(parseFloat(vol))
      const hist = localStorage.getItem(LS_HIST)
      if (hist) setHistory(JSON.parse(hist))
    } catch {}
  }, [])

  // 音频元素事件
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume

    const onTime = () => setProgress(audio.currentTime)
    const onDur = () => setDuration(audio.duration || 0)
    const onEnd = () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        audio.play()
      } else {
        next()
      }
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDur)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDur)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeat, currentIndex, tracks])

  const play = useCallback((track?: Track) => {
    if (track) {
      const idx = tracks.findIndex((t) => t.id === track.id)
      setCurrentTrack(track)
      setCurrentIndex(idx >= 0 ? idx : -1)
      // 加入历史
      setHistory((prev) => {
        const filtered = prev.filter((t) => t.id !== track.id)
        const next = [track, ...filtered].slice(0, 20)
        try { localStorage.setItem(LS_HIST, JSON.stringify(next)) } catch {}
        return next
      })
      // 延迟设置 src 等待 audio 元素就绪
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = track.url
          audioRef.current.play().catch(() => {})
        }
      }, 0)
    } else if (currentTrack && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [tracks, currentTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    if (!currentTrack) {
      // 首次播放：从第一首开始
      if (tracks.length > 0) play(tracks[0])
      return
    }
    if (isPlaying) pause()
    else play()
  }, [currentTrack, isPlaying, tracks, play, pause])

  const next = useCallback(() => {
    if (tracks.length === 0) return
    let idx = currentIndex + 1
    if (idx >= tracks.length) idx = repeat === 'all' ? 0 : -1
    if (idx >= 0) play(tracks[idx])
    else pause()
  }, [tracks, currentIndex, repeat, play, pause])

  const prev = useCallback(() => {
    if (tracks.length === 0) return
    // 播放超过3秒则回到开头
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }
    let idx = currentIndex - 1
    if (idx < 0) idx = repeat === 'all' ? tracks.length - 1 : 0
    play(tracks[idx])
  }, [tracks, currentIndex, repeat, play])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
    try { localStorage.setItem(LS_VOL, String(v)) } catch {}
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try { localStorage.setItem(LS_FAV, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const value: MusicContextValue = {
    currentTrack, isPlaying, volume, progress, duration,
    favorites, history, repeat,
    tracks, categories,
    play, pause, toggle, next, prev,
    setVolume, seek, toggleFavorite, setRepeat,
    panelOpen, setPanelOpen, libraryOpen, setLibraryOpen,
  }

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
      <MusicPanel />
    </MusicContext.Provider>
  )
}

// ============ 控制面板 UI ============
function MusicPanel() {
  const m = useMusic()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
  }, [])

  if (!m.currentTrack && !m.panelOpen) {
    // 迷你入口按钮
    return (
      <button
        onClick={() => { m.setPanelOpen(true); if (!m.currentTrack && m.tracks.length > 0) m.play(m.tracks[0]) }}
        className="fixed bottom-4 left-4 z-[9997] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,159,0.15), rgba(0,212,255,0.1))',
          border: '1px solid rgba(0,255,159,0.3)',
          boxShadow: '0 0 15px rgba(0,255,159,0.2)',
        }}
        aria-label="打开音乐播放器"
        title="背景音乐"
      >
        <svg className="w-5 h-5 text-[#00ff9f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
        </svg>
      </button>
    )
  }

  return (
    <>
      {/* 迷你播放条（底部固定） */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9997] transition-transform duration-300 ${m.panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'}`}
      >
        {/* 顶部进度条 */}
        {m.currentTrack && (
          <div className="h-0.5 bg-[#1a1a1a] cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            m.seek(pct * m.duration)
          }}>
            <div
              className="h-full bg-gradient-to-r from-[#00ff9f] to-[#00d4ff] transition-[width]"
              style={{ width: `${m.duration > 0 ? (m.progress / m.duration) * 100 : 0}%` }}
            />
          </div>
        )}

        {/* 控制条 */}
        <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-t border-[#1a1a1a] px-3 sm:px-4 h-12 flex items-center gap-3">
          {/* 封面 + 曲目信息 */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-8 h-8 rounded shrink-0 flex items-center justify-center"
              style={{
                background: m.currentTrack ? m.currentTrack.cover : '#222',
                boxShadow: m.isPlaying && !reduceMotion ? `0 0 12px ${m.currentTrack?.cover || '#00ff9f'}66` : 'none',
              }}
            >
              {m.isPlaying && !reduceMotion ? (
                <div className="flex items-end gap-[2px] h-4">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-[2px] bg-black/80 animate-pulse"
                      style={{ height: '100%', animation: `musicBar 0.6s ease-in-out ${i * 0.15}s infinite alternate` }}
                    />
                  ))}
                </div>
              ) : (
                <svg className="w-4 h-4 text-black/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
                </svg>
              )}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-mono text-xs text-white truncate">{m.currentTrack?.title || '未播放'}</p>
              <p className="font-mono text-[10px] text-[#666] truncate">{m.currentTrack?.artist || '点击播放'}</p>
            </div>
          </div>

          {/* 中心控制 */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={m.prev} className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#00ff9f] transition-colors" aria-label="上一首">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>
            <button onClick={m.toggle} className="w-9 h-9 rounded-full flex items-center justify-center bg-[#00ff9f] text-black hover:shadow-[0_0_12px_rgba(0,255,159,0.5)] transition-all" aria-label={m.isPlaying ? '暂停' : '播放'}>
              {m.isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button onClick={m.next} className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#00ff9f] transition-colors" aria-label="下一首">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>

          {/* 右侧：时间 + 音量 + 展开 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-[10px] text-[#555] hidden md:inline">
              {formatTime(m.progress)} / {formatTime(m.duration)}
            </span>
            {/* 音量 */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => m.setVolume(m.volume > 0 ? 0 : 0.5)}
                className="text-[#666] hover:text-[#00ff9f] transition-colors"
                aria-label="静音切换"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  {m.volume > 0 ? (
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  ) : (
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  )}
                </svg>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={m.volume}
                onChange={(e) => m.setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 accent-[#00ff9f] cursor-pointer"
                aria-label="音量"
              />
            </div>
            {/* 收藏 */}
            {m.currentTrack && (() => {
              const track = m.currentTrack
              const isFav = m.favorites.includes(track.id)
              return (
              <button
                onClick={() => m.toggleFavorite(track.id)}
                className="text-[#666] hover:text-[#ff0080] transition-colors"
                aria-label="收藏"
              >
                <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" style={{ color: isFav ? '#ff0080' : undefined }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              )
            })()}
            {/* 展开/收起 */}
            <button
              onClick={() => m.setPanelOpen(!m.panelOpen)}
              className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#00ff9f] transition-colors"
              aria-label={m.panelOpen ? '收起播放器' : '展开播放器'}
            >
              <svg className={`w-4 h-4 transition-transform ${m.panelOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 展开区：音乐库 + 历史 */}
        {m.panelOpen && (
          <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-t border-[#1a1a1a] max-h-[40vh] overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4">
              {/* 分类标签 + 库/历史切换 */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {m.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => m.setLibraryOpen(false)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-[#222] text-[#666] hover:border-[#00ff9f]/50 hover:text-[#00ff9f] transition-all"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => m.setLibraryOpen(false)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${!m.libraryOpen ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/30' : 'text-[#666] border border-[#222]'}`}
                  >
                    音乐库
                  </button>
                  <button
                    onClick={() => m.setLibraryOpen(true)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${m.libraryOpen ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/30' : 'text-[#666] border border-[#222]'}`}
                  >
                    历史 ({m.history.length})
                  </button>
                  <button
                    onClick={() => m.setRepeat(m.repeat === 'off' ? 'all' : m.repeat === 'all' ? 'one' : 'off')}
                    className={`px-2 py-1 rounded-full text-[10px] font-mono border transition-all ${m.repeat !== 'off' ? 'text-[#00ff9f] border-[#00ff9f]/30' : 'text-[#666] border-[#222]'}`}
                    aria-label="循环模式"
                    title={`循环: ${m.repeat === 'off' ? '关闭' : m.repeat === 'all' ? '列表循环' : '单曲循环'}`}
                  >
                    {m.repeat === 'one' ? '🔂' : '🔁'}
                  </button>
                </div>
              </div>

              {/* 曲目列表 */}
              <div className="space-y-1">
                {(m.libraryOpen ? m.history : m.tracks).map((track) => {
                  const isCurrent = m.currentTrack?.id === track.id
                  const isFav = m.favorites.includes(track.id)
                  return (
                    <button
                      key={track.id}
                      onClick={() => m.play(track)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-all group ${isCurrent ? 'bg-[#00ff9f]/5' : 'hover:bg-[#111]'}`}
                    >
                      <span className="font-mono text-[10px] text-[#444] w-4 text-center">
                        {isCurrent && m.isPlaying ? '▶' : track.id.replace('t', '')}
                      </span>
                      <div className="w-6 h-6 rounded shrink-0" style={{ background: track.cover }} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-mono text-xs truncate ${isCurrent ? 'text-[#00ff9f]' : 'text-[#ccc]'}`}>{track.title}</p>
                        <p className="font-mono text-[10px] text-[#555] truncate">{track.artist}</p>
                      </div>
                      <span className="font-mono text-[10px] text-[#444] hidden sm:inline">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); m.toggleFavorite(track.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="收藏"
                      >
                        <svg className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" style={{ color: isFav ? '#ff0080' : '#666' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </button>
                  )
                })}
                {m.libraryOpen && m.history.length === 0 && (
                  <p className="font-mono text-xs text-[#444] text-center py-6">暂无播放历史</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes musicBar {
          0% { height: 30%; }
          100% { height: 100%; }
        }
      `}</style>
    </>
  )
}
