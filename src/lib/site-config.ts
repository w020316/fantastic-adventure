// 站点全局配置
export const SITE_CONFIG = {
  email: '1181264839@qq.com',
  github: 'https://github.com/w020316',
  githubUsername: 'w020316',
  siteUrl: 'https://fantastic-adventure.fly.dev',
  brandName: 'XIAO/WU',
  authorNameCn: '周末',
  authorNameEn: 'Cris',
}

// 获取配置（优先从环境变量读取，fallback 到硬编码）
export function getSiteConfig() {
  return {
    ...SITE_CONFIG,
    email: process.env.CONTACT_EMAIL || SITE_CONFIG.email,
    siteUrl: process.env.NEXTAUTH_URL || SITE_CONFIG.siteUrl,
    githubUsername: process.env.GITHUB_USERNAME || SITE_CONFIG.githubUsername,
  }
}
