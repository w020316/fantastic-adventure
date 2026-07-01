'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'

// ============ 类型定义 ============
interface Track {
  id: string
  title: string
  artist: string
  category: string
  region: 'cn' | 'intl'
  duration: number
  url: string
  cover: string
  source?: 'local' | 'online' | 'netease' // 来源标识：local=本地库 online=iTunes30秒预览 netease=网易云完整播放
  onlineId?: string // 在线歌曲ID
  album?: string // 专辑名
  playable?: boolean // 是否可播放（在线曲目可能因版权受限）
  mood?: string // 关联心情key，逗号分隔
  isHot?: boolean // 是否热门
}

interface Category {
  id: string
  name: string
  desc: string
}

interface Region {
  id: string
  name: string
}

interface Mood {
  key: string
  name: string
  icon: string
  color: string
  description?: string
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
  regions: Region[]
  moods: Mood[]
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
  // 搜索与筛选
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeCategory: string
  setActiveCategory: (c: string) => void
  activeRegion: string
  setActiveRegion: (r: string) => void
  activeMood: string
  setActiveMood: (m: string) => void
  filteredTracks: Track[]
  // 搜索状态反馈
  searching: boolean
  resultHint: string | null
  onlineStatus: 'idle' | 'success' | 'failed'
  localCount: number
  onlineCount: number
  playError: string | null
  // 自动播放提示
  autoplayPrompt: string | null
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
  const [regions, setRegions] = useState<Region[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
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
  // 搜索与筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRegion, setActiveRegion] = useState('all')
  const [activeMood, setActiveMood] = useState('all')
  // 搜索状态（在线搜索反馈）
  const [searching, setSearching] = useState(false)
  const [resultHint, setResultHint] = useState<string | null>(null)
  const [onlineStatus, setOnlineStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [localCount, setLocalCount] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)
  // 自动播放提示（浏览器策略要求首次用户交互后才能播放）
  const [autoplayPrompt, setAutoplayPrompt] = useState<string | null>(null)
  const autoStartedRef = useRef(false) // 防止重复触发自动播放

  // 加载音乐库（根据搜索关键词、分类、地区、心情调用API）
  const loadMusic = useCallback(async (q: string, cat: string, reg: string, mood: string) => {
    setSearching(true)
    setResultHint(null)
    try {
      const params = new URLSearchParams()
      if (q) params.append('q', q)
      if (cat !== 'all') params.append('category', cat)
      if (reg !== 'all') params.append('region', reg)
      if (mood !== 'all') params.append('mood', mood)
      const resp = await fetch(`/api/music?${params.toString()}`)
      const data = await resp.json()
      setTracks(data.tracks || [])
      setCategories(data.categories || [])
      setRegions(data.regions || [])
      setMoods(data.moods || [])
      setLocalCount(data.localCount ?? data.tracks?.length ?? 0)
      setOnlineCount(data.onlineCount ?? 0)
      setOnlineStatus(data.onlineStatus ?? 'idle')
      setResultHint(data.resultHint ?? null)
    } catch {
      setResultHint('加载失败，请检查网络后重试')
      setOnlineStatus('failed')
    } finally {
      setSearching(false)
    }
  }, [])

  // 初始化 + 读取本地存储
  useEffect(() => {
    loadMusic('', 'all', 'all', 'all')
    try {
      const fav = localStorage.getItem(LS_FAV)
      if (fav) setFavorites(JSON.parse(fav))
      const vol = localStorage.getItem(LS_VOL)
      if (vol) setVolumeState(parseFloat(vol))
      const hist = localStorage.getItem(LS_HIST)
      if (hist) setHistory(JSON.parse(hist))
    } catch {}
  }, [loadMusic])

  // 自动播放：监听首次用户交互（pointerdown/keydown），符合浏览器自动播放策略
  // 进入页面后自动播放热门音乐（需用户首次交互解锁音频）
  useEffect(() => {
    if (autoStartedRef.current) return
    function startAutoplay() {
      if (autoStartedRef.current) return
      autoStartedRef.current = true
      // 清除提示
      setAutoplayPrompt(null)
      // 没有当前曲目时，自动播放热门第一首
      if (!currentTrack && tracks.length > 0) {
        const hotTracks = tracks.filter((t) => t.isHot)
        const first = hotTracks[0] || tracks[0]
        if (first) {
          play(first)
        }
      }
      // 移除监听
      window.removeEventListener('pointerdown', startAutoplay)
      window.removeEventListener('keydown', startAutoplay)
      window.removeEventListener('touchstart', startAutoplay)
    }
    // 等待 tracks 加载完成后显示提示
    if (tracks.length > 0 && !currentTrack && !isPlaying) {
      setAutoplayPrompt('点击任意位置开启背景音乐 ♪')
      window.addEventListener('pointerdown', startAutoplay, { once: true })
      window.addEventListener('keydown', startAutoplay, { once: true })
      window.addEventListener('touchstart', startAutoplay, { once: true })
    }
    return () => {
      window.removeEventListener('pointerdown', startAutoplay)
      window.removeEventListener('keydown', startAutoplay)
      window.removeEventListener('touchstart', startAutoplay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, currentTrack, isPlaying])

  // 搜索关键词变化时 debounce 重新加载（500ms）
  useEffect(() => {
    const t = setTimeout(() => {
      loadMusic(searchQuery, activeCategory, activeRegion, activeMood)
    }, searchQuery ? 500 : 0)
    return () => clearTimeout(t)
  }, [searchQuery, loadMusic, activeCategory, activeRegion, activeMood])

  // 分类/地区/心情变化时立即重新加载
  useEffect(() => {
    loadMusic(searchQuery, activeCategory, activeRegion, activeMood)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeRegion, activeMood])

  // 过滤后的曲目列表：直接使用API返回的tracks（API已处理过滤+在线搜索合并）
  const filteredTracks = useCallback(() => tracks, [tracks])

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

  const [playError, setPlayError] = useState<string | null>(null)

  const play = useCallback((track?: Track) => {
    if (track) {
      // 在线曲目且明确不可播放（VIP/专辑版权限制）
      if ((track.source === 'online' || track.source === 'netease') && track.playable === false) {
        setPlayError(`「${track.title}」因版权限制无法播放（VIP/专辑曲目）`)
        setTimeout(() => setPlayError(null), 4000)
        return
      }
      setPlayError(null)
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
          audioRef.current.play().catch((err: Error) => {
            // 在线曲目播放失败（版权/网络）
            if (track.source === 'online' || track.source === 'netease') {
              setPlayError(`「${track.title}」播放失败，可能因版权限制或网络问题`)
              setTimeout(() => setPlayError(null), 4000)
            }
          })
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
      // 首次播放：从过滤后的第一首开始
      const list = filteredTracks()
      if (list.length > 0) play(list[0])
      return
    }
    if (isPlaying) pause()
    else play()
  }, [currentTrack, isPlaying, play, pause, filteredTracks])

  const next = useCallback(() => {
    // 优先在过滤列表内顺序播放
    const list = filteredTracks()
    if (list.length === 0) return
    let idx = list.findIndex((t) => t.id === currentTrack?.id) + 1
    if (idx >= list.length) idx = repeat === 'all' ? 0 : -1
    if (idx >= 0) play(list[idx])
    else pause()
  }, [filteredTracks, currentTrack, repeat, play, pause])

  const prev = useCallback(() => {
    if (tracks.length === 0) return
    // 播放超过3秒则回到开头
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }
    const list = filteredTracks()
    let idx = list.findIndex((t) => t.id === currentTrack?.id) - 1
    if (idx < 0) idx = repeat === 'all' ? list.length - 1 : 0
    play(list[idx])
  }, [tracks, filteredTracks, currentTrack, repeat, play])

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
    tracks, categories, regions, moods,
    play, pause, toggle, next, prev,
    setVolume, seek, toggleFavorite, setRepeat,
    panelOpen, setPanelOpen, libraryOpen, setLibraryOpen,
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    activeRegion, setActiveRegion,
    activeMood, setActiveMood,
    filteredTracks: filteredTracks(),
    searching, resultHint, onlineStatus, localCount, onlineCount,
    playError,
    autoplayPrompt,
  }

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* 移除 crossOrigin="anonymous"：SoundHelix 等公开音频源不返回 CORS 头，
          crossOrigin 会导致浏览器拒绝加载。普通播放不需要 CORS。 */}
      <audio ref={audioRef} preload="metadata" />
      <MusicPanel />
    </MusicContext.Provider>
  )
}

