import { prisma } from '@/lib/prisma'
import PasswordChangeForm from './PasswordChangeForm'

export const dynamic = 'force-dynamic'

async function getDbStatus(): Promise<{ connected: boolean; label: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, label: '已连接' }
  } catch {
    return { connected: false, label: '连接失败' }
  }
}

export default async function SettingsPage() {
  const nodeVersion = process.version
  const nodeEnv = process.env.NODE_ENV || 'development'
  const dbStatus = await getDbStatus()

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <div className="section-title mb-6">
        <span className="neon-text">▸</span> 系统设置
      </div>

      <div className="space-y-6">
        <PasswordChangeForm />

        <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.1s forwards', opacity: 0 }}>
          <div className="section-title mb-4">
            <span className="neon-text-blue">▸</span> 运行环境
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">数据库状态</span>
              <div className="flex items-center gap-2">
                {dbStatus.connected && (
                  <span className="cyber-tag cyber-tag-green text-[10px]">ONLINE</span>
                )}
                <span className="font-mono text-xs text-cyber-text">{dbStatus.label}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">运行环境</span>
              <span className="font-mono text-xs text-cyber-text">{nodeEnv}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">Node.js 版本</span>
              <span className="font-mono text-xs text-cyber-text">{nodeVersion}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">框架</span>
              <span className="font-mono text-xs text-cyber-text">Next.js 16</span>
            </div>
          </div>
        </div>

        <div className="cyber-card p-5" style={{ animation: 'fadeInUp 0.4s ease 0.2s forwards', opacity: 0 }}>
          <div className="section-title mb-4">
            <span className="neon-text-yellow">▸</span> 关于系统
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">版本</span>
              <span className="font-mono text-xs text-cyber-text">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">技术栈</span>
              <span className="font-mono text-xs text-cyber-text">Next.js + Prisma + PostgreSQL</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
              <span className="font-mono text-xs text-cyber-text-dim">GitHub</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-cyber-neon hover:underline"
              >
                github.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
