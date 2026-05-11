import { pool } from '../../config/database'

interface CommentRow {
  id: number
  article_id: number
  nickname: string
  email: string | null
  content: string
  parent_id: number | null
  status: 'pending' | 'approved' | 'hidden'
  created_at: string
}

export async function listByArticle(articleId: number) {
  const result = await pool.query(
    "SELECT * FROM comments WHERE article_id = $1 AND status = 'approved' ORDER BY created_at ASC",
    [articleId]
  )
  const rows = result.rows as CommentRow[]
  const commentMap = new Map<number, any>()
  const roots: any[] = []
  rows.forEach(row => {
    const comment = { ...row, replies: [] }
    commentMap.set(row.id, comment)
    if (row.parent_id === null) {
      roots.push(comment)
    }
  })
  rows.forEach(row => {
    if (row.parent_id !== null) {
      const parent = commentMap.get(row.parent_id)
      if (parent) {
        parent.replies.push(commentMap.get(row.id))
      }
    }
  })
  return roots
}

export async function listAll(query: { page?: number; limit?: number; status?: string; article_id?: number }) {
  const page = query.page || 1
  const limit = query.limit || 20
  const offset = (page - 1) * limit
  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  if (query.status) {
    whereClause += ' AND status = $' + (params.length + 1)
    params.push(query.status)
  }
  if (query.article_id) {
    whereClause += ' AND article_id = $' + (params.length + 1)
    params.push(query.article_id)
  }
  const countResult = await pool.query(`SELECT COUNT(*) as total FROM comments ${whereClause}`, params)
  const total = (countResult.rows[0] as any).total
  const result = await pool.query(`SELECT * FROM comments ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset])
  return { list: result.rows as CommentRow[], total, page, limit }
}

export async function create(articleId: number, data: { nickname: string; email?: string; content: string; parent_id?: number }) {
  const result = await pool.query(
    'INSERT INTO comments (article_id, nickname, email, content, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [articleId, data.nickname, data.email || null, data.content, data.parent_id || null]
  )
  return { id: (result.rows[0] as any).id }
}

export async function updateStatus(id: number, status: string) {
  await pool.query('UPDATE comments SET status = $1 WHERE id = $2', [status, id])
  return true
}

export async function remove(id: number) {
  await pool.query('DELETE FROM comments WHERE parent_id = $1', [id])
  await pool.query('DELETE FROM comments WHERE id = $1', [id])
  return true
}
