export interface StatsRecord {
  path: string
  ip?: string
  referrer?: string
  user_agent?: string
}

export interface StatsOverview {
  total_visits: number
  today_visits: number
  total_articles: number
  total_comments: number
  total_projects: number
}

export interface StatsTrendItem {
  date: string
  visits: number
}

export interface StatsTrend {
  trend: StatsTrendItem[]
}
