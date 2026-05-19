export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-2xl font-bold neon-text mb-4 animate-pulse">
          LOADING
        </div>
        <p className="font-mono text-cyber-text-dim text-xs tracking-widest">
          {'// 系统加载中...'}
        </p>
      </div>
    </div>
  )
}
