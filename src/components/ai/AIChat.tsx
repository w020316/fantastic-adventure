'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Mode = 'chat' | 'image' | 'video'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  error?: boolean
  streaming?: boolean
  attachments?: string[] // 文件名列表
  imageUrl?: string // 图像URL
  videoUrl?: string // 视频URL
  videoStatus?: string // 视频任务状态
  taskId?: string // 视频任务ID
}

interface UploadedFile {
  name: string
  size: number
  file: File
}

const QUICK_ACTIONS = [
  { label: '总结这篇文章', icon: '📝' },
  { label: '推荐相关内容', icon: '🔍' },
  { label: '解释代码', icon: '💻' },
  { label: '生成大纲', icon: '📋' },
]

const IMAGE_PRESETS = [
  '赛博朋克城市夜景，霓虹灯光，雨后倒影',
  '极简几何插画，荧光绿配色',
  '一只机械熊猫在数据中心前沉思',
  '未来主义太空站，宇宙星空背景',
]

const VIDEO_PRESETS = [
  '夜色城市中的飞行汽车，霓虹灯光掠过',
  '海边日落延时摄影，云层流动',
  '机械齿轮缓缓转动，蒸汽朋克风格',
]

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // 语音输入
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  // 语音输出（TTS）
  const [ttsEnabled, setTtsEnabled] = useState(false)
  // 文件上传
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 图像生成
  const [imageSize, setImageSize] = useState('1024x1024')
  // 视频生成
  const [videoPolling, setVideoPolling] = useState<string | null>(null) // taskId
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
        setMessages(parsed.filter(m => !m.loading && !m.streaming))
      }
    } catch {}
  }, [])

  // 持久化历史
  useEffect(() => {
    try {
      const toSave = messages
        .filter(m => !m.loading && !m.streaming && (m.content || m.imageUrl || m.videoUrl))
        .slice(-30)
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

  // TTS
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

  // 视频任务轮询
  useEffect(() => {
    if (!videoPolling) return
    let cancelled = false
    const poll = async () => {
      try {
        const resp = await fetch(`/api/ai/video?task_id=${videoPolling}`)
        const data = await resp.json()
        if (cancelled) return
        if (data.status === 'completed' && data.video_url) {
          setMessages(prev => prev.map(m =>
            m.taskId === videoPolling
              ? { ...m, videoUrl: data.video_url, videoStatus: 'completed', loading: false }
              : m
          ))
          setVideoPolling(null)
        } else if (data.status === 'failed') {
          setMessages(prev => prev.map(m =>
            m.taskId === videoPolling
              ? { ...m, content: '⚠ 视频生成失败', videoStatus: 'failed', loading: false, error: true }
              : m
          ))
          setVideoPolling(null)
        } else {
          setMessages(prev => prev.map(m =>
            m.taskId === videoPolling
              ? { ...m, videoStatus: data.status }
              : m
          ))
        }
      } catch {}
    }
    const interval = setInterval(poll, 5000)
    poll() // 立即执行一次
    return () => { cancelled = true; clearInterval(interval) }
  }, [videoPolling])

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

  // 文件选择处理
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      if (file.size > 1024 * 1024) {
        alert(`文件 ${file.name} 超过 1MB 限制`)
        continue
      }
      if (uploadedFiles.length >= 5) {
        alert('最多同时上传 5 个文件')
        break
      }
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, file }])
    }
    // 清空 input 允许重复选择同一文件
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(idx: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // 文本对话发送（支持文件上传）
  async function handleSendChat(text?: string) {
    const message = (text || input).trim()
    if ((!message && uploadedFiles.length === 0) || sending) return
    setInput('')
    setSending(true)

    const userMsgId = Date.now().toString() + Math.random().toString(36).slice(2)
    const assistantMsgId = (Date.now() + 1).toString() + Math.random().toString(36).slice(2)
    const fileNames = uploadedFiles.map(f => f.name)

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: message || '(已上传文件)', attachments: fileNames.length > 0 ? fileNames : undefined },
      { id: assistantMsgId, role: 'assistant', content: '', loading: true },
    ])

    try {
      const context = getContext()
      const recentMessages = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content,
      }))

      let response: Response
      if (uploadedFiles.length > 0) {
        // multipart/form-data 上传
        const formData = new FormData()
        formData.append('message', message)
        if (context) formData.append('context', context)
        formData.append('history', JSON.stringify(recentMessages))
        uploadedFiles.forEach((f, i) => {
          formData.append(`file-${i}`, f.file)
        })
        response = await fetch('/api/ai', {
          method: 'POST',
          body: formData,
        })
        setUploadedFiles([])
      } else {
        response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, context, history: recentMessages }),
        })
      }

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
            } catch {}
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

  // 图像生成
  async function handleGenerateImage(prompt?: string) {
    const p = (prompt || input).trim()
    if (!p || sending) return
    setInput('')
    setSending(true)

    const userMsgId = Date.now().toString() + Math.random().toString(36).slice(2)
    const assistantMsgId = (Date.now() + 1).toString() + Math.random().toString(36).slice(2)

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: `🎨 ${p}` },
      { id: assistantMsgId, role: 'assistant', content: '生成中...', loading: true },
    ])

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, size: imageSize }),
      })
      const data = await response.json()
      if (data.error) {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId ? { ...m, content: `⚠ ${data.error}`, loading: false, error: true } : m
        ))
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: `✓ 图像已生成`, imageUrl: data.url, loading: false }
            : m
        ))
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId ? { ...m, content: '⚠ 网络错误', loading: false, error: true } : m
      ))
    } finally {
      setSending(false)
    }
  }

  // 视频生成
  async function handleGenerateVideo(prompt?: string) {
    const p = (prompt || input).trim()
    if (!p || sending || videoPolling) return
    setInput('')
    setSending(true)

    const userMsgId = Date.now().toString() + Math.random().toString(36).slice(2)
    const assistantMsgId = (Date.now() + 1).toString() + Math.random().toString(36).slice(2)

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: `🎬 ${p}` },
      { id: assistantMsgId, role: 'assistant', content: '任务提交中...', loading: true, taskId: '' },
    ])

    try {
      const response = await fetch('/api/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, num_frames: 121, frame_rate: 4 }),
      })
      const data = await response.json()
      if (data.error) {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId ? { ...m, content: `⚠ ${data.error}`, loading: false, error: true } : m
        ))
      } else {
        const taskId = data.task_id
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: `任务已提交，预计 ${data.estimated_duration}s`, taskId, videoStatus: 'pending', loading: true }
            : m
        ))
        setVideoPolling(taskId)
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId ? { ...m, content: '⚠ 网络错误', loading: false, error: true } : m
      ))
    } finally {
      setSending(false)
    }
  }

  function handleSend(text?: string) {
    if (mode === 'chat') handleSendChat(text)
    else if (mode === 'image') handleGenerateImage(text)
    else if (mode === 'video') handleGenerateVideo(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const inputPlaceholder = mode === 'chat'
    ? (listening ? '正在聆听...' : '输入消息... (Ctrl+K 唤醒)')
    : mode === 'image'
      ? '描述你想生成的图像...'
      : '描述你想生成的视频...'

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
        } md:right-4 md:bottom-36 md:w-[400px] right-0 bottom-0 w-full`}
        style={{ maxHeight: 'min(600px, 80vh)' }}
      >
        <div
          className="glass-panel flex flex-col overflow-hidden md:rounded-md rounded-t-lg"
          style={{
            maxHeight: 'min(600px, 80vh)',
            height: 'min(600px, 80vh)',
            borderColor: 'var(--color-cyber-border)',
          }}
        >
          {/* 头部：模式切换 + TTS + 清空 */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
            style={{ borderColor: 'var(--color-cyber-border)' }}
          >
            <div className="flex items-center gap-1">
              {(['chat', 'image', 'video'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setInput('') }}
                  className={`px-2.5 py-1 rounded-sm text-[10px] font-mono transition-all ${
                    mode === m
                      ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/30'
                      : 'text-[#666] border border-[#222] hover:text-[#00ff9f]'
                  }`}
                  aria-label={m === 'chat' ? '对话' : m === 'image' ? '生图' : '生视频'}
                >
                  {m === 'chat' ? '💬 对话' : m === 'image' ? '🎨 图像' : '🎬 视频'}
                </button>
              ))}
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
                  onClick={() => { setMessages([]); setVideoPolling(null); try { localStorage.removeItem(HISTORY_KEY) } catch {} }}
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

          {/* 消息区 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,159,0.1), rgba(0,212,255,0.1))',
                    border: '1px solid rgba(0,255,159,0.2)',
                  }}
                >
                  {mode === 'chat' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="5" width="18" height="12" rx="2" stroke="var(--color-cyber-neon)" strokeWidth="1.5" fill="none" />
                      <circle cx="9" cy="11" r="1.5" fill="var(--color-cyber-neon)" />
                      <circle cx="15" cy="11" r="1.5" fill="var(--color-cyber-neon)" />
                    </svg>
                  ) : mode === 'image' ? (
                    <span className="text-2xl">🎨</span>
                  ) : (
                    <span className="text-2xl">🎬</span>
                  )}
                </div>
                <p className="font-mono text-xs text-center" style={{ color: 'var(--color-cyber-text-dim)' }}>
                  {mode === 'chat' ? '> AI 助手已就绪_' : mode === 'image' ? '> 图像生成器就绪_' : '> 视频生成器就绪_'}
                </p>
                {/* 快捷操作 */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  {(mode === 'chat' ? QUICK_ACTIONS.map(a => ({ label: a.label, icon: a.icon }))
                    : mode === 'image' ? IMAGE_PRESETS.slice(0, 4).map((p, i) => ({ label: p.length > 12 ? p.slice(0, 12) + '...' : p, icon: '🎨' }))
                    : VIDEO_PRESETS.slice(0, 4).map((p, i) => ({ label: p.length > 12 ? p.slice(0, 12) + '...' : p, icon: '🎬' }))
                  ).map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(mode === 'chat' ? action.label : (mode === 'image' ? IMAGE_PRESETS[i] : VIDEO_PRESETS[i]))}
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
                  className={`max-w-[90%] px-3 py-2 rounded-sm text-sm font-mono leading-relaxed break-words`}
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
                  {/* 附件信息 */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {msg.attachments.map((name, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded-sm text-[10px] font-mono"
                          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
                          📎 {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* 视频状态 */}
                  {msg.taskId && msg.videoStatus && (
                    <div className="mb-2 text-[10px] text-[#888]">
                      {msg.videoStatus === 'pending' && '⏳ 任务排队中...'}
                      {msg.videoStatus === 'processing' && '🔄 视频生成中...'}
                      {msg.videoStatus === 'completed' && '✓ 生成完成'}
                      {msg.videoStatus === 'failed' && '✗ 生成失败'}
                    </div>
                  )}
                  {/* 文本内容 */}
                  {msg.loading && !msg.content ? (
                    <span className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                    </span>
                  ) : (
                    msg.content && <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                  {/* 图像展示 */}
                  {msg.imageUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.imageUrl}
                        alt="AI生成图像"
                        className="w-full rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-[10px] text-[#00d4ff] hover:underline"
                      >
                        ↗ 查看原图
                      </a>
                    </div>
                  )}
                  {/* 视频展示 */}
                  {msg.videoUrl && (
                    <div className="mt-2">
                      <video
                        src={msg.videoUrl}
                        controls
                        className="w-full rounded-sm"
                        style={{ maxHeight: '300px' }}
                      />
                      <a
                        href={msg.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-[10px] text-[#00d4ff] hover:underline"
                      >
                        ↗ 下载视频
                      </a>
                    </div>
                  )}
                  {msg.streaming && !msg.loading && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: 'var(--color-cyber-neon)' }} />
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* 上传文件列表 */}
          {mode === 'chat' && uploadedFiles.length > 0 && (
            <div className="px-3 py-2 border-t flex flex-wrap gap-1.5 shrink-0" style={{ borderColor: 'var(--color-cyber-border)' }}>
              {uploadedFiles.map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded-sm text-[10px] font-mono flex items-center gap-1"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
                  📎 {f.name} ({(f.size / 1024).toFixed(1)}KB)
                  <button onClick={() => removeFile(i)} className="hover:text-[#ff0080] ml-0.5" aria-label="移除">×</button>
                </span>
              ))}
            </div>
          )}

          {/* 图像尺寸选择 */}
          {mode === 'image' && (
            <div className="px-3 py-1.5 border-t flex items-center gap-2 shrink-0" style={{ borderColor: 'var(--color-cyber-border)' }}>
              <span className="font-mono text-[10px] text-[#666]">尺寸:</span>
              {['1024x1024', '1024x768', '768x1024'].map(s => (
                <button
                  key={s}
                  onClick={() => setImageSize(s)}
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-mono transition-all ${
                    imageSize === s
                      ? 'bg-[#00ff9f]/10 text-[#00ff9f] border border-[#00ff9f]/30'
                      : 'text-[#666] border border-[#222] hover:text-[#00ff9f]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* 输入区 */}
          <div
            className="px-3 py-3 border-t shrink-0 pb-[env(safe-area-inset-bottom)]"
            style={{ borderColor: 'var(--color-cyber-border)' }}
          >
            <div className="flex items-center gap-2">
              {/* 语音输入（仅对话模式） */}
              {mode === 'chat' && (
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
              )}
              {/* 文件上传（仅对话模式） */}
              {mode === 'chat' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-200 shrink-0"
                  style={{
                    background: 'var(--color-cyber-surface)',
                    border: '1px solid var(--color-cyber-border)',
                    color: 'var(--color-cyber-text-dim)',
                  }}
                  aria-label="上传文件"
                  title="上传文件（最多5个，每个1MB）"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.md,.json,.js,.ts,.tsx,.jsx,.py,.java,.go,.rs,.c,.cpp,.h,.css,.scss,.html,.xml,.yml,.yaml,.sh,.sql,.vue,.php,.rb,.swift,.kt"
              />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder}
                disabled={sending || (mode === 'video' && !!videoPolling)}
                className="cyber-input flex-1 !py-2 !pl-3 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && mode === 'chat' && uploadedFiles.length === 0) || sending || (mode === 'video' && !!videoPolling)}
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
              Powered by Agnes AI · {mode === 'chat' ? '对话' : mode === 'image' ? '图像' : '视频'}模式 · Ctrl+K 唤醒
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
