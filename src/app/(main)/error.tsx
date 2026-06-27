'use client'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-xs text-[#ccff00] mb-4">ERROR</p>
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          加载失败
        </h1>
        <p className="text-sm text-[#888] mb-6">
          页面内容加载失败，请重试。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ccff00] text-[#0a0a0a] text-sm font-bold rounded-full hover:bg-white transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  )
}
