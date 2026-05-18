'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  typing?: boolean
}

const QUICK_ACTIONS = [
  { label: '总结这篇文章', icon: '📝' },
  { label: '推荐相关内容', icon: '🔍' },
  { label: '解释代码', icon: '💻' },
  { label: '生成大纲', icon: '📋' },
]

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('总结') || lower.includes('摘要')) {
    return '📝 这篇文章主要探讨了...（AI 功能开发中，即将支持智能摘要生成）'
  }
  if (lower.includes('推荐') || lower.includes('相关')) {
    return '🔍 基于你的兴趣，推荐查看...（AI 功能开发中，即将支持智能推荐）'
  }
  if (lower.includes('代码') || lower.includes('解释')) {
    return '💻 这段代码的核心逻辑是...（AI 功能开发中，即将支持代码解释）'
  }
  if (lower.includes('大纲') || lower.includes('目录')) {
    return '📋 文章大纲如下...（AI 功能开发中，即将支持大纲生成）'
  }
  return '🤖 我是 CyberBlog AI 助手！目前我还在学习中，即将支持智能对话、文章摘要、代码解释等功能。敬请期待！'
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  function addMessage(role: 'user' | 'assistant', content: string, typing = false) {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    setMessages(prev => [...prev, { id, role, content, typing }])
    return id
  }

  function simulateTyping(fullText: string) {
    setIsTyping(true)
    const msgId = addMessage('assistant', '', true)
    let charIndex = 0

    function typeChar() {
      if (charIndex >= fullText.length) {
        setMessages(prev =>
          prev.map(m => (m.id === msgId ? { ...m, content: fullText, typing: false } : m))
        )
        setIsTyping(false)
        return
      }
      charIndex++
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId ? { ...m, content: fullText.slice(0, charIndex) } : m
        )
      )
      typingTimerRef.current = setTimeout(typeChar, 30 + Math.random() * 30)
    }

    typingTimerRef.current = setTimeout(typeChar, 400)
  }

  function handleSend(text?: string) {
    const message = (text || input).trim()
    if (!message || isTyping) return
    setInput('')
    addMessage('user', message)
    const response = getAIResponse(message)
    simulateTyping(response)
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
        className={`fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-45 ${
          isOpen ? 'rotate-45 scale-90' : 'animate-pulse'
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
        className={`fixed z-50 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } md:right-4 md:bottom-36 md:w-[380px] right-0 bottom-0 w-full`}
        style={{ maxHeight: '500px' }}
      >
        <div
          className="glass-panel flex flex-col overflow-hidden md:rounded-md rounded-none"
          style={{
            maxHeight: '500px',
            height: '500px',
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
            <span className="font-mono text-[10px] tracking-wider" style={{ color: 'var(--color-cyber-text-dim)' }}>
              v0.1.BETA
            </span>
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
                      className="text-left px-3 py-2 rounded-sm text-xs font-mono transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        background: 'var(--color-cyber-surface)',
                        border: '1px solid var(--color-cyber-border)',
                        color: 'var(--color-cyber-text-dim)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--color-cyber-neon)'
                        e.currentTarget.style.color = 'var(--color-cyber-neon)'
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
                  className={`max-w-[85%] px-3 py-2 rounded-sm text-sm font-mono leading-relaxed ${
                    msg.role === 'user' ? '' : ''
                  }`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, rgba(0,255,159,0.15), rgba(0,212,255,0.1))',
                          border: '1px solid rgba(0,255,159,0.3)',
                          color: 'var(--color-cyber-text)',
                        }
                      : {
                          background: 'var(--color-cyber-surface)',
                          border: '1px solid var(--color-cyber-border)',
                          color: 'var(--color-cyber-text-dim)',
                        }
                  }
                >
                  {msg.content}
                  {msg.typing && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: 'var(--color-cyber-neon)' }} />
                  )}
                </div>
              </div>
            ))}

            {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-sm text-xs font-mono"
                  style={{
                    background: 'var(--color-cyber-surface)',
                    border: '1px solid var(--color-cyber-border)',
                    color: 'var(--color-cyber-text-dim)',
                  }}
                >
                  <span className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length > 0 && (
            <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-hide shrink-0" style={{ borderColor: 'var(--color-cyber-border)' }}>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.label)}
                  disabled={isTyping}
                  className="shrink-0 px-2 py-1 rounded-sm text-[10px] font-mono transition-all duration-200 disabled:opacity-30"
                  style={{
                    background: 'var(--color-cyber-surface)',
                    border: '1px solid var(--color-cyber-border)',
                    color: 'var(--color-cyber-text-dim)',
                  }}
                  onMouseEnter={e => {
                    if (!isTyping) {
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
            className="px-3 py-3 border-t shrink-0"
            style={{ borderColor: 'var(--color-cyber-border)' }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                disabled={isTyping}
                className="cyber-input flex-1 !py-2 !pl-3 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-200 disabled:opacity-30"
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
          </div>
        </div>
      </div>
    </>
  )
}
