import { pool } from '../../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface ArticleRow extends RowDataPacket {
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
  const page = query.page || 1
  const limit = query.limit || 10
  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (query.category_id) {
    whereClause += ' AND a.category_id = ?'
    params.push(query.category_id)
  }
  if (query.tag_id) {
    whereClause += ' AND a.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?)'
    params.push(query.tag_id)
  }
  if (query.keyword) {
    whereClause += ' AND (a.title LIKE ? OR a.summary LIKE ?)'
    params.push(`%${query.keyword}%`, `%${query.keyword}%`)
  }
  if (query.status) {
    whereClause += ' AND a.status = ?'
    params.push(query.status)
  } else {
    whereClause += ' AND a.status = ?'
    params.push('published')
  }

  const countSql = `SELECT COUNT(*) as total FROM articles a ${whereClause}`
  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, params)
  const total = countRows[0].total

  const sql = `SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id ${whereClause} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
  const [rows] = await pool.execute<ArticleRow[]>(sql, [...params, limit, offset])

  const articles = await Promise.all(rows.map(async (article) => {
    const [tags] = await pool.execute<RowDataPacket[]>(
      'SELECT t.* FROM tags t INNER JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = ?',
      [article.id]
    )
    return { ...article, tags }
  }))

  return { list: articles, total, page, limit }
}

export async function detail(id: number) {
  const [rows] = await pool.execute<ArticleRow[]>(
    'SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?',
    [id]
  )
  if (rows.length === 0) {
    throw new Error('文章不存在')
  }
  const article = rows[0]
  const [tags] = await pool.execute<RowDataPacket[]>(
    'SELECT t.* FROM tags t INNER JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = ?',
    [article.id]
  )
  await pool.execute('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [id])
  return { ...article, tags, view_count: article.view_count + 1 }
}

export async function create(data: { title: string; content: string; summary?: string; cover_image?: string; category_id?: number; author_id: number; tag_ids?: number[]; status?: string }) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO articles (title, content, summary, cover_image, category_id, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.title, data.content, data.summary || null, data.cover_image || null, data.category_id || null, data.author_id, data.status || 'draft']
  )
  if (data.tag_ids && data.tag_ids.length > 0) {
    const values = data.tag_ids.map(tagId => [result.insertId, tagId])
    await pool.execute('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [values])
  }
  return { id: result.insertId }
}

export async function update(id: number, data: { title?: string; content?: string; summary?: string; cover_image?: string; category_id?: number; tag_ids?: number[]; status?: string }) {
  const fields: string[] = []
  const params: any[] = []
  if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title) }
  if (data.content !== undefined) { fields.push('content = ?'); params.push(data.content) }
  if (data.summary !== undefined) { fields.push('summary = ?'); params.push(data.summary) }
  if (data.cover_image !== undefined) { fields.push('cover_image = ?'); params.push(data.cover_image) }
  if (data.category_id !== undefined) { fields.push('category_id = ?'); params.push(data.category_id) }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status) }
  if (fields.length > 0) {
    await pool.execute(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, [...params, id])
  }
  if (data.tag_ids !== undefined) {
    await pool.execute('DELETE FROM article_tags WHERE article_id = ?', [id])
    if (data.tag_ids.length > 0) {
      const values = data.tag_ids.map(tagId => [id, tagId])
      await pool.execute('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [values])
    }
  }
  return true
}

export async function remove(id: number) {
  await pool.execute('DELETE FROM articles WHERE id = ?', [id])
  return true
}

export async function like(id: number, ip: string) {
  await pool.execute('UPDATE articles SET like_count = like_count + 1 WHERE id = ?', [id])
  return true
}
