import { pool } from '../../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface ProjectRow extends RowDataPacket {
  id: number
  title: string
  description: string | null
  tech_stack: string | null
  cover_image: string | null
  demo_url: string | null
  repo_url: string | null
  sort_order: number
  author_id: number
  created_at: string
  updated_at: string
}

export async function list() {
  const [rows] = await pool.execute<ProjectRow[]>('SELECT * FROM projects ORDER BY sort_order ASC, id ASC')
  return rows.map(row => ({ ...row, tech_stack: row.tech_stack ? JSON.parse(row.tech_stack) : null }))
}

export async function create(data: { title: string; description?: string; tech_stack?: string[]; cover_image?: string; demo_url?: string; repo_url?: string; sort_order?: number; author_id: number }) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO projects (title, description, tech_stack, cover_image, demo_url, repo_url, sort_order, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.title, data.description || null, data.tech_stack ? JSON.stringify(data.tech_stack) : null, data.cover_image || null, data.demo_url || null, data.repo_url || null, data.sort_order || 0, data.author_id]
  )
  return { id: result.insertId }
}

export async function update(id: number, data: { title?: string; description?: string; tech_stack?: string[]; cover_image?: string; demo_url?: string; repo_url?: string; sort_order?: number }) {
  const fields: string[] = []
  const params: any[] = []
  if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description) }
  if (data.tech_stack !== undefined) { fields.push('tech_stack = ?'); params.push(JSON.stringify(data.tech_stack)) }
  if (data.cover_image !== undefined) { fields.push('cover_image = ?'); params.push(data.cover_image) }
  if (data.demo_url !== undefined) { fields.push('demo_url = ?'); params.push(data.demo_url) }
  if (data.repo_url !== undefined) { fields.push('repo_url = ?'); params.push(data.repo_url) }
  if (data.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(data.sort_order) }
  if (fields.length > 0) {
    await pool.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, [...params, id])
  }
  return true
}

export async function remove(id: number) {
  await pool.execute('DELETE FROM projects WHERE id = ?', [id])
  return true
}
