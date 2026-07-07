import { NextResponse } from 'next/server'

const GITHUB_USERNAME = 'w020316'

// 缓存 5 分钟，避免频繁调用 GitHub API 触发速率限制（未认证 60 次/小时）
const REVALIDATE_SECONDS = 300

// GitHub API 返回的仓库原始结构（仅保留用到的字段）
interface GitHubRepoRaw {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  has_pages: boolean
  fork: boolean
  private: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  open_issues_count: number
  default_branch: string
}

// 仓库难度评估：根据语言、Topics、size 推断技术难度（1-5，越大越难）
function inferDifficulty(repo: {
  language: string
  topics: string[]
  size: number
  name: string
  description: string
}): number {
  let score = 2 // 基础分
  const lang = repo.language?.toLowerCase() ?? ''
  const topicsStr = repo.topics.join(' ').toLowerCase()
  const desc = (repo.description || '').toLowerCase()
  const combined = `${lang} ${topicsStr} ${desc}`

  // 涉及 AI/ML/CV 的项目难度高
  if (/yolo|opencv|pytorch|tensorflow|ml|ai|nlp|rag|llm/.test(combined)) score += 2
  // 全栈项目（含框架 + 数据库）
  if (/(next\.?js|react|vue)/.test(combined) && /(prisma|postgres|mysql|database|sql)/.test(combined)) score += 1
  // 系统级/后端项目
  if (/(rust|go|java|spring|docker|kubernetes|redis)/.test(combined)) score += 1
  // 仓库规模较大
  if (repo.size > 5000) score += 1
  // 纯前端/静态页面难度较低
  if (/landing|portfolio|template|starter|boilerplate/.test(combined)) score -= 1

  return Math.max(1, Math.min(5, score))
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'CyberBlog',
        },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    )
    if (!res.ok) throw new Error('GitHub API error')
    const repos: GitHubRepoRaw[] = await res.json()
    const filtered = repos
      .filter((repo) => !repo.fork && !repo.private)
      .map((repo) => {
        const base = {
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || '',
          htmlUrl: repo.html_url,
          homepage: repo.homepage,
          hasPages: Boolean(repo.has_pages),
          language: repo.language || 'Other',
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          topics: repo.topics || [],
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          size: repo.size,
          openIssuesCount: repo.open_issues_count,
          defaultBranch: repo.default_branch,
        }
        return { ...base, difficulty: inferDifficulty(base) }
      })
      // 按难度从高到低排序（从难到易）
      .sort((a, b) => b.difficulty - a.difficulty)

    return NextResponse.json(
      { repos: filtered, updatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
        },
      }
    )
  } catch {
    return NextResponse.json({ repos: [], error: 'Failed to fetch repos' }, { status: 500 })
  }
}
