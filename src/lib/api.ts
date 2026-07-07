const BASE = ''

// 带重试的 fetch，应对偶发的数据库连接池超时（P2024）
async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        cache: 'no-store',
      })
      // 5xx 错误才重试，4xx 不重试（如 404）
      if (res.status >= 500 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
      return res
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('请求失败')
}

export async function fetchArticles(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetchWithRetry(`${BASE}/api/articles${qs}`)
  if (!res.ok) throw new Error('获取文章失败')
  return res.json()
}

export async function fetchArticle(id: string) {
  const res = await fetchWithRetry(`${BASE}/api/articles/${id}`)
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
  if (!res.ok) throw new Error('点赞失败')
  return res.json()
}

export async function submitComment(data: { content: string; nickname: string; email?: string; articleId: string; parentId?: string }) {
  const res = await fetch(`${BASE}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || '提交评论失败')
  }
  return res.json()
}

export async function reportStats(data: { path: string; referrer?: string }) {
  await fetch(`${BASE}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  const res = await fetch(`${BASE}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('创建分类失败')
  return res.json()
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string }) {
  const res = await fetch(`${BASE}/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('更新分类失败')
  return res.json()
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${BASE}/api/categories/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '删除分类失败')
  }
  return res.json()
}

export async function createTag(data: { name: string; slug: string }) {
  const res = await fetch(`${BASE}/api/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('创建标签失败')
  return res.json()
}

export async function deleteTag(id: string) {
  const res = await fetch(`${BASE}/api/tags/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('删除标签失败')
  return res.json()
}
