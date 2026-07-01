import { PrismaClient } from '@prisma/client'

// 简化版 seed：仅导入音乐曲目和心情配置（不依赖 bcryptjs）
// 用于生产环境通过 flyctl ssh console 执行

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始音乐数据种子...')

  // ========== 心情配置 ==========
  const moodsData = [
    { key: 'happy', name: '开心', icon: '😊', color: '#ffe600', description: '欢快明亮，让心情飞扬', order: 1 },
    { key: 'relaxed', name: '放松', icon: '🌿', color: '#00ff9f', description: '舒缓悠扬，身心舒展', order: 2 },
    { key: 'sad', name: '伤感', icon: '🌧', color: '#00d4ff', description: '低吟浅唱，治愈心灵', order: 3 },
    { key: 'energetic', name: '激情', icon: '⚡', color: '#ff0080', description: '热血澎湃，能量满满', order: 4 },
    { key: 'focused', name: '专注', icon: '🎯', color: '#ccff00', description: '深度聚焦，心流状态', order: 5 },
    { key: 'passionate', name: '浪漫', icon: '💜', color: '#a855f7', description: '温柔缱绻，情意绵绵', order: 6 },
  ]
  for (const m of moodsData) {
    await prisma.mood.upsert({
      where: { key: m.key },
      update: m,
      create: m,
    })
  }
  console.log('✅ 心情配置:', moodsData.length)

  // ========== 音乐曲目库 ==========
  // 全部使用 SoundHelix 公开 MP3（完整曲目，无版权限制，自2011年稳定运行至今）
  const tracksData = [
    { title: '夜曲', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', mood: 'sad,passionate', isHot: true, order: 1, playable: true },
    { title: '青花瓷', artist: '周杰伦', category: 'pop', region: 'cn', duration: 238, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', mood: 'passionate,relaxed', isHot: true, order: 2, playable: true },
    { title: '七里香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 299, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', mood: 'passionate,happy', isHot: true, order: 3, playable: true },
    { title: '稻香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', mood: 'happy,relaxed', isHot: true, order: 4, playable: true },
    { title: '后来', artist: '刘若英', category: 'pop', region: 'cn', duration: 286, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', mood: 'sad,passionate', isHot: true, order: 5, playable: true },
    { title: '遇见', artist: '孙燕姿', category: 'pop', region: 'cn', duration: 255, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', mood: 'passionate,relaxed', isHot: true, order: 6, playable: true },
    { title: '光年之外', artist: '邓紫棋', category: 'pop', region: 'cn', duration: 235, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', mood: 'energetic,passionate', isHot: true, order: 7, playable: true },
    { title: '起风了', artist: '买辣椒也用券', category: 'pop', region: 'cn', duration: 325, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', mood: 'passionate,sad', isHot: true, order: 8, playable: true },
    { title: '赛博东风', artist: 'ElectronCN', category: 'electronic', region: 'cn', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', mood: 'energetic,focused', isHot: false, order: 9, playable: true },
    { title: '霓虹长城', artist: 'CyberHan', category: 'electronic', region: 'cn', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899', source: 'local', mood: 'energetic,focused', isHot: false, order: 10, playable: true },
    { title: '锦鲤抄', artist: '银临', category: 'guofeng', region: 'cn', duration: 268, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6', source: 'local', mood: 'relaxed,passionate', isHot: false, order: 11, playable: true },
    { title: '凉凉', artist: '张碧晨', category: 'guofeng', region: 'cn', duration: 295, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', mood: 'sad,relaxed', isHot: false, order: 12, playable: true },
    { title: '千千阙歌', artist: '陈慧娴', category: 'pop', region: 'cn', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover: '#f97316', source: 'local', mood: 'sad,passionate', isHot: false, order: 13, playable: true },
    { title: '海阔天空', artist: 'Beyond', category: 'rock', region: 'cn', duration: 326, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover: '#84cc16', source: 'local', mood: 'energetic,passionate', isHot: true, order: 14, playable: true },
    { title: '红玫瑰', artist: '陈奕迅', category: 'pop', region: 'cn', duration: 278, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover: '#a855f7', source: 'local', mood: 'passionate,sad', isHot: false, order: 15, playable: true },
    { title: '匆匆那年', artist: '王菲', category: 'pop', region: 'cn', duration: 302, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', cover: '#6366f1', source: 'local', mood: 'sad,relaxed', isHot: false, order: 16, playable: true },
    { title: 'Neon Pulse', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', mood: 'energetic,focused', isHot: true, order: 17, playable: true },
    { title: 'Data Stream', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 426, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', mood: 'focused,energetic', isHot: true, order: 18, playable: true },
    { title: 'Glitch City', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 304, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', mood: 'energetic', isHot: false, order: 19, playable: true },
    { title: 'Synth Wave', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 297, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', mood: 'focused,relaxed', isHot: false, order: 20, playable: true },
    { title: 'Midnight Code', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 391, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', mood: 'focused,relaxed', isHot: true, order: 21, playable: true },
    { title: 'Quiet Terminal', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 358, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', mood: 'relaxed,focused', isHot: false, order: 22, playable: true },
    { title: 'Deep Focus', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 412, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', mood: 'focused', isHot: true, order: 23, playable: true },
    { title: 'Overclock', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', mood: 'energetic', isHot: false, order: 24, playable: true },
    { title: 'High Voltage', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', mood: 'energetic,happy', isHot: false, order: 25, playable: true },
    { title: 'Turbo Mode', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 318, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '#ec4899', source: 'local', mood: 'energetic', isHot: false, order: 26, playable: true },
    { title: 'Cyber Run', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 401, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '#8b5cf6', source: 'local', mood: 'energetic,focused', isHot: false, order: 27, playable: true },
    { title: 'Final Compile', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 366, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', mood: 'focused,happy', isHot: false, order: 28, playable: true },
  ]

  // 先清空旧数据（避免 URL 重复导致数据覆盖）
  await prisma.musicTrack.deleteMany({})
  // 批量创建所有曲目（28首曲目共享16个SoundHelix URL，按URL查重会丢数据）
  for (const t of tracksData) {
    await prisma.musicTrack.create({ data: t })
  }
  console.log(`✅ 音乐曲目: ${tracksData.length} (全部新建)`)

  console.log('🎉 音乐数据种子完成!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
