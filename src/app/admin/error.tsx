'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-xs text-red-400 mb-4">ADMIN ERROR</p>
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          管理后台加载失败
        </h1>
        <p className="text-sm text-[#888] mb-6">
          页面加载发生错误，请重试。
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#ccff00] text-[#0a0a0a] text-sm font-bold rounded-full hover:bg-white transition-colors"
          >
            重试
          </button>
          <a
            href="/admin"
            className="px-6 py-2.5 border border-[#333] text-white text-sm font-medium rounded-full hover:border-[#ccff00] transition-colors"
          >
            返回后台
          </a>
        </div>
      </div>
    </div>
  )
}
