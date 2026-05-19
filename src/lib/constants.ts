export const categoryColorMap: Record<string, string> = {
  tech: 'cyber-tag-green',
  life: 'cyber-tag-pink',
  works: 'cyber-tag-blue',
  essay: 'cyber-tag-yellow',
}

export const categoryGradients: Record<string, string> = {
  tech: 'from-emerald-900/40 via-cyan-900/30 to-teal-900/40',
  life: 'from-rose-900/40 via-orange-900/30 to-amber-900/40',
  works: 'from-sky-900/40 via-blue-900/30 to-indigo-900/40',
  essay: 'from-yellow-900/40 via-amber-900/30 to-orange-900/40',
}

export const categoryColorValue: Record<string, string> = {
  tech: '#00ff9f',
  life: '#ff0080',
  works: '#00d4ff',
  essay: '#ffe600',
}

export const defaultGradient = 'from-gray-900/40 via-slate-900/30 to-zinc-900/40'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
}

export function getReadingTime(content: string): number {
  return Math.max(1, Math.ceil((content?.length || 0) / 400))
}
