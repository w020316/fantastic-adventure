'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import SectionReveal from '@/components/ui/SectionReveal'
import { contactSchema } from '@/lib/validations'

interface FormState {
  name: string
  email: string
  message: string
  // HoneyPot 字段（对用户隐藏，机器人会填充）
  website: string
}

const initialState: FormState = {
  name: '',
  email: '',
  message: '',
  website: '',
}

/**
 * Contact 区块 - 荧光绿大卡片 + 联系表单
 */
export default function ContactSection() {
  const [form, setForm] = useState<FormState>(initialState)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // HoneyPot 命中：静默成功，不实际提交（前端拦截 + 后端二次校验）
    // 必须在 schema 验证之前判断，避免暴露 honeypot 字段的存在
    if (form.website) {
      toast.success('消息已发送')
      setForm(initialState)
      return
    }

    // 使用 zod schema 验证
    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      toast.error(firstError?.message || '请填写所有必填字段')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 发送 website 字段，后端 honeypot 作为第二道防线（防绕过 JS 的机器人）
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          website: form.website,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || '提交失败')
      }

      toast.success('消息已发送')
      setForm(initialState)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionReveal>
          <div className="relative bg-[#ccff00] rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden">
            {/* 装饰元素 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0a0a0a]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0a0a0a]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <p className="font-mono text-xs tracking-[0.2em] text-[#0a0a0a]/60 uppercase mb-3">
                05 · CONTACT
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-4">
                有想法？聊聊吧
              </h2>
              <p className="text-[#0a0a0a]/70 text-sm sm:text-base mb-8 max-w-lg">
                无论是项目合作、技术交流还是招聘机会，欢迎给我留言。
                我会在 24 小时内回复你。
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                {/* HoneyPot 字段 */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute left-[-9999px] opacity-0"
                  aria-hidden="true"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-mono text-[#0a0a0a]/70 mb-1.5">
                      称呼 *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="你的名字"
                      className="w-full px-4 py-3 bg-[#0a0a0a]/5 border border-[#0a0a0a]/10 rounded-xl text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-mono text-[#0a0a0a]/70 mb-1.5">
                      邮箱 *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-[#0a0a0a]/5 border border-[#0a0a0a]/10 rounded-xl text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-mono text-[#0a0a0a]/70 mb-1.5">
                    需求描述 *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="简单描述你的需求或想法..."
                    className="w-full px-4 py-3 bg-[#0a0a0a]/5 border border-[#0a0a0a]/10 rounded-xl text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-full hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      发送中...
                    </>
                  ) : (
                    <>
                      发送消息
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* 其他联系方式 */}
              <div className="mt-10 pt-8 border-t border-[#0a0a0a]/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div>
                  <p className="font-mono text-xs text-[#0a0a0a]/50 mb-1">EMAIL</p>
                  <a href="mailto:1181264839@qq.com" className="text-sm font-medium text-[#0a0a0a] hover:underline">
                    1181264839@qq.com
                  </a>
                </div>
                <div>
                  <p className="font-mono text-xs text-[#0a0a0a]/50 mb-1">GITHUB</p>
                  <a
                    href="https://github.com/w020316"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0a0a0a] hover:underline"
                  >
                    @w020316
                  </a>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
