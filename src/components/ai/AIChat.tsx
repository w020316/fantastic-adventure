'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  error?: boolean
  streaming?: boolean
}

const QUICK_ACTIONS = [
  { label: '总结这篇文章', icon: '📝' },
  { label: '推荐相关内容', icon: '🔍' },
  { label: '解释代码', icon: '💻' },
  { label: '生成大纲', icon: '📋' },
]

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // 语音输入
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  // 语音输出（TTS）
  const [ttsEnabled, setTtsEnabled] = useState(false)
  // 历史持久化
  const HISTORY_KEY = 'cyberblog-ai-history'

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 首次加载：恢复历史
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Message[]
        // 仅恢复非流式/非加载态的完成消息
        setMessages(parsed.filter(m => !m.loading && !m.streaming))
      }
    } catch {}
  }, [])

  // 持久化历史（仅保留最近20条且非流式态）
  useEffect(() => {
    try {
      const toSave = messages
        .filter(m => !m.loading && !m.streaming && m.content)
        .slice(-20)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave))
    } catch {}
  }, [messages])

  // 快捷键唤醒：Ctrl/Cmd + K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // TTS：assistant 消息流式结束后朗读
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role === 'assistant' && !last.loading && !last.streaming && last.content && !last.error) {
      try {
        const utter = new SpeechSynthesisUtterance(last.content)
        utter.lang = 'zh-CN'
        utter.rate = 1.1
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utter)
      } catch {}
    }
  }, [messages, ttsEnabled])

  // 语音输入
  const toggleVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('当前浏览器不支持语音输入，请使用 Chrome/Edge')
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const rec = new SR()
    rec.lang = 'zh-CN'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setInput(prev => prev + text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }, [listening])

  function getContext(): string | undefined {
    if (typeof window === 'undefined') return undefined
    const pathname = window.location.pathname
    if (pathname.includes('/articles/')) {
      const h1 = document.querySelector('article h1')
      const excerpt = document.querySelector('article p')
      if (h1) {
        let ctx = `文章标题：${h1.textContent}`
        if (excerpt) ctx += `\n文章摘要：${excerpt.textContent?.slice(0, 200)}`
        return ctx
      }
    }
    return undefined
  }

  async function handleSend(text?: string) {
    const message = (text || input).trim()
    if (!message || sending) return
    setInput('')
    setSending(true)

    const userMsgId = Date.now().toString() + Math.random().toString(36).slice(2)
    const assistantMsgId = (Date.now() + 1).toString() + Math.random().toString(36).slice(2)

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: message },
      { id: assistantMsgId, role: 'assistant', content: '', loading: true },
    ])

    try {
      const context = getContext()
      const recentMessages = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, history: recentMessages }),
      })

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        if (!reader) return

        const decoder = new TextDecoder()
        let buffer = ''
        let fullContent = ''

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
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: fullContent, loading: false, streaming: true }
                      : m
                  )
                )
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, streaming: false }
              : m
          )
        )
      } else {
        const data = await response.json()
        if (data.error) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: `⚠ ${data.error}`, loading: false, error: true }
                : m
            )
          )
        } else if (data.reply) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: data.reply, loading: false }
                : m
            )
          )
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: '⚠ 网络错误，请稍后重试', loading: false, error: true }
            : m
        )
      )
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 z-[9999] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-45 ${
          isOpen ? 'rotate-45 scale-90' : ''
        }`}
        style={{
          background: isOpen
            ? 'var(--color-cyber-surface)'
            : 'linear-gradient(135deg, var(--color-cyber-neon), var(--color-cyber-blue))',
          border: isOpen ? '1px solid var(--color-cyber-border)' : 'none',
          boxShadow: isOpen
            ? 'none'
            : '0 0 15px rgba(0, 255, 159, 0.3), 0 0 30px rgba(0, 212, 255, 0.15)',
        }}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyber-text-dim)" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="12" rx="2" stroke="var(--color-cyber-bg)" strokeWidth="1.5" fill="none" />
            <circle cx="9" cy="11" r="1.5" fill="var(--color-cyber-bg)" />
            <circle cx="15" cy="11" r="1.5" fill="var(--color-cyber-bg)" />
            <path d="M8 17V19L12 17.5L16 19V17" stroke="var(--color-cyber-bg)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="1" x2="12" y2="5" stroke="var(--color-cyber-bg)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="1" r="1" fill="var(--color-cyber-bg)" />
          </svg>
        )}
      </button>

      <div
        className={`fixed z-[9998] transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } md:right-4 md:bottom-36 md:w-[380px] right-0 bottom-0 w-full`}
        style={{ maxHeight: 'min(500px, 70vh)' }}
      >
        <div
          className="glass-panel flex flex-col overflow-hidden md:rounded-md rounded-t-lg"
          style={{
            maxHeight: 'min(500px, 70vh)',
            height: 'min(500px, 70vh)',
            borderColor: 'var(--color-cyber-border)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--color-cyber-border)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-cyber-neon)' }}
              />
              <span className="neon-text-blue font-display text-sm tracking-wider">AI 助手</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTtsEnabled(v => !v)}
                className="w-6 h-6 flex items-center justify-center rounded transition-all"
                style={{
                  color: ttsEnabled ? 'var(--color-cyber-neon)' : 'var(--color-cyber-text-dim)',
                  border: `1px solid ${ttsEnabled ? 'rgba(0,255,159,0.3)' : 'var(--color-cyber-border)'}`,
                }}
                aria-label="语音播报切换"
                title={ttsEnabled ? '关闭语音播报' : '开启语音播报'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {ttsEnabled ? <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /> : <line x1="23" y1="9" x2="17" y2="15" />}
                </svg>
              </button>
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); try { localStorage.removeItem(HISTORY_KEY) } catch {} }}
                  className="w-6 h-6 flex items-center justify-center rounded transition-all hover:text-red-400"
                  style={{ color: 'var(--color-cyber-text-dim)', border: '1px solid var(--color-cyber-border)' }}
                  aria-label="清空对话"
                  title="清空对话历史"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,159,0.1), rgba(0,212,255,0.1))',
                    border: '1px solid rgba(0,255,159,0.2)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="12" rx="2" stroke="var(--color-cyber-neon)" strokeWidth="1.5" fill="none" />
                    <circle cx="9" cy="11" r="1.5" fill="var(--color-cyber-neon)" />
                    <circle cx="15" cy="11" r="1.5" fill="var(--color-cyber-neon)" />
                    <path d="M8 17V19L12 17.5L16 19V17" stroke="var(--color-cyber-neon)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-mono text-xs text-center" style={{ color: 'var(--color-cyber-text-dim)' }}>
                  {'> AI 助手已就绪_'}
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.label)}
                      disabled={sending}
                      className="text-left px-3 py-2 rounded-sm text-xs font-mono transition-all duration-200 hover:scale-[1.02] disabled:opacity-30"
                      style={{
                        background: 'var(--color-cyber-surface)',
                        border: '1px solid var(--color-cyber-border)',
                        color: 'var(--color-cyber-text-dim)',
                      }}
                      onMouseEnter={e => {
                        if (!sending) {
                          e.currentTarget.style.borderColor = 'var(--color-cyber-neon)'
                          e.currentTarget.style.color = 'var(--color-cyber-neon)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--color-cyber-border)'
                        e.currentTarget.style.color = 'var(--color-cyber-text-dim)'
                      }}
                    >
                      <span className="mr-1">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-sm text-sm font-mono leading-relaxed break-words`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, rgba(0,255,159,0.15), rgba(0,212,255,0.1))',
                          border: '1px solid rgba(0,255,159,0.3)',
                          color: 'var(--color-cyber-text)',
                        }
                      : msg.error
                        ? {
                            background: 'rgba(255,0,128,0.08)',
                            border: '1px solid rgba(255,0,128,0.3)',
                            color: '#ff6699',
                          }
                        : {
                            background: 'var(--color-cyber-surface)',
                            border: '1px solid var(--color-cyber-border)',
                            color: 'var(--color-cyber-text-dim)',
                          }
                  }
                >
                  {msg.loading ? (
                    <span className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                    </span>
                  ) : (
                    msg.content
                  )}
                  {msg.streaming && !msg.loading && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: 'var(--color-cyber-neon)' }} />
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {messages.length > 0 && (
            <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-hide shrink-0" style={{ borderColor: 'var(--color-cyber-border)' }}>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.label)}
                  disabled={sending}
                  className="shrink-0 px-2 py-1 rounded-sm text-[10px] font-mono transition-all duration-200 disabled:opacity-30"
                  style={{
                    background: 'var(--color-cyber-surface)',
                    border: '1px solid var(--color-cyber-border)',
                    color: 'var(--color-cyber-text-dim)',
                  }}
                  onMouseEnter={e => {
                    if (!sending) {
                      e.currentTarget.style.borderColor = 'var(--color-cyber-neon)'
                      e.currentTarget.style.color = 'var(--color-cyber-neon)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-cyber-border)'
                    e.currentTarget.style.color = 'var(--color-cyber-text-dim)'
                  }}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          )}

          <div
            className="px-3 py-3 border-t shrink-0 pb-[env(safe-area-inset-bottom)]"
            style={{ borderColor: 'var(--color-cyber-border)' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-200 shrink-0 ${listening ? 'animate-pulse' : ''}`}
                style={{
                  background: listening ? 'rgba(255,0,128,0.15)' : 'var(--color-cyber-surface)',
                  border: `1px solid ${listening ? 'rgba(255,0,128,0.5)' : 'var(--color-cyber-border)'}`,
                  color: listening ? '#ff6699' : 'var(--color-cyber-text-dim)',
                }}
                aria-label={listening ? '停止语音输入' : '语音输入'}
                title={listening ? '正在聆听...' : '语音输入'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={listening ? '正在聆听...' : '输入消息... (Ctrl+K 唤醒)'}
                disabled={sending}
                className="cyber-input flex-1 !py-2 !pl-3 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-200 disabled:opacity-30 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-cyber-neon), var(--color-cyber-blue))',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyber-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="font-mono text-[9px] mt-1.5 text-center" style={{ color: 'rgba(224,224,224,0.2)' }}>
              Powered by Agnes AI · Ctrl+K 唤醒
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
