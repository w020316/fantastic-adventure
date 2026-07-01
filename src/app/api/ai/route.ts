import { NextRequest } from 'next/server'

// 本地开发环境通过代理访问 Agnes AI（生产环境 Fly.io 直连，无需代理）
// 动态导入 undici ProxyAgent，避免生产环境 import 失败
// 使用 Function 包裹避免 TypeScript 静态检查 undici 类型声明
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

// 精简 system prompt，降低输入 token 数量以加快首字响应
const SYSTEM_PROMPT = `你是CyberBlog的AI助手。回答简洁，中文为主，技术术语保留英文。只回答技术相关问题。`

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
      if (entry.count > 10) return false
    }
  }

  // 每日上限（100次/天/IP）
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
      if (entry.count > 100) return false
    }
  }
  return true
}

// 文件内容提取：将上传的文本类文件转为可处理的字符串
// 支持纯文本、代码、markdown、json 等文本格式
function extractFileContent(fileName: string, fileContent: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const textExts = ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'h', 'css', 'scss', 'html', 'xml', 'yml', 'yaml', 'sh', 'sql', 'vue', 'php', 'rb', 'swift', 'kt']
  if (!textExts.includes(ext)) {
    return `[文件 ${fileName} 为非文本格式，已跳过内容提取]`
  }
  // 截断超长文件，避免超出 token 限制
  const truncated = fileContent.length > 4000 ? fileContent.slice(0, 4000) + '\n...[文件已截断]' : fileContent
  return `[用户上传文件: ${fileName}]\n\`\`\`\n${truncated}\n\`\`\``
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
    // 同时支持 application/json 和 multipart/form-data
    let message = ''
    let context: string | undefined
    let history: { role: 'user' | 'assistant'; content: string }[] | undefined
    let files: { name: string; content: string }[] = []

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // 文件上传场景
      const formData = await request.formData()
      message = (formData.get('message') as string)?.trim() || ''
      context = (formData.get('context') as string) || undefined
      const historyStr = formData.get('history') as string
      if (historyStr) {
        try { history = JSON.parse(historyStr) } catch {}
      }
      // 提取所有上传文件
      const entries = Array.from(formData.entries())
      for (const [key, value] of entries) {
        if (key.startsWith('file-') && value instanceof File) {
          // 限制单文件 1MB
          if (value.size > 1024 * 1024) {
            return new Response(JSON.stringify({ error: `文件 ${value.name} 超过 1MB 限制` }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          // 限制总文件数 5 个
          if (files.length >= 5) {
            return new Response(JSON.stringify({ error: '最多同时上传 5 个文件' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          const textContent = await value.text()
          files.push({ name: value.name, content: extractFileContent(value.name, textContent) })
        }
      }
    } else {
      const body = await request.json()
      message = (body.message || '').trim()
      context = body.context
      history = body.history
    }

    if (!message && files.length === 0) {
      return new Response(JSON.stringify({ error: '请输入消息或上传文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: '消息过长（上限 2000 字符）' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 组装消息体：system + 文件内容 + 历史 + 用户消息
    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\n当前上下文：${context}`
      : SYSTEM_PROMPT

    // 将文件内容作为额外 user 消息插入，让 AI 能感知文件
    const fileMessage = files.length > 0
      ? files.map((f) => f.content).join('\n\n')
      : ''

    const userContent = fileMessage
      ? `${fileMessage}\n\n用户问题：${message || '请分析以上文件内容'}`
      : message

    const messages = [
      { role: 'system' as const, content: systemContent },
      ...(history || []).slice(-4).map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userContent },
    ]

    const dispatcher = await getDispatcher()
    // Agnes AI 官方 endpoint：apihub.agnes-ai.com/v1（OpenAI 兼容）
    const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages,
        // 降低 max_tokens 加快响应速度（中文场景 400 足够覆盖大多数问答）
        max_tokens: 400,
        stream: true,
        // 略降 temperature 加快推理确定性
        temperature: 0.6,
      }),
      // undici 代理支持（本地开发走代理，生产环境 undefined 直连）
      ...(dispatcher ? { dispatcher: dispatcher as any } : {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agnes AI API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用，请稍后再试' }), {
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
    console.error('AI route error:', error instanceof Error ? `${error.name}: ${error.message}` : String(error))
    return new Response(JSON.stringify({ error: 'AI 服务异常，请稍后再试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