// ============ 控制面板 UI ============
function MusicPanel() {
  const m = useMusic()
  const [reduceMotion, setReduceMotion] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
  }, [])

  // Cmd/Ctrl+F 唤起搜索
  useEffect(() => {
    if (!m.panelOpen) return
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [m.panelOpen])

  if (!m.currentTrack && !m.panelOpen) {
    // 迷你入口按钮 + 自动播放提示
    return (
      <>
        {/* 自动播放提示气泡 */}
        {m.autoplayPrompt && (
          <div
            className="fixed bottom-6 left-20 z-[9997] px-3 py-2 rounded-md font-mono text-[11px] text-[#00ff9f] animate-pulse pointer-events-none"
            style={{
              background: 'rgba(0,255,159,0.08)',
              border: '1px solid rgba(0,255,159,0.3)',
              boxShadow: '0 0 20px rgba(0,255,159,0.15)',
            }}
          >
            {m.autoplayPrompt}
          </div>
        )}
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
      </>
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

        {/* 展开区：搜索 + 筛选 + 音乐库 + 历史 */}
        {m.panelOpen && (
          <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-t border-[#1a1a1a] max-h-[50vh] overflow-y-auto scrollbar-hide">
            <div className="max-w-4xl mx-auto p-4">
              {/* 搜索框 */}
              <div className="relative mb-3">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={m.searchQuery}
                  onChange={(e) => m.setSearchQuery(e.target.value)}
                  placeholder="搜索歌曲、歌手... (Ctrl+F)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm text-xs font-mono bg-[#111] border border-[#222] text-white placeholder:text-[#555] focus:border-[#00ff9f]/50 focus:outline-none transition-colors"
                />
                {m.searchQuery && (
                  <button
                    onClick={() => m.setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#ff0080] text-xs"
                    aria-label="清空搜索"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 心情推荐栏 */}
              {m.moods.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] text-[#555] mr-1">心情:</span>
                    <button
                      onClick={() => m.setActiveMood('all')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
                        m.activeMood === 'all'
                          ? 'bg-[#00ff9f]/10 text-[#00ff9f] border-[#00ff9f]/30'
                          : 'border-[#222] text-[#666] hover:border-[#00ff9f]/50 hover:text-[#00ff9f]'
                      }`}
                    >
                      全部
                    </button>
                    {m.moods.map((mo) => (
                      <button
                        key={mo.key}
                        onClick={() => m.setActiveMood(m.activeMood === mo.key ? 'all' : mo.key)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all flex items-center gap-1 ${
                          m.activeMood === mo.key
                            ? 'border-current'
                            : 'border-[#222] text-[#666] hover:border-current/50'
                        }`}
                        style={m.activeMood === mo.key ? { color: mo.color, background: `${mo.color}15`, borderColor: `${mo.color}50` } : {}}
                        title={mo.description}
                      >
                        <span>{mo.icon}</span>
                        <span>{mo.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 分类标签 + 地区 + 库/历史切换 */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {m.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { m.setActiveCategory(c.id); m.setLibraryOpen(false) }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
                        m.activeCategory === c.id
                          ? 'bg-[#00ff9f]/10 text-[#00ff9f] border-[#00ff9f]/30'
                          : 'border-[#222] text-[#666] hover:border-[#00ff9f]/50 hover:text-[#00ff9f]'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {/* 地区筛选 */}
                  <select
                    value={m.activeRegion}
                    onChange={(e) => m.setActiveRegion(e.target.value)}
                    className="px-2 py-1 rounded-full text-[10px] font-mono bg-[#111] border border-[#222] text-[#888] hover:border-[#00ff9f]/50 focus:outline-none cursor-pointer"
                    aria-label="地区筛选"
                  >
                    {m.regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
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

              {/* 搜索结果统计 */}
              {!m.libraryOpen && (
                <div className="mb-2 font-mono text-[10px] text-[#555] flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    {m.searching ? (
                      <span className="text-[#00d4ff] flex items-center gap-1">
                        <span className="animate-spin inline-block">⟳</span> 在线搜索中...
                      </span>
                    ) : m.searchQuery ? (
                      <>
                        <span>▸ 共 {m.filteredTracks.length} 首</span>
                        {m.localCount > 0 && <span className="text-[#00ff9f]">库内 {m.localCount}</span>}
                        {m.onlineCount > 0 && <span className="text-[#00d4ff]">在线 {m.onlineCount}</span>}
                        {m.onlineStatus === 'failed' && <span className="text-[#ff6699]">在线搜索失败</span>}
                      </>
                    ) : (
                      <span>▸ 共 {m.filteredTracks.length} 首</span>
                    )}
                  </span>
                  {(m.searchQuery || m.activeCategory !== 'all' || m.activeRegion !== 'all' || m.activeMood !== 'all') && (
                    <button
                      onClick={() => {
                        m.setSearchQuery('')
                        m.setActiveCategory('all')
                        m.setActiveRegion('all')
                        m.setActiveMood('all')
                      }}
                      className="text-[#666] hover:text-[#ff0080] transition-colors"
                    >
                      清空筛选
                    </button>
                  )}
                </div>
              )}

              {/* 播放错误提示 */}
              {m.playError && (
                <div className="mb-2 px-3 py-2 rounded-sm font-mono text-[10px] text-[#ff6699] flex items-center gap-2"
                  style={{ background: 'rgba(255,0,128,0.08)', border: '1px solid rgba(255,0,128,0.3)' }}>
                  <span>⚠</span>
                  <span className="flex-1">{m.playError}</span>
                </div>
              )}

              {/* 曲目列表 */}
              <div className="space-y-1">
                {(m.libraryOpen ? m.history : m.filteredTracks).map((track) => {
                  const isCurrent = m.currentTrack?.id === track.id
                  const isFav = m.favorites.includes(track.id)
                  const isOnline = track.source === 'online' || track.source === 'netease'
                  const isNetease = track.source === 'netease'
                  const notPlayable = isOnline && track.playable === false
                  return (
                    <button
                      key={track.id}
                      onClick={() => m.play(track)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-all group ${isCurrent ? 'bg-[#00ff9f]/5' : 'hover:bg-[#111]'} ${notPlayable ? 'opacity-50' : ''}`}
                    >
                      <span className="font-mono text-[10px] text-[#444] w-4 text-center shrink-0">
                        {isCurrent && m.isPlaying ? '▶' : (m.libraryOpen ? m.history.indexOf(track) + 1 : m.filteredTracks.indexOf(track) + 1)}
                      </span>
                      {/* 封面：在线曲目显示图片，本地显示色块 */}
                      {isOnline && track.cover && track.cover.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.cover} alt={track.title} className="w-6 h-6 rounded shrink-0 object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded shrink-0" style={{ background: track.cover }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-mono text-xs truncate ${isCurrent ? 'text-[#00ff9f]' : notPlayable ? 'text-[#888] line-through' : 'text-[#ccc]'}`}>
                          {track.title}
                          {notPlayable && <span className="ml-1 text-[#ff6699]">[VIP]</span>}
                        </p>
                        <p className="font-mono text-[10px] text-[#555] truncate">
                          {track.artist}
                          {track.album && <span className="text-[#444]"> · {track.album}</span>}
                        </p>
                      </div>
                      {/* 来源标签：网易云=完整播放 / iTunes=30秒试听 / 本地=库内 */}
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full shrink-0 hidden sm:inline"
                        style={{
                          background: isNetease ? 'rgba(168,85,247,0.15)' : isOnline ? 'rgba(0,212,255,0.1)' : 'rgba(0,255,159,0.1)',
                          color: isNetease ? '#a855f7' : isOnline ? '#00d4ff' : '#00ff9f',
                          border: `1px solid ${isNetease ? 'rgba(168,85,247,0.3)' : isOnline ? 'rgba(0,212,255,0.2)' : 'rgba(0,255,159,0.2)'}`,
                        }}
                      >
                        {isNetease ? '完整播放' : isOnline ? '30秒试听' : '库内'}
                      </span>
                      <span className="font-mono text-[10px] text-[#444] hidden sm:inline shrink-0">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); m.toggleFavorite(track.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
                {!m.libraryOpen && m.filteredTracks.length === 0 && !m.searching && (
                  <div className="text-center py-8 px-4">
                    <p className="font-mono text-xs text-[#555] mb-2">
                      {m.searchQuery ? `未找到与 "${m.searchQuery}" 相关的曲目` : '当前筛选条件下暂无曲目'}
                    </p>
                    {/* 明确区分"无匹配结果"与"功能异常" */}
                    {m.resultHint && (
                      <p className="font-mono text-[10px] text-[#ff6699]">{m.resultHint}</p>
                    )}
                    {m.searchQuery && m.onlineStatus === 'failed' && (
                      <p className="font-mono text-[10px] text-[#888] mt-1">
                        网易云/iTunes 在线搜索暂时不可用，仅显示本地库结果
                      </p>
                    )}
                    {m.searchQuery && m.onlineStatus === 'success' && (
                      <p className="font-mono text-[10px] text-[#666] mt-1">
                        已搜索本地库 + 网易云（完整播放）+ iTunes（30秒试听），确实无匹配结果。可尝试歌手英文名或拼音。
                      </p>
                    )}
                  </div>
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
