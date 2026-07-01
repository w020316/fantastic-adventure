import { NextRequest, NextResponse } from 'next/server'

// Agnes AI 图像生成 API（OpenAI 兼容接口）
// 文档：https://apihub.agnes-ai.com/v1/images/generations
// 模型：agnes-image-2.1-flash（文生图）

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

// 简易内存限流（每IP每分钟3次，每日20次）
function checkRateLimit(ip: string): boolean {
  const map = (globalThis as Record<string, unknown>).__imgRateLimit as Map<string, { count: number; resetAt: number; dailyCount: number; date: string }> | undefined
  const today = new Date().toISOString().split('T')[0]
  if (!map) {
    const m = new Map<string, { count: number; resetAt: number; dailyCount: number; date: string }>()
    ;(globalThis as Record<string, unknown>).__imgRateLimit = m
    m.set(ip, { count: 1, resetAt: Date.now() + 60000, dailyCount: 1, date: today })
    return true
  }
  const entry = map.get(ip)
  const now = Date.now()
  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + 60000, dailyCount: entry && entry.date === today ? entry.dailyCount + 1 : 1, date: today })
    if (entry && entry.date === today && entry.dailyCount + 1 > 20) return false
    return true
  }
  entry.count++
  if (entry.count > 3) return false
  if (entry.date === today) {
    entry.dailyCount++
    if (entry.dailyCount > 20) return false
  } else {
    entry.date = today
    entry.dailyCount = 1
  }
  return true
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
  }

  const apiKey = process.env.AGNES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 图像服务暂未配置' }, { status: 200 })
  }

  try {
    const body = await request.json()
    const { prompt, size = '1024x1024' } = body as { prompt: string; size?: string }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: '请输入图像描述' }, { status: 400 })
    }

    if (prompt.length > 1000) {
      return NextResponse.json({ error: '描述过长（上限 1000 字符）' }, { status: 400 })
    }

    // 允许的尺寸
    const allowedSizes = ['1024x1024', '1024x768', '768x1024', '512x512']
    const finalSize = allowedSizes.includes(size) ? size : '1024x1024'

    const dispatcher = await getDispatcher()
    const response = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'agnes-image-2.1-flash',
        prompt: prompt.trim(),
        size: finalSize,
        n: 1,
      }),
      ...(dispatcher ? { dispatcher: dispatcher as any } : {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agnes AI Image API error:', response.status, errorText)
      return NextResponse.json({ error: '图像生成失败，请稍后再试' }, { status: 200 })
    }

    const data = await response.json()
    // OpenAI 兼容响应：{ data: [{ url }] }
    const imageUrl = data.data?.[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: '未返回图像URL' }, { status: 200 })
    }

    return NextResponse.json({
      url: imageUrl,
      prompt: prompt.trim(),
      size: finalSize,
      model: 'agnes-image-2.1-flash',
    })
  } catch (error) {
    console.error('Image route error:', error instanceof Error ? `${error.name}: ${error.message}` : String(error))
    return NextResponse.json({ error: '图像服务异常' }, { status: 500 })
  }
}
