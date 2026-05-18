const BASE = ''

export async function fetchArticles(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`${BASE}/api/articles${qs}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取文章失败')
  return res.json()
}

export async function fetchArticle(id: string) {
  const res = await fetch(`${BASE}/api/articles/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取文章失败')
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/api/categories`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取分类失败')
  return res.json()
}

export async function fetchTags() {
  const res = await fetch(`${BASE}/api/tags`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取标签失败')
  return res.json()
}

export async function fetchProjects() {
  const res = await fetch(`${BASE}/api/projects`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取项目失败')
  return res.json()
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/api/stats`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取统计失败')
  return res.json()
}

export async function likeArticle(id: string) {
  const res = await fetch(`${BASE}/api/articles/${id}/like`, { method: 'POST' })
  return res.json()
}

export async function submitComment(data: { content: string; nickname: string; email?: string; articleId: string; parentId?: string }) {
  const res = await fetch(`${BASE}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function reportStats(data: { path: string; referrer?: string }) {
  await fetch(`${BASE}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
