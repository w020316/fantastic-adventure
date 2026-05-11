import { pool } from '../../config/database'

interface CategoryRow {
  id: number
  name: string
  sort_order: number
  created_at: string
  article_count?: number
}

export async function list() {
  const result = await pool.query(
    'SELECT c.*, (SELECT COUNT(*) FROM articles WHERE category_id = c.id) as article_count FROM categories c ORDER BY c.sort_order ASC, c.id ASC'
  )
  return result.rows as CategoryRow[]
}

export async function create(name: string, sortOrder?: number) {
  const result = await pool.query(
    'INSERT INTO categories (name, sort_order) VALUES ($1, $2) RETURNING id',
    [name, sortOrder || 0]
  )
  const insertId = (result.rows[0] as any).id
  return { id: insertId, name, sort_order: sortOrder || 0 }
}

export async function update(id: number, data: { name?: string; sort_order?: number }) {
  const fields: string[] = []
  const params: any[] = []
  let paramIndex = 1
  if (data.name !== undefined) { fields.push(`name = $${paramIndex++}`); params.push(data.name) }
  if (data.sort_order !== undefined) { fields.push(`sort_order = $${paramIndex++}`); params.push(data.sort_order) }
  if (fields.length > 0) {
    params.push(id)
    await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex}`, params)
  }
  return true
}

export async function remove(id: number) {
  const articlesResult = await pool.query('SELECT COUNT(*) as count FROM articles WHERE category_id = $1', [id])
  if ((articlesResult.rows[0] as any).count > 0) {
    throw new Error('该分类下还有文章，无法删除')
  }
  await pool.query('DELETE FROM categories WHERE id = $1', [id])
  return true
}
