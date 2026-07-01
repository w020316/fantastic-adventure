import { NextRequest, NextResponse } from 'next/server'

// Agnes AI 视频生成 API（异步任务）
// 文档：https://apihub.agnes-ai.com/v1/videos
// 模型：agnes-video-v2.0（支持文生视频，异步轮询）

async function getDispatcher(): Promise<any> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (!proxyUrl) return undefined
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>
    const undici = await dynamicImport('undici')
    return new undici.ProxyAgent(proxyUrl)
  } catch {
    return undefined
  }
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

// 视频生成限流：每IP每分钟1次，每日5次
function checkRateLimit(ip: string): boolean {
  const map = (globalThis as Record<string, unknown>).__videoRateLimit as Map<string, { count: number; resetAt: number; dailyCount: number; date: string }> | undefined
  const today = new Date().toISOString().split('T')[0]
  if (!map) {
    const m = new Map<string, { count: number; resetAt: number; dailyCount: number; date: string }>()
    ;(globalThis as Record<string, unknown>).__videoRateLimit = m
    m.set(ip, { count: 1, resetAt: Date.now() + 60000, dailyCount: 1, date: today })
    return true
  }
  const entry = map.get(ip)
  const now = Date.now()
  if (!entry || now > entry.resetAt) {
    const newDailyCount = entry && entry.date === today ? entry.dailyCount + 1 : 1
    if (entry && entry.date === today && newDailyCount > 5) return false
    map.set(ip, { count: 1, resetAt: now + 60000, dailyCount: newDailyCount, date: today })
    return true
  }
  entry.count++
  if (entry.count > 1) return false
  if (entry.date === today) {
    entry.dailyCount++
    if (entry.dailyCount > 5) return false
  } else {
    entry.date = today
    entry.dailyCount = 1
  }
  return true
}

// POST: 提交视频生成任务
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: '视频生成请求过于频繁（每分钟1次，每日5次）' }, { status: 429 })
  }

  const apiKey = process.env.AGNES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 视频服务暂未配置' }, { status: 200 })
  }

  try {
    const body = await request.json()
    const {
      prompt,
      width = 1152,
      height = 768,
      num_frames = 121,
      frame_rate = 4,
    } = body as {
      prompt: string
      width?: number
      height?: number
      num_frames?: number
      frame_rate?: number
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: '请输入视频描述' }, { status: 400 })
    }

    if (prompt.length > 1000) {
      return NextResponse.json({ error: '描述过长（上限 1000 字符）' }, { status: 400 })
    }

    // 参数校验：num_frames 格式必须为 8n+1
    const frames = Math.max(9, Math.min(441, num_frames))
    const adjustedFrames = Math.floor((frames - 1) / 8) * 8 + 1
    const fps = Math.max(1, Math.min(60, frame_rate))

    const dispatcher = await getDispatcher()
    const response = await fetch('https://apihub.agnes-ai.com/v1/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'agnes-video-v2.0',
        prompt: prompt.trim(),
        width,
        height,
        num_frames: adjustedFrames,
        frame_rate: fps,
      }),
      ...(dispatcher ? { dispatcher: dispatcher as any } : {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agnes AI Video API error:', response.status, errorText)
      return NextResponse.json({ error: '视频生成任务提交失败，请稍后再试' }, { status: 200 })
    }

    const data = await response.json()
    const taskId = data.task_id || data.id
    if (!taskId) {
      return NextResponse.json({ error: '未返回任务ID', raw: data }, { status: 200 })
    }

    // 预估时长：frames / fps
    const estimatedSeconds = Math.ceil(adjustedFrames / fps)

    return NextResponse.json({
      task_id: taskId,
      status: 'pending',
      prompt: prompt.trim(),
      estimated_duration: estimatedSeconds,
      model: 'agnes-video-v2.0',
      params: { width, height, num_frames: adjustedFrames, frame_rate: fps },
    })
  } catch (error) {
    console.error('Video route error:', error instanceof Error ? `${error.name}: ${error.message}` : String(error))
    return NextResponse.json({ error: '视频服务异常' }, { status: 500 })
  }
}

// GET: 查询视频生成任务状态
export async function GET(request: NextRequest) {
  const apiKey = process.env.AGNES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 视频服务暂未配置' }, { status: 200 })
  }

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('task_id')

  if (!taskId) {
    return NextResponse.json({ error: '缺少 task_id 参数' }, { status: 400 })
  }

  try {
    const dispatcher = await getDispatcher()
    const response = await fetch(`https://apihub.agnes-ai.com/v1/videos/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      ...(dispatcher ? { dispatcher: dispatcher as any } : {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agnes AI Video status error:', response.status, errorText)
      return NextResponse.json({ error: '查询任务状态失败' }, { status: 200 })
    }

    const data = await response.json()
    const status = data.status || 'unknown'
    const videoUrl = data.video_url || data.url || data.result?.video_url

    return NextResponse.json({
      task_id: taskId,
      status, // pending / processing / completed / failed
      video_url: status === 'completed' ? videoUrl : undefined,
      raw: data,
    })
  } catch (error) {
    console.error('Video status route error:', error instanceof Error ? `${error.name}: ${error.message}` : String(error))
    return NextResponse.json({ error: '查询服务异常' }, { status: 500 })
  }
}
