import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `你是 CyberBlog 的 AI 助手，一个赛博朋克风格博客的智能助手。
你的性格：冷静、精准、略带赛博朋克风格，偶尔使用技术隐喻。
回答风格：简洁有力，善用代码示例，适当使用 → ◆ ▸ 等符号。
语言：中文为主，技术术语保留英文。
限制：只回答与技术、博客内容相关的问题，不回答政治、暴力等敏感话题。`

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

function checkRateLimit(ip: string): boolean {
  // 每分钟限流
  const globalMap = (globalThis as Record<string, unknown>).__aiRateLimit as Map<string, { count: number; resetAt: number }> | undefined
  if (!globalMap) {
    const map = new Map<string, { count: number; resetAt: number }>()
    ;(globalThis as Record<string, unknown>).__aiRateLimit = map
    const now = Date.now()
    map.set(ip, { count: 1, resetAt: now + 60000 })
  } else {
    const now = Date.now()
    const entry = globalMap.get(ip)
    if (!entry || now > entry.resetAt) {
      globalMap.set(ip, { count: 1, resetAt: now + 60000 })
    } else {
      entry.count++
      if (entry.count > 5) return false
    }
  }

  // 每日上限（50次/天/IP）
  const dailyMap = (globalThis as Record<string, unknown>).__aiDailyLimit as Map<string, { count: number; date: string }> | undefined
  const today = new Date().toISOString().split('T')[0]
  if (!dailyMap) {
    const map = new Map<string, { count: number; date: string }>()
    ;(globalThis as Record<string, unknown>).__aiDailyLimit = map
    map.set(ip, { count: 1, date: today })
  } else {
    const entry = dailyMap.get(ip)
    if (!entry || entry.date !== today) {
      dailyMap.set(ip, { count: 1, date: today })
    } else {
      entry.count++
      if (entry.count > 50) return false
    }
  }
  return true
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.AGNES_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI 服务暂未配置' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { message, context, history } = body as {
      message: string
      context?: string
      history?: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: '请输入消息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: '消息过长' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\n当前上下文：${context}`
      : SYSTEM_PROMPT

    const messages = [
      { role: 'system' as const, content: systemContent },
      ...(history || []).map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message.trim() },
    ]

    const response = await fetch('https://api.agnes-ai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages,
        max_tokens: 800,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agnes AI API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue

              const data = trimmed.slice(6)
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI route error:', error)
    return new Response(JSON.stringify({ error: 'AI 服务异常' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
