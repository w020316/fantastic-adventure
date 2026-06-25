'use client'

import { useState } from 'react'
import SectionReveal from '@/components/ui/SectionReveal'

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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // HoneyPot 检查
    if (form.website) {
      return
    }

    // 基础验证
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error')
      setErrorMessage('请填写所有必填字段')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setStatus('error')
      setErrorMessage('请输入有效的邮箱地址')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || '提交失败')
      }

      setStatus('success')
      setForm(initialState)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : '提交失败，请稍后重试')
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

              {/* 成功状态 */}
              {status === 'success' ? (
                <div className="bg-[#0a0a0a] rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-[#ccff00] rounded-full">
                    <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">消息已发送</h3>
                  <p className="text-[#888] text-sm mb-6">感谢你的留言，我会尽快回复你。</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-brand"
                  >
                    再发一条
                  </button>
                </div>
              ) : (
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

                  {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-full hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {status === 'submitting' ? (
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
              )}

              {/* 其他联系方式 */}
              <div className="mt-10 pt-8 border-t border-[#0a0a0a]/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div>
                  <p className="font-mono text-xs text-[#0a0a0a]/50 mb-1">EMAIL</p>
                  <a href="mailto:hello@xiaowu.dev" className="text-sm font-medium text-[#0a0a0a] hover:underline">
                    hello@xiaowu.dev
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
