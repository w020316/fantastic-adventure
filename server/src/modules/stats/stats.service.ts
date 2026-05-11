import { pool } from '../../config/database'

export async function record(data: { path: string; ip?: string; referrer?: string; user_agent?: string }) {
  await pool.query(
    'INSERT INTO stats (path, ip, referrer, user_agent) VALUES ($1, $2, $3, $4)',
    [data.path, data.ip || null, data.referrer || null, data.user_agent || null]
  )
  return true
}

export async function overview() {
  const totalVisitsResult = await pool.query('SELECT COUNT(*) as total_visits FROM stats')
  const todayVisitsResult = await pool.query("SELECT COUNT(*) as today_visits FROM stats WHERE DATE(created_at) = CURRENT_DATE")
  const totalArticlesResult = await pool.query("SELECT COUNT(*) as total_articles FROM articles WHERE status = 'published'")
  const totalCommentsResult = await pool.query("SELECT COUNT(*) as total_comments FROM comments WHERE status = 'approved'")
  const totalProjectsResult = await pool.query('SELECT COUNT(*) as total_projects FROM projects')
  return {
    total_visits: (totalVisitsResult.rows[0] as any).total_visits,
    today_visits: (todayVisitsResult.rows[0] as any).today_visits,
    total_articles: (totalArticlesResult.rows[0] as any).total_articles,
    total_comments: (totalCommentsResult.rows[0] as any).total_comments,
    total_projects: (totalProjectsResult.rows[0] as any).total_projects,
  }
}

export async function trend(days: number = 30) {
  const result = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as visits FROM stats WHERE created_at >= CURRENT_DATE - INTERVAL '$1 days' GROUP BY DATE(created_at) ORDER BY date ASC`,
    [days]
  )
  const rows = result.rows as any[]
  return rows.map(row => ({ date: row.date, visits: row.visits }))
}
