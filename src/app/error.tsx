'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-xs text-[#ccff00] mb-4">ERROR 500</p>
        <h1 className="font-display text-3xl font-bold text-white mb-3">
          页面出错了
        </h1>
        <p className="text-sm text-[#888] mb-8">
          抱歉，发生了意外错误。请尝试刷新页面。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-[#0a0a0a] text-sm font-bold rounded-full hover:bg-white transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  )
}
