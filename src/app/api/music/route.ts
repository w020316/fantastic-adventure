import { NextResponse } from 'next/server'

// 音乐库数据
// 音频源使用公开免费的托管资源（SoundHelix 等），保证部署环境可稳定访问
// 架构上模拟第三方音乐 API 响应，便于后续替换为真实音乐服务
interface Track {
  id: string
  title: string
  artist: string
  category: string
  duration: number // 秒
  url: string
  cover: string // 封面占位色
}

const LIBRARY: Track[] = [
  // 电子 / 赛博朋克
  { id: 't1', title: 'Neon Pulse', artist: 'SoundHelix', category: 'electronic', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f' },
  { id: 't2', title: 'Data Stream', artist: 'SoundHelix', category: 'electronic', duration: 426, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff' },
  { id: 't3', title: 'Glitch City', artist: 'SoundHelix', category: 'electronic', duration: 304, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080' },
  { id: 't4', title: 'Synth Wave', artist: 'SoundHelix', category: 'electronic', duration: 297, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00' },
  // 氛围 / Lo-Fi
  { id: 't5', title: 'Midnight Code', artist: 'SoundHelix', category: 'ambient', duration: 391, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed' },
  { id: 't6', title: 'Quiet Terminal', artist: 'SoundHelix', category: 'ambient', duration: 358, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6' },
  { id: 't7', title: 'Deep Focus', artist: 'SoundHelix', category: 'ambient', duration: 412, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981' },
  // 节奏 / 动力
  { id: 't8', title: 'Overclock', artist: 'SoundHelix', category: 'beats', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b' },
  { id: 't9', title: 'High Voltage', artist: 'SoundHelix', category: 'beats', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444' },
  { id: 't10', title: 'Turbo Mode', artist: 'SoundHelix', category: 'beats', duration: 318, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899' },
  { id: 't11', title: 'Cyber Run', artist: 'SoundHelix', category: 'beats', duration: 401, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6' },
  { id: 't12', title: 'Final Compile', artist: 'SoundHelix', category: 'electronic', duration: 366, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4' },
]

const CATEGORIES = [
  { id: 'electronic', name: '电子', desc: '赛博朋克合成器与霓虹脉冲' },
  { id: 'ambient', name: '氛围', desc: '深夜编码与深度专注' },
  { id: 'beats', name: '节奏', desc: '高能节拍驱动开发' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const tracks = category && category !== 'all'
    ? LIBRARY.filter((t) => t.category === category)
    : LIBRARY

  return NextResponse.json({
    categories: CATEGORIES,
    tracks,
    total: tracks.length,
  })
}
