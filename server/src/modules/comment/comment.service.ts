import { pool } from '../../config/database'
import { RowDataPacket } from 'mysql2'

interface CommentRow extends RowDataPacket {
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
  const [rows] = await pool.execute<CommentRow[]>(
    "SELECT * FROM comments WHERE article_id = ? AND status = 'approved' ORDER BY created_at ASC",
    [articleId]
  )
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
    whereClause += ' AND status = ?'
    params.push(query.status)
  }
  if (query.article_id) {
    whereClause += ' AND article_id = ?'
    params.push(query.article_id)
  }
  const [countRows] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM comments ${whereClause}`, params)
  const [rows] = await pool.execute<CommentRow[]>(`SELECT * FROM comments ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset])
  return { list: rows, total: countRows[0].total, page, limit }
}

export async function create(articleId: number, data: { nickname: string; email?: string; content: string; parent_id?: number }) {
  const [result] = await pool.execute(
    'INSERT INTO comments (article_id, nickname, email, content, parent_id) VALUES (?, ?, ?, ?, ?)',
    [articleId, data.nickname, data.email || null, data.content, data.parent_id || null]
  )
  return { id: (result as any).insertId }
}

export async function updateStatus(id: number, status: string) {
  await pool.execute('UPDATE comments SET status = ? WHERE id = ?', [status, id])
  return true
}

export async function remove(id: number) {
  await pool.execute('DELETE FROM comments WHERE parent_id = ?', [id])
  await pool.execute('DELETE FROM comments WHERE id = ?', [id])
  return true
}
