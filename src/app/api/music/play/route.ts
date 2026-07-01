import { NextResponse } from 'next/server'

// 网易云音乐播放重定向接口 + 搜索调试接口
// 流程：前端请求 /api/music/play?netease_id=<id>
//       → 服务端调用网易云outer/url获取302的Location
//       → 将http://替换为https://
//       → 302重定向到HTTPS的CDN URL（完整播放，非30秒预览）

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const neteaseId = searchParams.get('netease_id')
  const debug = searchParams.get('debug') // 调试模式

  // 调试模式：测试网易云搜索
  if (debug === 'search') {
    const keyword = searchParams.get('keyword') || '周杰伦'
    try {
      const body = `s=${encodeURIComponent(keyword)}&type=1&limit=5`
      const resp = await fetch('https://music.163.com/api/search/get', {
        method: 'POST',
        headers: {
          'Referer': 'https://music.163.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Real-IP': '116.25.146.37',
          'X-Forwarded-For': '116.25.146.37',
        },
        body,
      })
      const data = await resp.json()
      const songs = data?.result?.songs || []
      return NextResponse.json({
        keyword,
        body_sent: body,
        code: data.code,
        songCount: data.result?.songCount,
        songs: songs.map((s: any) => ({
          id: s.id,
          name: s.name,
          artist: s.artists?.map((a: any) => a.name).join(','),
          fee: s.fee,
        })),
      })
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'unknown' })
    }
  }

  if (!neteaseId) {
    return NextResponse.json({ error: '缺少 netease_id 参数' }, { status: 400 })
  }

  try {
    // 调用网易云outer/url接口（不跟随重定向，获取原始302）
    const response = await fetch(
      `https://music.163.com/song/media/outer/url?id=${neteaseId}.mp3`,
      {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com',
          'X-Real-IP': '116.25.146.37',
          'X-Forwarded-For': '116.25.146.37',
        },
      }
    )

    if (response.status === 302 || response.status === 301) {
      let location = response.headers.get('location') || ''
      if (!location) {
        return NextResponse.json({ error: '未获取到播放地址' }, { status: 502 })
      }
      if (location.startsWith('http://')) {
        location = 'https://' + location.slice(7)
      }
      return NextResponse.redirect(location, {
        status: 302,
        headers: { 'Cache-Control': 'public, max-age=3600' },
      })
    }

    if (response.status === 200) {
      return NextResponse.json({ error: '该歌曲暂时无法播放（可能因版权限制）' }, { status: 502 })
    }

    if (response.status === 404) {
      return NextResponse.json({ error: '歌曲不存在或已下架' }, { status: 404 })
    }

    return NextResponse.json(
      { error: `获取播放地址失败（HTTP ${response.status}）` },
      { status: 502 }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json(
      { error: `播放服务异常：${msg}` },
      { status: 500 }
    )
  }
}
