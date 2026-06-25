import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 简单的内存限流
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1小时
const RATE_LIMIT_MAX = 5 // 每小时最多5次

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // 验证必填字段
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 长度限制
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: '内容长度超出限制' },
        { status: 400 }
      )
    }

    // 获取 IP 并限流
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '提交过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    // 清理 rateLimitMap（防止内存泄漏）
    if (rateLimitMap.size > 1000) {
      const now = Date.now()
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
          rateLimitMap.delete(key)
        }
      }
    }

    // 入库
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        message: String(message).trim(),
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
          to: process.env.CONTACT_EMAIL || 'hello@xiaowu.dev',
          subject: `[XIAO/WU] 新的联系表单提交 - ${name}`,
          html: `
            <h2>新的联系表单提交</h2>
            <p><strong>姓名：</strong>${name}</p>
            <p><strong>邮箱：</strong>${email}</p>
            <p><strong>留言：</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color:#999;font-size:12px;">IP: ${ip}</br>时间: ${new Date().toISOString()}</p>
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
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取联系消息列表（仅管理员，后续加 auth）
export async function GET(request: NextRequest) {
  // 简单的管理员验证 - 后续接入 JWT
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('获取联系消息失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
