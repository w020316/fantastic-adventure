import { pool } from '../../config/database'
import { logger } from '../../utils/logger'
import { cache } from '../../utils/cache'
import { AppError } from '../../middleware/errorHandler'

interface ArticleRow {
  id: number
  title: string
  content: string
  summary: string | null
  cover_image: string | null
  category_id: number | null
  author_id: number
  status: 'draft' | 'published'
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
  category_name?: string
}

export async function list(query: { page?: number; limit?: number; category_id?: number; tag_id?: number; keyword?: string; status?: string }) {
  const cacheKey = `articles:list:${JSON.stringify(query)}`
  const cached = cache.get<{ list: any[]; total: number; page: number; limit: number }>(cacheKey)
  if (cached) {
    logger.debug('Article list cache hit', { cacheKey })
    return cached
  }

  const page = query.page || 1
  const limit = query.limit || 10
  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (query.category_id) {
    whereClause += ' AND a.category_id = $' + (params.length + 1)
    params.push(query.category_id)
  }
  if (query.tag_id) {
    whereClause += ' AND a.id IN (SELECT article_id FROM article_tags WHERE tag_id = $' + (params.length + 1) + ')'
    params.push(query.tag_id)
  }
  if (query.keyword) {
    whereClause += ' AND (a.title LIKE $' + (params.length + 1) + ' OR a.summary LIKE $' + (params.length + 2) + ')'
    params.push(`%${query.keyword}%`, `%${query.keyword}%`)
  }
  if (query.status) {
    whereClause += ' AND a.status = $' + (params.length + 1)
    params.push(query.status)
  } else {
    whereClause += ' AND a.status = $' + (params.length + 1)
    params.push('published')
  }

  const countSql = `SELECT COUNT(*) as total FROM articles a ${whereClause}`
  const countResult = await pool.query(countSql, params)
  const total = (countResult.rows[0] as any).total

  const sql = `SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id ${whereClause} ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  const result = await pool.query(sql, [...params, limit, offset])
  const rows = result.rows as ArticleRow[]

  const articleIds = rows.map((a) => a.id)
  const tagMap = new Map<number, any[]>()

  if (articleIds.length > 0) {
    const tagResult = await pool.query(
      'SELECT at2.article_id, t.* FROM tags t INNER JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = ANY($1)',
      [articleIds]
    )
    for (const row of tagResult.rows) {
      const articleId = (row as any).article_id
      if (!tagMap.has(articleId)) {
        tagMap.set(articleId, [])
      }
      const { article_id, ...tag } = row as any
      tagMap.get(articleId)!.push(tag)
    }
  }

  const articles = rows.map((article) => ({
    ...article,
    tags: tagMap.get(article.id) || [],
  }))

  const data = { list: articles, total, page, limit }
  cache.set(cacheKey, data, 60000)
  logger.info('Article list fetched', { page, limit, total, filters: query })
  return data
}

export async function detail(id: number) {
  const cacheKey = `articles:detail:${id}`
  const cached = cache.get<any>(cacheKey)
  if (cached) {
    logger.debug('Article detail cache hit', { cacheKey })
    return cached
  }

  const result = await pool.query(
    'SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = $1',
    [id]
  )
  const rows = result.rows as ArticleRow[]
  if (rows.length === 0) {
    throw new AppError(404, '文章不存在')
  }
  const article = rows[0]
  const tagResult = await pool.query(
    'SELECT t.* FROM tags t INNER JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = $1',
    [article.id]
  )
  await pool.query('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [id])
  const data = { ...article, tags: tagResult.rows, view_count: article.view_count + 1 }
  cache.set(cacheKey, data, 120000)
  logger.info('Article detail fetched', { id })
  return data
}

export async function create(data: { title: string; content: string; summary?: string; cover_image?: string; category_id?: number; author_id: number; tag_ids?: number[]; status?: string }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      'INSERT INTO articles (title, content, summary, cover_image, category_id, author_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [data.title, data.content, data.summary || null, data.cover_image || null, data.category_id || null, data.author_id, data.status || 'draft']
    )
    const insertId = (result.rows[0] as any).id
    if (data.tag_ids && data.tag_ids.length > 0) {
      for (const tagId of data.tag_ids) {
        await client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [insertId, tagId])
      }
    }
    await client.query('COMMIT')
    cache.invalidate('articles:*')
    logger.info('Article created', { id: insertId, title: data.title })
    return { id: insertId }
  } catch (err) {
    await client.query('ROLLBACK')
    logger.error('Article create failed', { title: data.title, error: err instanceof Error ? err.message : String(err) })
    throw err
  } finally {
    client.release()
  }
}

export async function update(id: number, data: { title?: string; content?: string; summary?: string; cover_image?: string; category_id?: number; tag_ids?: number[]; status?: string }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const fields: string[] = []
    const params: any[] = []
    let paramIndex = 1
    if (data.title !== undefined) { fields.push(`title = $${paramIndex++}`); params.push(data.title) }
    if (data.content !== undefined) { fields.push(`content = $${paramIndex++}`); params.push(data.content) }
    if (data.summary !== undefined) { fields.push(`summary = $${paramIndex++}`); params.push(data.summary) }
    if (data.cover_image !== undefined) { fields.push(`cover_image = $${paramIndex++}`); params.push(data.cover_image) }
    if (data.category_id !== undefined) { fields.push(`category_id = $${paramIndex++}`); params.push(data.category_id) }
    if (data.status !== undefined) { fields.push(`status = $${paramIndex++}`); params.push(data.status) }
    if (fields.length > 0) {
      params.push(id)
      await client.query(`UPDATE articles SET ${fields.join(', ')} WHERE id = $${paramIndex}`, params)
    }
    if (data.tag_ids !== undefined) {
      await client.query('DELETE FROM article_tags WHERE article_id = $1', [id])
      if (data.tag_ids.length > 0) {
        for (const tagId of data.tag_ids) {
          await client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [id, tagId])
        }
      }
    }
    await client.query('COMMIT')
    cache.invalidate('articles:*')
    cache.invalidate(`articles:detail:${id}`)
    logger.info('Article updated', { id })
    return true
  } catch (err) {
    await client.query('ROLLBACK')
    logger.error('Article update failed', { id, error: err instanceof Error ? err.message : String(err) })
    throw err
  } finally {
    client.release()
  }
}

export async function remove(id: number) {
  await pool.query('DELETE FROM articles WHERE id = $1', [id])
  cache.invalidate('articles:*')
  cache.invalidate(`articles:detail:${id}`)
  logger.info('Article deleted', { id })
  return true
}

const recentLikes = new Map<string, number>()
const LIKE_COOLDOWN_MS = 10000

export async function like(id: number, ip: string) {
  const key = `${ip}:${id}`
  const lastLike = recentLikes.get(key)
  if (lastLike && Date.now() - lastLike < LIKE_COOLDOWN_MS) {
    throw new AppError(429, '点赞过于频繁，请稍后再试')
  }
  recentLikes.set(key, Date.now())
  if (recentLikes.size > 10000) {
    const now = Date.now()
    for (const [k, v] of recentLikes) {
      if (now - v > LIKE_COOLDOWN_MS * 2) recentLikes.delete(k)
    }
  }
  await pool.query('UPDATE articles SET like_count = like_count + 1 WHERE id = $1', [id])
  cache.invalidate(`articles:detail:${id}`)
  logger.info('Article liked', { id, ip })
  return true
}

export async function related(id: number, limit: number = 3) {
  const articleResult = await pool.query('SELECT category_id FROM articles WHERE id = $1', [id])
  if (articleResult.rows.length === 0) return []
  const categoryId = (articleResult.rows[0] as any).category_id
  let sql = "SELECT id, title, summary, cover_image, view_count, created_at FROM articles WHERE id != $1 AND status = 'published'"
  const params: any[] = [id]
  if (categoryId) {
    sql += ' AND category_id = $2'
    params.push(categoryId)
  }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`
  params.push(limit)
  const result = await pool.query(sql, params)
  return result.rows
}
