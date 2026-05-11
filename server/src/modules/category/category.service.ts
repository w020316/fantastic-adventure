import { pool } from '../../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface CategoryRow extends RowDataPacket {
  id: number
  name: string
  sort_order: number
  created_at: string
  article_count?: number
}

export async function list() {
  const [rows] = await pool.execute<CategoryRow[]>(
    'SELECT c.*, (SELECT COUNT(*) FROM articles WHERE category_id = c.id) as article_count FROM categories c ORDER BY c.sort_order ASC, c.id ASC'
  )
  return rows
}

export async function create(name: string, sortOrder?: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO categories (name, sort_order) VALUES (?, ?)',
    [name, sortOrder || 0]
  )
  return { id: result.insertId, name, sort_order: sortOrder || 0 }
}

export async function update(id: number, data: { name?: string; sort_order?: number }) {
  const fields: string[] = []
  const params: any[] = []
  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name) }
  if (data.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(data.sort_order) }
  if (fields.length > 0) {
    await pool.execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, [...params, id])
  }
  return true
}

export async function remove(id: number) {
  const [articles] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM articles WHERE category_id = ?', [id])
  if (articles[0].count > 0) {
    throw new Error('该分类下还有文章，无法删除')
  }
  await pool.execute('DELETE FROM categories WHERE id = ?', [id])
  return true
}
