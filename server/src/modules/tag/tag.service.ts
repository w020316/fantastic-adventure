import { pool } from '../../config/database'

interface TagRow {
  id: number
  name: string
  color: string
  article_count?: number
}

export async function list() {
  const result = await pool.query(
    'SELECT t.*, (SELECT COUNT(*) FROM article_tags WHERE tag_id = t.id) as article_count FROM tags t ORDER BY t.id ASC'
  )
  return result.rows as TagRow[]
}

export async function create(name: string, color?: string) {
  const result = await pool.query(
    'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING id',
    [name, color || '#6366f1']
  )
  const insertId = (result.rows[0] as any).id
  return { id: insertId, name, color: color || '#6366f1' }
}

export async function update(id: number, data: { name?: string; color?: string }) {
  const fields: string[] = []
  const params: any[] = []
  let paramIndex = 1
  if (data.name !== undefined) { fields.push(`name = $${paramIndex++}`); params.push(data.name) }
  if (data.color !== undefined) { fields.push(`color = $${paramIndex++}`); params.push(data.color) }
  if (fields.length > 0) {
    params.push(id)
    await pool.query(`UPDATE tags SET ${fields.join(', ')} WHERE id = $${paramIndex}`, params)
  }
  return true
}

export async function remove(id: number) {
  await pool.query('DELETE FROM tags WHERE id = $1', [id])
  return true
}
