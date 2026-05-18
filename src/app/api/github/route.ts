import { NextResponse } from 'next/server'

const GITHUB_USERNAME = 'w020316'

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'CyberBlog',
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) throw new Error('GitHub API error')
    const repos = await res.json()
    const filtered = repos
      .filter((repo: any) => !repo.fork && !repo.private)
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        htmlUrl: repo.html_url,
        homepage: repo.homepage,
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
      }))
    return NextResponse.json({ repos: filtered })
  } catch (error) {
    return NextResponse.json({ repos: [], error: 'Failed to fetch repos' }, { status: 500 })
  }
}
