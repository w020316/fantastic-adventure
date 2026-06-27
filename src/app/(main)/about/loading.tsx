export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#ccff00] rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#555]">加载中...</p>
      </div>
    </div>
  )
}
