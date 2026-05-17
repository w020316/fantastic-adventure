import { pool } from '../../config/database'
import { logger } from '../../utils/logger'
import { cache } from '../../utils/cache'

interface ProjectRow {
  id: number
  title: string
  description: string | null
  tech_stack: any
  cover_image: string | null
  demo_url: string | null
  repo_url: string | null
  sort_order: number
  author_id: number
  created_at: string
  updated_at: string
}

export async function list() {
  const cacheKey = 'projects:all'
  const cached = cache.get<any[]>(cacheKey)
  if (cached) {
    logger.debug('Project list cache hit')
    return cached
  }

  const result = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, id ASC')
  const rows = result.rows as ProjectRow[]
  const data = rows.map(row => ({ ...row, tech_stack: row.tech_stack || null }))
  cache.set(cacheKey, data, 120000)
  logger.info('Project list fetched', { count: data.length })
  return data
}

export async function create(data: { title: string; description?: string; tech_stack?: string[]; cover_image?: string; demo_url?: string; repo_url?: string; sort_order?: number; author_id: number }) {
  const result = await pool.query(
    'INSERT INTO projects (title, description, tech_stack, cover_image, demo_url, repo_url, sort_order, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
    [data.title, data.description || null, data.tech_stack || null, data.cover_image || null, data.demo_url || null, data.repo_url || null, data.sort_order || 0, data.author_id]
  )
  cache.invalidate('projects:all')
  logger.info('Project created', { id: (result.rows[0] as any).id, title: data.title })
  return { id: (result.rows[0] as any).id }
}

export async function update(id: number, data: { title?: string; description?: string; tech_stack?: string[]; cover_image?: string; demo_url?: string; repo_url?: string; sort_order?: number }) {
  const fields: string[] = []
  const params: any[] = []
  let paramIndex = 1
  if (data.title !== undefined) { fields.push(`title = $${paramIndex++}`); params.push(data.title) }
  if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); params.push(data.description) }
  if (data.tech_stack !== undefined) { fields.push(`tech_stack = $${paramIndex++}`); params.push(data.tech_stack) }
  if (data.cover_image !== undefined) { fields.push(`cover_image = $${paramIndex++}`); params.push(data.cover_image) }
  if (data.demo_url !== undefined) { fields.push(`demo_url = $${paramIndex++}`); params.push(data.demo_url) }
  if (data.repo_url !== undefined) { fields.push(`repo_url = $${paramIndex++}`); params.push(data.repo_url) }
  if (data.sort_order !== undefined) { fields.push(`sort_order = $${paramIndex++}`); params.push(data.sort_order) }
  if (fields.length > 0) {
    params.push(id)
    await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex}`, params)
  }
  cache.invalidate('projects:all')
  logger.info('Project updated', { id })
  return true
}

export async function remove(id: number) {
  await pool.query('DELETE FROM projects WHERE id = $1', [id])
  cache.invalidate('projects:all')
  logger.info('Project deleted', { id })
  return true
}
