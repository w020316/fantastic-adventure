import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { promises as fs } from 'fs'
import path from 'path'

// 项目文件夹扫描接口
// 本地开发环境：扫描 D:\xm\wz\ 路径下的项目文件夹，解析 package.json 和 README
// 生产环境（Fly.io）：无文件系统访问，返回提示信息

interface ScannedProject {
  folderName: string
  path: string
  hasPackageJson: boolean
  hasReadme: boolean
  projectName?: string
  description?: string
  techStack?: string[]
  homepage?: string
  repository?: string
  alreadyAdded?: boolean
}

// 扫描路径配置：优先环境变量，默认 D:\xm\wz
const SCAN_PATHS = [
  process.env.PROJECTS_SCAN_PATH,
  'D:\\xm\\wz',
  '/home/node/projects',
  './projects',
].filter(Boolean) as string[]

// 从 package.json 提取技术栈（核心依赖）
function extractTechStack(pkg: any): string[] {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const techMap: Record<string, string> = {
    'next': 'Next.js',
    'react': 'React',
    'vue': 'Vue',
    '@vue/runtime-core': 'Vue',
    'nuxt': 'Nuxt',
    'typescript': 'TypeScript',
    'vite': 'Vite',
    'tailwindcss': 'TailwindCSS',
    'prisma': 'Prisma',
    '@prisma/client': 'Prisma',
    'express': 'Express',
    'koa': 'Koa',
    'fastapi': 'FastAPI',
    'pinia': 'Pinia',
    'redux': 'Redux',
    'framer-motion': 'Framer Motion',
    'zod': 'Zod',
    'axios': 'Axios',
    'jwt': 'JWT',
    'jsonwebtoken': 'JWT',
    'vitest': 'Vitest',
    'jest': 'Jest',
  }
  const stack: string[] = []
  for (const dep of Object.keys(deps)) {
    // 精确匹配
    if (techMap[dep]) {
      stack.push(techMap[dep])
      continue
    }
    // 模糊匹配
    const lowerDep = dep.toLowerCase()
    for (const [key, val] of Object.entries(techMap)) {
      if (lowerDep.includes(key) && !stack.includes(val)) {
        stack.push(val)
        break
      }
    }
  }
  // 去重，限制8个
  return [...new Set(stack)].slice(0, 8)
}

// 异步读取 package.json
async function readPackageJson(dirPath: string): Promise<any | null> {
  try {
    const pkgPath = path.join(dirPath, 'package.json')
    const content = await fs.readFile(pkgPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

// 异步读取 README 摘要（前 200 字符）
async function readReadmeExcerpt(dirPath: string): Promise<string | null> {
  try {
    for (const name of ['README.md', 'readme.md', 'README.MD', 'README']) {
      try {
        const content = await fs.readFile(path.join(dirPath, name), 'utf-8')
        // 移除 markdown 标记，取前 200 字符
        const cleaned = content
          .replace(/^#+\s*/gm, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .trim()
        return cleaned.slice(0, 200)
      } catch {
        continue
      }
    }
    return null
  } catch {
    return null
  }
}

// 检查文件夹是否为项目（含 package.json 或 README）
async function scanDirectory(dirPath: string, existingProjects: { title: string; repoUrl: string | null }[]): Promise<ScannedProject[]> {
  const results: ScannedProject[] = []
  let entries: string[] = []
  try {
    entries = await fs.readdir(dirPath)
  } catch {
    return results
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry)
    try {
      const stat = await fs.stat(fullPath)
      if (!stat.isDirectory()) continue
      // 跳过隐藏文件夹和 node_modules
      if (entry.startsWith('.') || entry === 'node_modules') continue

      const pkg = await readPackageJson(fullPath)
      const readme = await readReadmeExcerpt(fullPath)

      // 只收录有 package.json 或 README 的文件夹
      if (!pkg && !readme) continue

      const techStack = pkg ? extractTechStack(pkg) : []
      const projectName = pkg?.name || entry
      const description = pkg?.description || readme || ''
      const homepage = pkg?.homepage || ''
      const repository = typeof pkg?.repository === 'string'
        ? pkg.repository
        : pkg?.repository?.url || ''

      // 检查是否已收录（按标题或仓库地址匹配）
      const alreadyAdded = existingProjects.some(
        (p) => p.title === projectName || (repository && p.repoUrl === repository)
      )

      results.push({
        folderName: entry,
        path: fullPath,
        hasPackageJson: !!pkg,
        hasReadme: !!readme,
        projectName,
        description,
        techStack,
        homepage,
        repository: repository.replace(/^git\+/, '').replace(/\.git$/, ''),
        alreadyAdded,
      })
    } catch {
      continue
    }
  }
  return results
}

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    // 获取已收录项目列表（用于标记 alreadyAdded）
    const existing = await prisma.project.findMany({
      select: { title: true, repoUrl: true },
    })

    // 尝试扫描所有配置路径
    let allScanned: ScannedProject[] = []
    const errors: string[] = []

    for (const scanPath of SCAN_PATHS) {
      try {
        const scanned = await scanDirectory(scanPath, existing)
        if (scanned.length > 0) {
          allScanned = [...allScanned, ...scanned]
        }
      } catch (e) {
        errors.push(`${scanPath}: ${e instanceof Error ? e.message : '不可访问'}`)
      }
    }

    // 去重（按路径）
    const seen = new Set<string>()
    allScanned = allScanned.filter((p) => {
      if (seen.has(p.path)) return false
      seen.add(p.path)
      return true
    })

    // 按文件夹名排序
    allScanned.sort((a, b) => a.folderName.localeCompare(b.folderName))

    if (allScanned.length === 0) {
      return NextResponse.json({
        projects: [],
        error: '未扫描到项目文件夹。生产环境（Fly.io）无法访问本地文件系统，请在本地开发环境使用此功能。',
        scannedPaths: SCAN_PATHS,
        pathErrors: errors,
      })
    }

    return NextResponse.json({
      projects: allScanned,
      scannedPaths: SCAN_PATHS,
      pathErrors: errors,
    })
  } catch (error) {
    console.error('GET /api/projects/scan error:', error)
    return NextResponse.json(
      { error: '扫描失败', projects: [] },
      { status: 500 }
    )
  }
}
