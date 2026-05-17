import { pool } from '../../config/database'
import { logger } from '../../utils/logger'
import { cache } from '../../utils/cache'

export async function record(data: { path: string; ip?: string; referrer?: string; user_agent?: string }) {
  await pool.query(
    'INSERT INTO stats (path, ip, referrer, user_agent) VALUES ($1, $2, $3, $4)',
    [data.path, data.ip || null, data.referrer || null, data.user_agent || null]
  )
  cache.invalidate('stats:overview')
  cache.invalidate('stats:trend:*')
  if (Math.random() < 0.01) {
    cleanupOldStats(30).catch(() => {})
  }
  return true
}

export async function overview() {
  const cacheKey = 'stats:overview'
  const cached = cache.get<{
    total_visits: number
    today_visits: number
    total_articles: number
    total_comments: number
    total_projects: number
  }>(cacheKey)
  if (cached) {
    logger.debug('Stats overview cache hit')
    return cached
  }

  const totalVisitsResult = await pool.query('SELECT COUNT(*) as total_visits FROM stats')
  const todayVisitsResult = await pool.query("SELECT COUNT(*) as today_visits FROM stats WHERE DATE(created_at) = CURRENT_DATE")
  const totalArticlesResult = await pool.query("SELECT COUNT(*) as total_articles FROM articles WHERE status = 'published'")
  const totalCommentsResult = await pool.query("SELECT COUNT(*) as total_comments FROM comments WHERE status = 'approved'")
  const totalProjectsResult = await pool.query('SELECT COUNT(*) as total_projects FROM projects')
  const data = {
    total_visits: (totalVisitsResult.rows[0] as any).total_visits,
    today_visits: (todayVisitsResult.rows[0] as any).today_visits,
    total_articles: (totalArticlesResult.rows[0] as any).total_articles,
    total_comments: (totalCommentsResult.rows[0] as any).total_comments,
    total_projects: (totalProjectsResult.rows[0] as any).total_projects,
  }
  cache.set(cacheKey, data, 60000)
  logger.info('Stats overview fetched')
  return data
}

export async function trend(days: number = 30) {
  const cacheKey = `stats:trend:${days}`
  const cached = cache.get<{ date: string; visits: number }[]>(cacheKey)
  if (cached) {
    logger.debug('Stats trend cache hit', { days })
    return cached
  }

  const safeDays = Math.max(1, Math.min(365, Math.floor(days)))
  const result = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as visits FROM stats WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1 GROUP BY DATE(created_at) ORDER BY date ASC`,
    [safeDays]
  )
  const rows = result.rows as any[]
  const data = rows.map(row => ({ date: row.date, visits: row.visits }))
  cache.set(cacheKey, data, 60000)
  logger.info('Stats trend fetched', { days: safeDays })
  return data
}

export async function cleanupOldStats(daysToKeep = 30): Promise<number> {
  const result = await pool.query(
    "DELETE FROM stats WHERE created_at < NOW() - INTERVAL '1 day' * $1 RETURNING id",
    [daysToKeep]
  )
  const deleted = result.rowCount ?? 0
  logger.info('Stats cleanup completed', { deleted, daysToKeep })
  return deleted
}
