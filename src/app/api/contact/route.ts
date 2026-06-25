import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { z } from 'zod'

// 内存限流（带大小上限与自动清理）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 小时
const RATE_LIMIT_MAX = 5 // 每小时最多 5 次
const RATE_LIMIT_MAX_SIZE = 1000 // 防止内存泄漏

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
  // honeypot：正常用户留空，机器人可能填写
  website: z.string().max(0).optional().or(z.literal('')),
})

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetTime) {
    // 达到上限时清理过期项，防止无限增长
    if (rateLimitMap.size > RATE_LIMIT_MAX_SIZE) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.resetTime) rateLimitMap.delete(key)
      }
    }
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// HTML 转义，防止邮件内容注入
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.safeParse(body)

    // honeypot 命中：静默成功，不入库（迷惑机器人）
    if (!validated.success && body?.website) {
      return NextResponse.json({ success: true, message: '消息已发送' })
    }
    if (!validated.success) {
      return NextResponse.json({ error: '请填写所有必填字段' }, { status: 400 })
    }

    const { name, email, message } = validated.data

    // 获取 IP 并限流
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: '提交过于频繁，请稍后再试' }, { status: 429 })
    }

    // 入库
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        ip: ip !== 'unknown' ? ip : null,
      },
    })

    // 发送邮件（如果配置了 Resend API Key）
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.CONTACT_EMAIL || '1181264839@qq.com',
          subject: `[XIAO/WU] 新的联系表单提交 - ${name}`,
          html: `
            <h2>新的联系表单提交</h2>
            <p><strong>姓名：</strong>${escapeHtml(name)}</p>
            <p><strong>邮箱：</strong>${escapeHtml(email)}</p>
            <p><strong>留言：</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color:#999;font-size:12px;">IP: ${escapeHtml(ip)}<br>时间: ${new Date().toISOString()}</p>
          `,
          replyTo: email,
        })
      } catch (emailError) {
        console.error('邮件发送失败（已入库）:', emailError)
        // 邮件发送失败不影响入库成功
      }
    }

    return NextResponse.json({
      success: true,
      message: '消息已发送',
      id: contactMessage.id,
    })
  } catch (error) {
    console.error('联系表单提交失败:', error)
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 })
  }
}

// 获取联系消息列表（仅管理员）
export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const status = searchParams.get('status')

    const where = status ? { status: status as 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED' } : {}
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ])

    return NextResponse.json({
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('获取联系消息失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
