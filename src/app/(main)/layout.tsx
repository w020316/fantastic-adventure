'use client'

import { Component } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AIChat from '@/components/ai/AIChat'

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '2rem', textAlign: 'center', color: '#e0e0e0', backgroundColor: '#0a0a0f', minHeight: '100vh'}}>
          <h2 style={{fontFamily: 'monospace', color: '#ff0080'}}>SYSTEM.ERROR</h2>
          <p style={{fontFamily: 'monospace', fontSize: '14px', color: '#8b8fa3'}}>页面加载出错，请刷新重试</p>
          <a href="/" style={{fontFamily: 'monospace', color: '#00ff9f', fontSize: '14px'}}>→ 返回首页</a>
        </div>
      )
    }
    return this.props.children
  }
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <Header />
      <main id="main-content" className="min-h-screen">{children}</main>
      <Footer />
      <AIChat />
    </ErrorBoundary>
  )
}
