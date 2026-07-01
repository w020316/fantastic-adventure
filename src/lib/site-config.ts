// 站点全局配置
export const SITE_CONFIG = {
  email: '1181264839@qq.com',
  github: 'https://github.com/w020316',
  githubUsername: 'w020316',
  siteUrl: 'https://fantastic-adventure.fly.dev',
  brandName: 'XIAO/WU',
  authorNameCn: '周末',
  authorNameEn: 'Cris',
  // 版本号：每次发版递增，用户首次访问新版本时弹窗提示更新内容
  version: '1.4.0',
}

// 版本更新日志（最新版本放最前）
export const CHANGELOG: { version: string; date: string; items: string[] }[] = [
  {
    version: '1.4.0',
    date: '2026-07-01',
    items: [
      '音乐播放器升级：新增搜索功能，支持按歌曲名/歌手搜索，国内外音乐分类展示',
      '音乐库扩充：新增华语流行/古风/摇滚等国内热门曲目（周杰伦/邓紫棋/陈奕迅等）',
      '音乐播放器新增地区筛选（国内/国际/全部）与循环模式切换',
      'AI 助手新增文件上传功能：支持代码/文本/Markdown等20+格式，最多5个文件',
      'AI 助手响应速度优化：max_tokens 调优 + prompt 精简 + 限流策略优化',
      'AI 助手新增图像生成模式：基于 Agnes AI agnes-image-2.1-flash 文生图',
      'AI 助手新增视频生成模式：基于 Agnes AI agnes-video-v2.0 异步文生视频',
      'AI 助手三种模式可切换：对话 💬 / 图像 🎨 / 视频 🎬',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-06-28',
    items: [
      '新增背景音乐播放器：支持播放/暂停/切歌/音量/进度控制，跨页面无缝续播',
      '音乐库分类展示（电子/氛围/节奏），支持收藏与播放历史记录',
      'AI 助手升级至 Agnes AI（agnes-2.0-flash），支持流式对话与上下文理解',
      'AI 助手新增语音输入（Web Speech API）与语音播报（TTS）',
      'AI 助手支持 Ctrl/Cmd+K 快捷键唤醒，对话历史持久化存储',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-06-28',
    items: [
      '新增照片展示区域，以赛博朋克风格呈现项目与生活瞬间',
      '新增版本更新提示弹窗，首次访问新版本自动展示更新内容',
      '修复个人博客项目跳转链接，在线体验入口现已指向实际部署地址',
      '评论与点赞功能优化，支持嵌套回复与防重复点赞',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-20',
    items: [
      'GitHub 开源区块上线，实时同步仓库与在线体验入口',
      'Fly.io 自动化部署，GitHub Actions CI/CD 流水线',
      '赛博朋克设计系统全面升级，霓虹荧光绿主题',
    ],
  },
]

// 获取配置（优先从环境变量读取，fallback 到硬编码）
export function getSiteConfig() {
  return {
    ...SITE_CONFIG,
    email: process.env.CONTACT_EMAIL || SITE_CONFIG.email,
    siteUrl: process.env.NEXTAUTH_URL || SITE_CONFIG.siteUrl,
    githubUsername: process.env.GITHUB_USERNAME || SITE_CONFIG.githubUsername,
  }
}
