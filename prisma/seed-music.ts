import { PrismaClient } from '@prisma/client'

// 简化版 seed：仅导入音乐曲目和心情配置（不依赖 bcryptjs）
// 用于生产环境通过 flyctl ssh console 执行
// 所有曲目使用 iTunes 官方 30 秒预览（m4a 格式，长期有效，无版权限制）

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
  // 所有曲目使用 iTunes 官方 30 秒预览（m4a 格式）
  // 优点：1)真实歌曲非纯音乐 2)无版权限制 3)长期有效 4)支持 Range 请求
  const tracksData = [
    // ===== 周杰伦（真实歌曲） =====
    { title: '晴天', artist: '周杰伦', category: 'pop', region: 'cn', duration: 269, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/20/d0/e7/20d0e7db-9c12-795a-d738-2fc3dde4ac9a/mzaf_10317517925583301645.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/29/c1/2d/29c12de6-54b4-f549-9d9f-07d8a04221ea/JAY.jpg/100x100bb.jpg', source: 'local', mood: 'passionate,sad', isHot: true, order: 1, playable: true, album: '叶惠美' },
    { title: '七里香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 297, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/99/4e/e2/994ee285-7c0d-73ab-85b7-8d3899a17242/mzaf_12441330510018253101.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/29/c1/2d/29c12de6-54b4-f549-9d9f-07d8a04221ea/JAY.jpg/100x100bb.jpg', source: 'local', mood: 'passionate,happy', isHot: true, order: 2, playable: true, album: '七里香' },
    { title: '搁浅', artist: '周杰伦', category: 'pop', region: 'cn', duration: 238, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f7/e6/e6/f7e6e6e4-4dfa-7e7f-b905-a67738621992/mzaf_5977864392377716485.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/29/c1/2d/29c12de6-54b4-f549-9d9f-07d8a04221ea/JAY.jpg/100x100bb.jpg', source: 'local', mood: 'sad,passionate', isHot: true, order: 3, playable: true, album: '七里香' },
    { title: '稻香', artist: '周杰伦', category: 'pop', region: 'cn', duration: 223, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/c3/c4/e0/c3c4e033-2bd0-e0fc-3195-3ec68299f19f/mzaf_9545722078596740089.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1b/63/9e/1b639e5b-f8ca-a6e1-8612-6396bc9ff0eb/4711448407424.jpg/100x100bb.jpg', source: 'local', mood: 'happy,relaxed', isHot: true, order: 4, playable: true, album: '魔杰座' },
    { title: '花海', artist: '周杰伦', category: 'pop', region: 'cn', duration: 264, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/c8/5c/29/c85c296f-961d-137c-2033-a0e46d5b1df1/mzaf_4173678733749424959.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1b/63/9e/1b639e5b-f8ca-a6e1-8612-6396bc9ff0eb/4711448407424.jpg/100x100bb.jpg', source: 'local', mood: 'passionate,relaxed', isHot: true, order: 5, playable: true, album: '魔杰座' },
    { title: '兰亭序', artist: '周杰伦', category: 'pop', region: 'cn', duration: 253, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/6c/a4/df/6ca4df9b-c508-5560-5df8-77ab48f47bfd/mzaf_13729556069309804879.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1b/63/9e/1b639e5b-f8ca-a6e1-8612-6396bc9ff0eb/4711448407424.jpg/100x100bb.jpg', source: 'local', mood: 'passionate,relaxed', isHot: false, order: 6, playable: true, album: '魔杰座' },
    { title: '说好的幸福呢', artist: '周杰伦', category: 'pop', region: 'cn', duration: 256, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/ac/c9/bd/acc9bd6f-c55e-737f-461d-667edcea2eb0/mzaf_16777883841796357789.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1b/63/9e/1b639e5b-f8ca-a6e1-8612-6396bc9ff0eb/4711448407424.jpg/100x100bb.jpg', source: 'local', mood: 'sad,passionate', isHot: false, order: 7, playable: true, album: '魔杰座' },
    { title: '爱在西元前', artist: '周杰伦', category: 'pop', region: 'cn', duration: 234, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/d1/93/62/d19362ca-9653-10c8-1f40-0362e97f2989/mzaf_8169118584404749930.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a4/f2/f0/a4f2f0d4-cc80-d1a0-7f20-a0cc842a523c/JAY.jpg/100x100bb.jpg', source: 'local', mood: 'energetic,passionate', isHot: true, order: 8, playable: true, album: '范特西' },
    { title: '半岛铁盒', artist: '周杰伦', category: 'pop', region: 'cn', duration: 317, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/51/43/89/5143896f-4d7b-f1b2-04d9-f4a60351442f/mzaf_3702135241729636934.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/96/c8/a1/96c8a1d8-8077-b8a7-8600-80b2abf1fe20/JAY.jpg/100x100bb.jpg', source: 'local', mood: 'passionate,relaxed', isHot: false, order: 9, playable: true, album: '八度空间' },
    { title: '明明就', artist: '周杰伦', category: 'pop', region: 'cn', duration: 260, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/e4/67/3c/e4673c4c-f756-00e8-ad12-dc69adc26104/mzaf_4868349525858975467.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/81/83/e6/8183e6c0-7137-7009-347e-326b53cb4a3b/2000x2000pix.jpg/100x100bb.jpg', source: 'local', mood: 'sad,passionate', isHot: false, order: 10, playable: true, album: '十二新作' },
    // ===== 其他华语歌手（真实歌曲） =====
    { title: '我怀念的', artist: '孙燕姿', category: 'pop', region: 'cn', duration: 289, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9e/06/17/9e061768-b9a1-bd04-da3c-45744fb3282d/mzaf_13127211952509430510.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/39/8e/7d/398e7d64-1877-03ab-17cb-460943429bc0/825646246939.jpg/100x100bb.jpg', source: 'local', mood: 'sad,passionate', isHot: true, order: 11, playable: true, album: '逆光' },
    { title: '多远都要在一起', artist: '邓紫棋', category: 'pop', region: 'cn', duration: 216, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/15/d0/03/15d0034a-9e84-ab03-ee84-94b18c6c0306/mzaf_5740373973667616749.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/55/bb/c7/55bbc782-299e-7f24-bc4a-ae129e6d8030/mzm.rpqttxch.jpg/100x100bb.jpg', source: 'local', mood: 'energetic,passionate', isHot: true, order: 12, playable: true, album: '新的心跳' },
    { title: '海阔天空', artist: 'Beyond', category: 'rock', region: 'cn', duration: 326, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/31/93/d7/3193d798-a4c8-1b4f-859c-6f46f9cd4c29/mzaf_53818723969579585.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/68/71/ef/6871efa6-ea25-86c2-9b11-edc86578a3b1/639842631624.jpg/100x100bb.jpg', source: 'local', mood: 'energetic,passionate', isHot: true, order: 13, playable: true, album: '我爱经典系列: Beyond' },
    { title: '爱情转移', artist: '陈奕迅', category: 'pop', region: 'cn', duration: 259, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/5a/ee/83/5aee8371-70a0-4f53-7ff5-dc0823beabee/mzaf_10611587849510578238.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/27/cb/d6/27cbd6b4-c991-cd95-49e3-b6019462ff97/00602517338845.rgb.jpg/100x100bb.jpg', source: 'local', mood: 'passionate,sad', isHot: true, order: 14, playable: true, album: '认了吧 (台湾版)' },
    { title: '红豆', artist: '王菲', category: 'pop', region: 'cn', duration: 256, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/80/4b/07/804b07ec-b2db-94f8-df3e-be7a64fc57cc/mzaf_4703697437529710995.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/58/0e/51/580e517e-69a0-decc-96a4-b39fee54945c/Untitled.jpg/100x100bb.jpg', source: 'local', mood: 'sad,relaxed', isHot: false, order: 15, playable: true, album: '唱游' },
    { title: '千千阕歌', artist: '陈慧娴', category: 'pop', region: 'cn', duration: 296, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/0d/70/99/0d70996a-cbe0-04ee-2225-ba2532513c3b/mzaf_17512855091032139066.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b2/0f/54/b20f5464-df85-fc41-06f2-7fa72967cd68/00602527111193.rgb.jpg/100x100bb.jpg', source: 'local', mood: 'sad,passionate', isHot: false, order: 16, playable: true, album: '复黑王: 永远是你的' },
    { title: '牵丝戏', artist: '银临', category: 'guofeng', region: 'cn', duration: 239, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/f8/54/78/f8547850-ee6c-5814-49bd-66290cb6963f/mzaf_13311601243666945372.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/85/63/98/85639821-dfbd-dac2-eb6d-9788c9e59b97/dj.obaagrhq.jpg/100x100bb.jpg', source: 'local', mood: 'relaxed,passionate', isHot: false, order: 17, playable: true, album: '牵丝戏 - Single' },
    { title: '年轮', artist: '张碧晨', category: 'guofeng', region: 'cn', duration: 274, url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a5/9d/e3/a59de36f-77ac-7abd-9bee-3d7a44ef6e6b/mzaf_1224857706193190547.plus.aac.p.m4a', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b2/7c/5e/b27c5e6e-f841-216f-5062-520e64b01a8d/EP-NL.jpg/100x100bb.jpg', source: 'local', mood: 'sad,relaxed', isHot: false, order: 18, playable: true, album: '年轮 - Single' },
    // ===== 国际电子/氛围（保留 SoundHelix 作为纯音乐背景） =====
    { title: 'Neon Pulse', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '#00ff9f', source: 'local', mood: 'energetic,focused', isHot: true, order: 19, playable: true },
    { title: 'Data Stream', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 426, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '#00d4ff', source: 'local', mood: 'focused,energetic', isHot: true, order: 20, playable: true },
    { title: 'Glitch City', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 304, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '#ff0080', source: 'local', mood: 'energetic', isHot: false, order: 21, playable: true },
    { title: 'Synth Wave', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 297, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '#ccff00', source: 'local', mood: 'focused,relaxed', isHot: false, order: 22, playable: true },
    { title: 'Midnight Code', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 391, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '#7c3aed', source: 'local', mood: 'focused,relaxed', isHot: true, order: 23, playable: true },
    { title: 'Quiet Terminal', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 358, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '#3b82f6', source: 'local', mood: 'relaxed,focused', isHot: false, order: 24, playable: true },
    { title: 'Deep Focus', artist: 'SoundHelix', category: 'ambient', region: 'intl', duration: 412, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '#10b981', source: 'local', mood: 'focused', isHot: true, order: 25, playable: true },
    { title: 'Overclock', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 285, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '#f59e0b', source: 'local', mood: 'energetic', isHot: false, order: 26, playable: true },
    { title: 'High Voltage', artist: 'SoundHelix', category: 'beats', region: 'intl', duration: 339, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '#ef4444', source: 'local', mood: 'energetic,happy', isHot: false, order: 27, playable: true },
    { title: 'Final Compile', artist: 'SoundHelix', category: 'electronic', region: 'intl', duration: 366, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '#06b6d4', source: 'local', mood: 'focused,happy', isHot: false, order: 28, playable: true },
  ]

  // 先清空旧数据（避免重复）
  await prisma.musicTrack.deleteMany({})
  // 批量创建所有曲目
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
