declare global {
  var __aiRateLimit: Map<string, number[]> | undefined
}

import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI 服务未配置', reply: 'AI 助手暂未配置，请联系管理员。' },
        { status: 200 }
      )
    }

    const body = await request.json()
    const { message, context } = body as { message: string; context?: string }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: '消息过长' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const now = Date.now()
    if (!globalThis.__aiRateLimit) {
      globalThis.__aiRateLimit = new Map<string, number[]>()
    }
    const rateMap = globalThis.__aiRateLimit as Map<string, number[]>
    const userRequests = rateMap.get(ip) || []
    const recentRequests = userRequests.filter(t => now - t < 60000)
    if (recentRequests.length >= 10) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试', reply: '请求过于频繁，请稍后再试。' },
        { status: 429 }
      )
    }
    recentRequests.push(now)
    rateMap.set(ip, recentRequests)

    const systemPrompt = `你是 CyberBlog AI 助手，一个赛博朋克风格的技术博客助手。你的特点：
1. 回答简洁专业，带有轻微的赛博朋克风格
2. 擅长技术问题解答、代码解释、文章摘要
3. 使用中文回答
4. 偶尔使用技术术语和编程隐喻
5. 回答开头可以用 > 符号表示系统输出风格${context ? `\n\n当前页面上下文：${context}` : ''}`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'AI 服务暂时不可用', reply: 'AI 服务暂时不可用，请稍后再试。' },
        { status: 200 }
      )
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || '抱歉，我无法理解你的问题。'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI route error:', error)
    return NextResponse.json(
      { error: '服务异常', reply: '服务异常，请稍后再试。' },
      { status: 200 }
    )
  }
}
