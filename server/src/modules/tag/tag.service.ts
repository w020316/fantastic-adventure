import { pool } from '../../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface TagRow extends RowDataPacket {
  id: number
  name: string
  color: string
  article_count?: number
}

export async function list() {
  const [rows] = await pool.execute<TagRow[]>(
    'SELECT t.*, (SELECT COUNT(*) FROM article_tags WHERE tag_id = t.id) as article_count FROM tags t ORDER BY t.id ASC'
  )
  return rows
}

export async function create(name: string, color?: string) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO tags (name, color) VALUES (?, ?)',
    [name, color || '#6366f1']
  )
  return { id: result.insertId, name, color: color || '#6366f1' }
}

export async function update(id: number, data: { name?: string; color?: string }) {
  const fields: string[] = []
  const params: any[] = []
  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name) }
  if (data.color !== undefined) { fields.push('color = ?'); params.push(data.color) }
  if (fields.length > 0) {
    await pool.execute(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`, [...params, id])
  }
  return true
}

export async function remove(id: number) {
  await pool.execute('DELETE FROM tags WHERE id = ?', [id])
  return true
}
