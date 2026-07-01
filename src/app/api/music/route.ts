import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// 音乐库数据
// 架构：数据库 MusicTrack 表（完整可播放曲目） + iTunes在线搜索（30秒预览）
// 数据库连接失败时 fallback 到内存预置库（保证可用性）

interface Track {
  id: string
  title: string
  artist: string
  category: string
  region: 'cn' | 'intl'
  duration: number
  url: string
  cover: string
  source: 'local' | 'online'
  onlineId?: string
  album?: string
  playable?: boolean
  mood?: string
  isHot?: boolean
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

// ============ 内存 fallback 库（数据库不可用时使用）============
const FALLBACK_LIBRARY: Track[] = [
  { id: 'cn1', title: '夜曲', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', playable: true, mood: 'sad,passionate', isHot: true },
  { id: 'cn2', title: '青花瓷', artist: '周杰伦', category: 'pop', region: 'cn', duration: 238, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', playable: true, mood: 'passionate,relaxed', isHot: true },
  { id: 'cn3', title: '七里香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 299, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', playable: true, mood: 'passionate,happy', isHot: true },
  { id: 'cn4', title: '稻香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', playable: true, mood: 'happy,relaxed', isHot: true },
  { id: 'cn5', title: '后来', artist: '刘若英', category: 'pop', region: 'cn', duration: 286, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', playable: true, mood: 'sad,passionate', isHot: true },
  { id: 'cn6', title: '遇见', artist: '孙燕姿', category: 'pop', region: 'cn', duration: 255, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', playable: true, mood: 'passionate,relaxed', isHot: true },
  { id: 'cn7', title: '光年之外', artist: '邓紫棋', category: 'pop', region: 'cn', duration: 235, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', playable: true, mood: 'energetic,passionate', isHot: true },
  { id: 'cn8', title: '起风了', artist: '买辣椒也用券', category: 'pop', region: 'cn', duration: 325, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', playable: true, mood: 'passionate,sad', isHot: true },
  { id: 'cn9', title: '赛博东风', artist: 'ElectronCN', category: 'electronic', region: 'cn', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', playable: true, mood: 'energetic,focused', isHot: false },
  { id: 'cn10', title: '霓虹长城', artist: 'CyberHan', category: 'electronic', region: 'cn', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899', source: 'local', playable: true, mood: 'energetic,focused', isHot: false },
  { id: 'cn11', title: '锦鲤抄', artist: '银临', category: 'guofeng', region: 'cn', duration: 268, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6', source: 'local', playable: true, mood: 'relaxed,passionate', isHot: false },
  { id: 'cn12', title: '凉凉', artist: '张碧晨', category: 'guofeng', region: 'cn', duration: 295, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', playable: true, mood: 'sad,relaxed', isHot: false },
  { id: 'cn13', title: '千千阙歌', artist: '陈慧娴', category: 'pop', region: 'cn', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover: '#f97316', source: 'local', playable: true, mood: 'sad,passionate', isHot: false },
  { id: 'cn14', title: '海阔天空', artist: 'Beyond', category: 'rock', region: 'cn', duration: 326, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover: '#84cc16', source: 'local', playable: true, mood: 'energetic,passionate', isHot: true },
  { id: 'cn15', title: '红玫瑰', artist: '陈奕迅', category: 'pop', region: 'cn', duration: 278, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover: '#a855f7', source: 'local', playable: true, mood: 'passionate,sad', isHot: false },
  { id: 'cn16', title: '匆匆那年', artist: '王菲', category: 'pop', region: 'cn', duration: 302, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', cover: '#6366f1', source: 'local', playable: true, mood: 'sad,relaxed', isHot: false },
  { id: 'intl1', title: 'Neon Pulse', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', playable: true, mood: 'energetic,focused', isHot: true },
  { id: 'intl2', title: 'Data Stream', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 426, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', playable: true, mood: 'focused,energetic', isHot: true },
  { id: 'intl3', title: 'Glitch City', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 304, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', playable: true, mood: 'energetic', isHot: false },
  { id: 'intl4', title: 'Synth Wave', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 297, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', playable: true, mood: 'focused,relaxed', isHot: false },
  { id: 'intl5', title: 'Midnight Code', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 391, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', playable: true, mood: 'focused,relaxed', isHot: true },
  { id: 'intl6', title: 'Quiet Terminal', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 358, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', playable: true, mood: 'relaxed,focused', isHot: false },
  { id: 'intl7', title: 'Deep Focus', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 412, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', playable: true, mood: 'focused', isHot: true },
  { id: 'intl8', title: 'Overclock', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', playable: true, mood: 'energetic', isHot: false },
  { id: 'intl9', title: 'High Voltage', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', playable: true, mood: 'energetic,happy', isHot: false },
  { id: 'intl10', title: 'Turbo Mode', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 318, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899', source: 'local', playable: true, mood: 'energetic', isHot: false },
  { id: 'intl11', title: 'Cyber Run', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 401, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6', source: 'local', playable: true, mood: 'energetic,focused', isHot: false },
  { id: 'intl12', title: 'Final Compile', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 366, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', playable: true, mood: 'focused,happy', isHot: false },
]

const CATEGORIES = [
  { id: 'all', name: '全部', desc: '所有曲目' },
  { id: 'pop', name: '流行', desc: '华语流行热榜' },
  { id: 'electronic', name: '电子', desc: '赛博朋克合成器与霓虹脉冲' },
  { id: 'ambient', name: '氛围', desc: '深夜编码与深度专注' },
  { id: 'beats', name: '节奏', desc: '高能节拍驱动开发' },
  { id: 'guofeng', name: '古风', desc: '国风雅韵' },
  { id: 'rock', name: '摇滚', desc: '热血经典' },
]

const REGIONS = [
  { id: 'all', name: '全部地区' },
  { id: 'cn', name: '国内' },
  { id: 'intl', name: '国际' },
]

// 默认心情配置（数据库不可用时 fallback）
const FALLBACK_MOODS = [
  { key: 'happy', name: '开心', icon: '😊', color: '#ffe600', description: '欢快明亮，让心情飞扬' },
  { key: 'relaxed', name: '放松', icon: '🌿', color: '#00ff9f', description: '舒缓悠扬，身心舒展' },
  { key: 'sad', name: '伤感', icon: '🌧', color: '#00d4ff', description: '低吟浅唱，治愈心灵' },
  { key: 'energetic', name: '激情', icon: '⚡', color: '#ff0080', description: '热血澎湃，能量满满' },
  { key: 'focused', name: '专注', icon: '🎯', color: '#ccff00', description: '深度聚焦，心流状态' },
  { key: 'passionate', name: '浪漫', icon: '💜', color: '#a855f7', description: '温柔缱绻，情意绵绵' },
]

// ============ 从数据库读取音乐库（含 fallback）============
async function getLibraryFromDB(): Promise<Track[] | null> {
  try {
    const rows = await prisma.musicTrack.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
    if (rows.length === 0) return null
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      category: r.category,
      region: r.region as 'cn' | 'intl',
      duration: r.duration,
      url: r.url,
      cover: r.cover,
      source: r.source as 'local' | 'online',
      album: r.album || undefined,
      playable: r.playable,
      mood: r.mood || undefined,
      isHot: r.isHot,
    }))
  } catch {
    return null
  }
}

async function getMoodsFromDB() {
  try {
    const rows = await prisma.mood.findMany({ orderBy: { order: 'asc' } })
    if (rows.length === 0) return FALLBACK_MOODS
    return rows.map((r) => ({
      key: r.key,
      name: r.name,
      icon: r.icon,
      color: r.color,
      description: r.description || '',
    }))
  } catch {
    return FALLBACK_MOODS
  }
}

// ============ iTunes 在线搜索（30秒预览）============
async function getDispatcher(): Promise<any> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (!proxyUrl) return undefined
  try {
    const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>
    const undici = await dynamicImport('undici')
    return new undici.ProxyAgent(proxyUrl)
  } catch {
    return undefined
  }
}

interface CacheEntry {
  data: Track[]
  ts: number
}
const searchCache = new Map<string, CacheEntry>()
const CACHE_TTL = 10 * 60 * 1000

interface ITunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  trackTimeMillis: number
  previewUrl: string
  artworkUrl100: string
}

async function searchOnline(keyword: string, limit = 30): Promise<{ tracks: Track[]; error?: string }> {
  const cacheKey = keyword.trim().toLowerCase()
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { tracks: cached.data }
  }

  try {
    const dispatcher = await getDispatcher()
    const params = new URLSearchParams()
    params.append('term', keyword)
    params.append('media', 'music')
    params.append('entity', 'song')
    params.append('limit', String(limit))
    params.append('country', 'cn')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const fetchOptions: RequestInit & { dispatcher?: any } = {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    }
    if (dispatcher) fetchOptions.dispatcher = dispatcher

    const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      return { tracks: [], error: `在线搜索服务不可用 (${response.status})` }
    }

    const data = await response.json()
    const songs: ITunesTrack[] = data?.results || []

    // 仅保留有预览URL的曲目（30秒官方试听，始终可播放）
    const tracks: Track[] = songs
      .filter((song) => song.previewUrl)
      .map((song) => ({
        id: `online_${song.trackId}`,
        title: song.trackName || '未知',
        artist: song.artistName || '未知艺术家',
        category: 'online',
        region: 'cn',
        duration: Math.floor((song.trackTimeMillis || 0) / 1000),
        url: song.previewUrl,
        cover: song.artworkUrl100 || '#888',
        source: 'online',
        onlineId: String(song.trackId),
        album: song.collectionName,
        playable: true, // 30秒预览始终可播放
      }))

    searchCache.set(cacheKey, { data: tracks, ts: Date.now() })
    return { tracks }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    if (msg.includes('abort') || msg.includes('timeout')) {
      return { tracks: [], error: '在线搜索超时，请稍后重试' }
    }
    return { tracks: [], error: `在线搜索失败：${msg}` }
  }
}

// ============ GET：公开接口 ============
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  const region = searchParams.get('region') || 'all'
  const mood = searchParams.get('mood') || 'all'
  const hot = searchParams.get('hot') // '1' 时仅返回热门
  const q = (searchParams.get('q') || '').trim()

  // 加载本地库（数据库优先，fallback 到内存）
  const LIBRARY = (await getLibraryFromDB()) || FALLBACK_LIBRARY
  const moods = await getMoodsFromDB()

  // ========== 场景1：无搜索关键词 - 返回本地库（可按心情/分类/地区/热门过滤）==========
  if (!q) {
    let tracks = LIBRARY
    if (category !== 'all') tracks = tracks.filter((t) => t.category === category)
    if (region !== 'all') tracks = tracks.filter((t) => t.region === region)
    if (hot === '1') tracks = tracks.filter((t) => t.isHot)
    // 心情过滤：曲目 mood 字段包含所选心情 key
    if (mood !== 'all') {
      tracks = tracks.filter((t) => t.mood && t.mood.split(',').includes(mood))
    }

    return NextResponse.json({
      categories: CATEGORIES,
      regions: REGIONS,
      moods,
      tracks,
      total: tracks.length,
      query: { category, region, mood, hot, q: null },
      source: 'local',
      onlineStatus: 'idle',
    })
  }

  // ========== 场景2：有关键词 - 本地匹配 + 在线搜索合并 ==========
  const qLower = q.toLowerCase()
  let localMatches = LIBRARY.filter(
    (t) =>
      t.title.toLowerCase().includes(qLower) ||
      t.artist.toLowerCase().includes(qLower) ||
      t.category.toLowerCase().includes(qLower)
  )
  if (category !== 'all') localMatches = localMatches.filter((t) => t.category === category)
  if (region !== 'all') localMatches = localMatches.filter((t) => t.region === region)
  if (mood !== 'all') localMatches = localMatches.filter((t) => t.mood && t.mood.split(',').includes(mood))

  const onlineResult = await searchOnline(q, 30)
  let onlineTracks = onlineResult.tracks
  const rawOnlineCount = onlineTracks.length

  // 精准度过滤：标题或歌手必须包含关键词
  const keywords = qLower.split(/\s+/).filter(Boolean)
  onlineTracks = onlineTracks.filter((t) => {
    const titleLower = t.title.toLowerCase()
    const artistLower = t.artist.toLowerCase()
    return keywords.some((kw) => titleLower.includes(kw) || artistLower.includes(kw))
  })

  if (region !== 'all') {
    onlineTracks = region === 'cn' ? onlineTracks : []
  }

  // 合并：本地优先，去重
  const seen = new Set<string>()
  const merged: Track[] = []
  for (const t of localMatches) {
    const key = `${t.title}_${t.artist}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(t)
    }
  }
  for (const t of onlineTracks) {
    const key = `${t.title}_${t.artist}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(t)
    }
  }

  return NextResponse.json({
    categories: CATEGORIES,
    regions: REGIONS,
    moods,
    tracks: merged,
    total: merged.length,
    localCount: localMatches.length,
    onlineCount: onlineTracks.length,
    rawOnlineCount,
    query: { category, region, mood, q },
    source: 'mixed',
    onlineStatus: onlineResult.error ? 'failed' : 'success',
    onlineError: onlineResult.error,
    resultHint: merged.length === 0
      ? (onlineResult.error
          ? `搜索异常：${onlineResult.error}（已为你查找本地库，同样无匹配）`
          : rawOnlineCount > 0
            ? `确实未找到与"${q}"精确匹配的音乐（iTunes ${rawOnlineCount}条模糊结果已过滤）`
            : `确实未找到与"${q}"匹配的音乐`)
      : null,
  })
}

// ============ POST：管理接口 - 新增曲目 ============
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const body = await request.json()
    const { title, artist, category, region, duration, url, cover, album, mood, isHot, source, playable } = body

    if (!title || !artist || !url) {
      return NextResponse.json({ error: '标题、歌手、播放URL为必填项' }, { status: 400 })
    }

    const track = await prisma.musicTrack.create({
      data: {
        title: String(title),
        artist: String(artist),
        category: String(category || 'pop'),
        region: String(region || 'cn'),
        duration: Number(duration) || 0,
        url: String(url),
        cover: String(cover || '#00ff9f'),
        album: album ? String(album) : null,
        mood: mood ? String(mood) : null,
        isHot: Boolean(isHot),
        source: String(source || 'local'),
        playable: playable !== false,
      },
    })

    return NextResponse.json({ track })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ error: `创建失败：${msg}` }, { status: 500 })
  }
}
