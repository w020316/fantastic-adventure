export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
      <div className="text-center">
        <div className="font-display text-lg font-bold neon-text mb-2 animate-pulse">
          ADMIN.LOADING
        </div>
        <p className="font-mono text-cyber-text-dim text-xs">
          {'// 验证身份...'}
        </p>
      </div>
    </div>
  )
}
