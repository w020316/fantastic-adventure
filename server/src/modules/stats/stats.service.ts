import { pool } from '../../config/database'
import { RowDataPacket } from 'mysql2'

export async function record(data: { path: string; ip?: string; referrer?: string; user_agent?: string }) {
  await pool.execute(
    'INSERT INTO stats (path, ip, referrer, user_agent) VALUES (?, ?, ?, ?)',
    [data.path, data.ip || null, data.referrer || null, data.user_agent || null]
  )
  return true
}

export async function overview() {
  const [[totalVisits]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total_visits FROM stats')
  const [[todayVisits]] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as today_visits FROM stats WHERE DATE(created_at) = CURDATE()")
  const [[totalArticles]] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total_articles FROM articles WHERE status = 'published'")
  const [[totalComments]] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total_comments FROM comments WHERE status = 'approved'")
  const [[totalProjects]] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total_projects FROM projects')
  return {
    total_visits: totalVisits.total_visits,
    today_visits: todayVisits.today_visits,
    total_articles: totalArticles.total_articles,
    total_comments: totalComments.total_comments,
    total_projects: totalProjects.total_projects,
  }
}

export async function trend(days: number = 30) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT DATE(created_at) as date, COUNT(*) as visits FROM stats WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) GROUP BY DATE(created_at) ORDER BY date ASC`,
    [days]
  )
  return rows.map(row => ({ date: row.date, visits: row.visits }))
}
