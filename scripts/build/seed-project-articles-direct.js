"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 为所有项目创建介绍文章，并建立 4 个方向分类
 * 运行方式（在 Fly.io 容器中）: node scripts/seed-project-articles-direct.js
 * 或本地（可连库时）: npx tsx scripts/seed-project-articles-direct.ts
 *
 * 注意：使用 upsert，已存在的文章会更新 excerpt / content / 分类
 */
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 开始创建项目介绍文章...\n');
    const admin = await prisma.user.findUnique({ where: { email: 'admin@xiaowu.dev' } });
    if (!admin) {
        console.error('❌ 管理员不存在，请先运行 seed.ts');
        process.exit(1);
    }
    console.log(`✅ 管理员: ${admin.email}`);
    // 1. 创建 4 个方向分类
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'frontend' },
            update: { name: '前端', description: '前端开发技术与项目实践' },
            create: { name: '前端', slug: 'frontend', description: '前端开发技术与项目实践' },
        }),
        prisma.category.upsert({
            where: { slug: 'java-backend' },
            update: { name: 'Java后端', description: 'Java 后端开发技术与项目实践' },
            create: { name: 'Java后端', slug: 'java-backend', description: 'Java 后端开发技术与项目实践' },
        }),
        prisma.category.upsert({
            where: { slug: 'fullstack' },
            update: { name: '全栈', description: '全栈开发技术与项目实践' },
            create: { name: '全栈', slug: 'fullstack', description: '全栈开发技术与项目实践' },
        }),
        prisma.category.upsert({
            where: { slug: 'ai-projects' },
            update: { name: 'AI项目', description: '人工智能应用与项目实践' },
            create: { name: 'AI项目', slug: 'ai-projects', description: '人工智能应用与项目实践' },
        }),
    ]);
    const catMap = new Map(categories.map((c) => [c.slug, c.id]));
    console.log(`✅ 方向分类: ${categories.length} (前端/Java后端/全栈/AI项目)`);
    // 2. 确保标签存在
    const tagData = [
        { name: 'Next.js', slug: 'nextjs' },
        { name: 'React', slug: 'react' },
        { name: 'Vue', slug: 'vue' },
        { name: 'TypeScript', slug: 'typescript' },
        { name: 'Prisma', slug: 'prisma' },
        { name: 'TailwindCSS', slug: 'tailwindcss' },
        { name: 'Java', slug: 'java' },
        { name: 'Spring Boot', slug: 'springboot' },
        { name: 'Python', slug: 'python' },
        { name: 'YOLO', slug: 'yolo' },
        { name: 'OpenCV', slug: 'opencv' },
        { name: 'PyTorch', slug: 'pytorch' },
        { name: 'AI', slug: 'ai' },
        { name: 'RAG', slug: 'rag' },
        { name: 'LLM', slug: 'llm' },
        { name: 'FastAPI', slug: 'fastapi' },
        { name: 'ChromaDB', slug: 'chromadb' },
        { name: 'MySQL', slug: 'mysql' },
        { name: 'Docker', slug: 'docker' },
        { name: 'GitHub Actions', slug: 'github-actions' },
        { name: 'Vercel', slug: 'vercel' },
        { name: 'Fly.io', slug: 'flyio' },
        { name: 'Vite', slug: 'vite' },
        { name: 'Pinia', slug: 'pinia' },
        { name: 'Node.js', slug: 'nodejs' },
        { name: 'PostgreSQL', slug: 'postgresql' },
    ];
    const tags = await Promise.all(tagData.map((t) => prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })));
    const tagMap = new Map(tags.map((t) => [t.slug, t.id]));
    console.log(`✅ 标签: ${tags.length}`);
    // 3. 项目介绍文章（excerpt 长一些，内容充实）
    const articles = [
        // ============ 全栈方向 ============
        {
            title: 'CyberBlog 赛博朋克风格全栈博客系统',
            slug: 'project-cyberblog',
            categorySlug: 'fullstack',
            excerpt: '基于 Next.js 16 App Router + Prisma 6 + Tailwind CSS 4 构建的个人作品集与博客系统，采用赛博朋克设计语言（霓虹色、故障艺术、Orbitron 字体）。涵盖文章管理、评论系统、点赞收藏、项目管理、联系表单、CMS 后台、AI 助手、音乐播放器等模块，部署于 Fly.io 香港节点，Lighthouse 90+ 分，是设计与工程能力的综合体现。',
            content: `# CyberBlog 赛博朋克风格全栈博客系统

## 项目背景

CyberBlog 是我的个人数字品牌作品集，目标是将所有项目沉淀为一个可复用的作品集系统，同时展示设计审美与工程能力。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | SSR/SSG、Server Components、Streaming SSR |
| 语言 | TypeScript 5.7 | 全栈类型安全 |
| 样式 | Tailwind CSS 4 | CSS 优先配置、原子化 |
| 数据库 | Neon PostgreSQL | Serverless Postgres |
| ORM | Prisma 6 | 类型安全、迁移管理 |
| 部署 | Fly.io | 香港节点、国内访问优化 |
| CI/CD | GitHub Actions | 自动化部署 |

## 核心功能

### 1. 内容系统
- 文章管理（Markdown 渲染、目录、阅读进度条）
- 评论系统（嵌套回复、审核机制、限流）
- 点赞与收藏（本地存储记忆）

### 2. 作品展示
- 项目卡片（3D 倾斜、难度排序、分类筛选）
- 能力雷达图
- 实时统计数据

### 3. 交互体验
- 鼠标光斑跟随
- 赛博朋克设计系统（霓虹、故障、扫描线）
- 移动端触屏适配

### 4. CMS 后台
- 文章/项目/分类/标签 CRUD
- 评论审核
- 站点配置

## 工程亮点

\`\`\`typescript
// 数据库连接池优化，解决 P2024 超时
function buildDatasourceUrl(): string | undefined {
  const url = new URL(process.env.DATABASE_URL!)
  url.searchParams.set('connection_limit', '10')
  url.searchParams.set('pool_timeout', '30')
  if (url.hostname.includes('pooler')) {
    url.searchParams.set('pgbouncer', 'true')
  }
  return url.toString()
}
\`\`\`

## 经验总结

1. **数据库设计先行**：13+ 数据模型，多对多关系，级联删除
2. **类型安全贯穿**：从 Prisma 到前端，TypeScript 减少 80% 运行时错误
3. **部署要早**：不要等开发完成才考虑部署
4. **性能优先**：Lighthouse 90+，CLS/LCP/FID 全绿

> 全栈开发的核心不是掌握所有技术，而是理解各层级的协作方式。`,
            tagSlugs: ['nextjs', 'react', 'typescript', 'prisma', 'tailwindcss', 'flyio', 'github-actions', 'postgresql'],
        },
        {
            title: '教材ING 智能教材查询与管理平台',
            slug: 'project-textbook-ing',
            categorySlug: 'fullstack',
            excerpt: '面向高校师生的校园信息服务平台，核心解决教材信息查询困难、教学日历不透明、校园资讯分散三大痛点。基于 Vue 3.5 + Vite 6 + Pinia + Vercel Serverless + Prisma + Neon PostgreSQL 构建，含教材多维度查询、校历教学周、新闻资讯、用户系统、积分、消息通知六大模块及独立管理后台，已迭代至 v12.0，含 13+ 数据模型与 11+ API 模块。',
            content: `# 教材ING 智能教材查询与管理平台

## 项目背景

高校师生长期面临教材信息查询困难、教学日历不透明、校园资讯分散三大痛点。教材ING 将分散的校园信息整合为统一平台，是从产品设计到上线部署的完整全栈实践。

## 技术栈

- **前端**：Vue 3.5、TypeScript、Vite 6、Pinia、TailwindCSS
- **后端**：Vercel Serverless Functions、Prisma、Neon PostgreSQL
- **认证**：JWT、Zod 校验
- **部署**：Vercel

## 核心模块

### 1. 教材查询
多维度查询（课程/学院/专业/学期）、教材详情、教学日历

### 2. 用户系统
注册登录、积分系统、消息通知、个人中心

### 3. 管理后台
独立的管理后台，教材/用户/新闻/校历 CRUD

## 工程亮点

\`\`\`typescript
// Vercel Serverless 函数模块化拆分
export default defineServerlessFunction({
  '/api/textbooks': textbooksHandler,
  '/api/calendar': calendarHandler,
  '/api/news': newsHandler,
})
\`\`\`

\`\`\`prisma
// 13+ 数据模型
model Textbook { ... }
model Course { ... }
model Semester { ... }
model User { ... }
model Points { ... }
model Notification { ... }
\`\`\`

## 经验总结

1. **模块化拆分**：11+ API 模块独立维护
2. **渐进式迭代**：从 v1.0 到 v12.0，逐步完善
3. **用户系统完整**：积分、消息通知提升留存

> 将分散信息整合为统一平台，是产品思维的实战训练。`,
            tagSlugs: ['vue', 'typescript', 'vite', 'pinia', 'tailwindcss', 'prisma', 'vercel', 'postgresql'],
        },
        // ============ AI项目方向 ============
        {
            title: '心语日记 多智能体驱动的AI情绪日记',
            slug: 'project-xinyu-diary',
            categorySlug: 'ai-projects',
            excerpt: '基于多智能体协作的 AI 日记应用，通过情绪感知器、记忆管家、日记生成器、对话精灵四个智能体分工协作，实现情绪识别、记忆管理、个性化日记生成与温暖对话。技术栈含 Python + FastAPI + DeepSeek API + ChromaDB + BGE 嵌入模型 + SSE 实时推送，支持向量记忆检索与在线体验，是 AI 落地产品的完整实践。',
            content: `# 心语日记 多智能体驱动的AI情绪日记

## 项目背景

传统日记应用缺乏情感理解与个性化。心语日记通过多智能体架构，让 AI 真正理解用户情绪并生成有温度的内容。

## 系统架构

\`\`\`
用户输入 → 情绪感知器 → 记忆管家 → 日记生成器 → 对话精灵 → 用户输出
\`\`\`

### 1. 情绪感知器
\`\`\`typescript
interface EmotionResult {
  primary: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral'
  intensity: number
  tags: string[]
}

async function detectEmotion(text: string): Promise<EmotionResult> {
  const response = await callLLM(\`分析情绪：\${text}\`)
  return JSON.parse(response)
}
\`\`\`

### 2. 记忆管家
\`\`\`python
# ChromaDB 向量记忆
collection = client.create_collection("memories")
collection.add(documents=[...], ids=[...])
results = collection.query(query_texts=[user_input], n_results=5)
\`\`\`

### 3. 日记生成器
基于情绪与记忆，生成个性化日记

### 4. 对话精灵
温暖陪伴式对话，SSE 实时推送

## 技术栈

- **后端**：Python、FastAPI
- **LLM**：DeepSeek API
- **向量库**：ChromaDB、BGE 嵌入模型
- **实时**：SSE 流式推送
- **前端**：JavaScript、localStorage

## 工程亮点

\`\`\`python
# 多智能体协作
async def pipeline(user_input):
    emotion = await detect_emotion(user_input)
    memories = await retrieve_memories(user_input, emotion)
    diary = await generate_diary(user_input, emotion, memories)
    reply = await chat(user_input, emotion, memories)
    return { "diary": diary, "reply": reply }
\`\`\`

## 经验总结

1. **多智能体分工**：每个智能体专注单一职责
2. **向量记忆**：让 AI 记住用户历史
3. **情绪驱动**：个性化输出提升体验

> 多智能体系统让 AI 应用更加智能和个性化。`,
            tagSlugs: ['python', 'fastapi', 'ai', 'llm', 'rag', 'chromadb'],
        },
        {
            title: 'YOLO 食品安全检测系统',
            slug: 'project-yolo-food-safety',
            categorySlug: 'ai-projects',
            excerpt: '基于 YOLO 目标检测算法的食品安全检测系统，实时识别食品加工人员是否佩戴安全装备（头盔、口罩、手套、围裙、靴子）及是否存在违规操作。涵盖训练数据集准备、模型训练（mAP 85%+）、Web 检测界面开发及 GitHub Pages 部署，支持实时 30+ FPS 检测，是计算机视觉从训练到部署的全流程实践。',
            content: `# YOLO 食品安全检测系统

## 项目背景

食品加工行业对人员安全装备有严格要求。传统人工监控效率低、易遗漏。本系统通过 YOLO 实时检测，自动识别违规行为。

## 技术栈

- **算法**：YOLOv8、PyTorch
- **视觉**：OpenCV
- **后端**：Python、Flask
- **部署**：GitHub Pages

## 完整流程

### 1. 数据集准备
\`\`\`yaml
# data.yaml
train: ../images/train
val: ../images/val
nc: 5
names: ['helmet', 'mask', 'gloves', 'apron', 'boots']
\`\`\`

### 2. 模型训练
\`\`\`python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.train(data='data.yaml', epochs=100, imgsz=640, batch=16)

metrics = model.val()
print(f"mAP50: {metrics.box.map50:.3f}")  # 85%+
\`\`\`

### 3. Web 检测界面
\`\`\`python
@app.route('/detect', methods=['POST'])
def detect():
    image = request.files['image']
    results = model(image)
    return jsonify(results)
\`\`\`

### 4. 性能优化

1. **模型量化**：INT8 量化减少模型体积
2. **WebGL 加速**：TensorFlow.js 后端
3. **帧率控制**：每 3 帧检测一次，保持 30 FPS

## 关键指标

| 指标 | 数值 |
|------|------|
| 检测类别 | 5+ |
| mAP | 85%+ |
| 实时 FPS | 30+ |

## 经验总结

1. **数据为王**：高质量数据集决定模型上限
2. **端到端实践**：从训练到部署的全流程
3. **性能与精度平衡**：量化与帧率控制

> 计算机视觉落地为可用产品，需要工程化思维。`,
            tagSlugs: ['python', 'yolo', 'opencv', 'pytorch'],
        },
        // ============ 前端方向 ============
        {
            title: 'NeuralDash 数据可视化仪表盘',
            slug: 'project-neuraldash',
            categorySlug: 'frontend',
            excerpt: '基于 React + D3.js + WebSocket 构建的数据可视化仪表盘，支持实时数据流展示、自定义图表配置与智能预警。通过 WebSocket 实现数据实时推送，D3.js 绘制可交互图表，并提供灵活的配置面板让用户自定义仪表盘布局，是前端数据可视化与实时通信的综合实践。',
            content: `# NeuralDash 数据可视化仪表盘

## 项目背景

数据驱动决策需要直观的可视化工具。NeuralDash 提供实时数据流展示与智能预警能力。

## 技术栈

- **框架**：React
- **可视化**：D3.js
- **实时通信**：WebSocket、Node.js

## 核心功能

### 1. 实时数据流
\`\`\`typescript
const ws = new WebSocket('ws://localhost:8080')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  updateChart(data)
}
\`\`\`

### 2. 自定义图表
- 折线图、柱状图、饼图、热力图
- 拖拽布局、配置面板

### 3. 智能预警
- 阈值告警
- 异常检测
- 通知推送

## 工程亮点

\`\`\`typescript
// D3.js 可交互图表
const svg = d3.select('#chart')
  .append('svg')
  .attr('width', 800)
  .attr('height', 400)

svg.selectAll('rect')
  .data(dataset)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * 30)
  .attr('y', (d) => 400 - d)
  .attr('height', (d) => d)
  .attr('width', 25)
\`\`\`

## 经验总结

1. **实时性**：WebSocket 保证数据及时性
2. **可配置**：用户自定义提升灵活性
3. **可视化**：D3.js 提供丰富图表能力

> 数据可视化让复杂数据变得直观可懂。`,
            tagSlugs: ['react', 'typescript', 'nodejs'],
        },
        {
            title: 'PixelForge 像素艺术生成器',
            slug: 'project-pixelforge',
            categorySlug: 'frontend',
            excerpt: '基于 TypeScript + Canvas API + Web Workers 构建的像素艺术生成器，支持多种生成算法、调色板自定义与导出功能。利用 Web Workers 将计算密集的生成任务放到后台线程，保证 UI 流畅；Canvas API 实现像素级绘制与实时预览。作为个人博客作品集系统的子模块，体现了前端工程化与性能优化能力。',
            content: `# PixelForge 像素艺术生成器

## 项目背景

像素艺术在游戏、插画领域应用广泛。PixelForge 提供算法化生成能力，让创作者快速产出像素作品。

## 技术栈

- **语言**：TypeScript
- **绘制**：Canvas API
- **并发**：Web Workers
- **集成**：个人博客作品集子模块

## 核心功能

### 1. 生成算法
\`\`\`typescript
// 多种生成算法
const algorithms = {
  random: generateRandom,
  cellular: cellularAutomata,
  perlin: perlinNoise,
  wave: waveFunctionCollapse,
}

function generate(type: AlgorithmType, size: number) {
  return algorithms[type](size)
}
\`\`\`

### 2. Web Workers 后台计算
\`\`\`typescript
// worker.ts
self.onmessage = (e) => {
  const { algorithm, size } = e.data
  const result = generatePixelArt(algorithm, size)
  self.postMessage(result)
}

// 主线程
const worker = new Worker('./worker.ts')
worker.postMessage({ algorithm: 'cellular', size: 64 })
worker.onmessage = (e) => renderToCanvas(e.data)
\`\`\`

### 3. 调色板与导出
- 自定义调色板
- PNG/SVG 导出
- 动画 GIF 序列

## 工程亮点

\`\`\`typescript
// Canvas 像素级绘制
function renderToCanvas(pixels: number[][]) {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)
  pixels.forEach((row, y) => {
    row.forEach((color, x) => {
      const idx = (y * width + x) * 4
      imageData.data.set(palette[color], idx)
    })
  })
  ctx.putImageData(imageData, 0, 0)
}
\`\`\`

## 经验总结

1. **性能优化**：Web Workers 避免主线程阻塞
2. **算法多样**：满足不同创作需求
3. **模块化**：作为子模块集成到博客系统

> 前端不只是展示，也能做计算密集型任务。`,
            tagSlugs: ['typescript', 'react', 'nodejs'],
        },
        {
            title: '学生管理系统（前后端分离）',
            slug: 'project-student-management',
            categorySlug: 'frontend',
            excerpt: '基于 HTML + JavaScript + CSS + RESTful API 实现的前后端分离学生信息管理系统，支持学生信息的增删改查、分页查询、条件搜索。采用前后端分离架构，前端纯静态实现部署于 GitHub Pages，后端提供 RESTful API，是入门全栈开发的经典实践项目。',
            content: `# 学生管理系统（前后端分离）

## 项目背景

学生信息管理是教学场景的基础需求。本项目作为入门全栈开发的实践，采用前后端分离架构。

## 技术栈

- **前端**：HTML、JavaScript、CSS
- **架构**：前后端分离
- **API**：RESTful
- **部署**：GitHub Pages

## 核心功能

### 1. CRUD 操作
\`\`\`javascript
// 增
async function addStudent(student) {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  })
  return res.json()
}

// 查（分页 + 条件）
async function queryStudents({ page, size, keyword }) {
  const qs = new URLSearchParams({ page, size, keyword })
  const res = await fetch(\`/api/students?\${qs}\`)
  return res.json()
}
\`\`\`

### 2. 分页与搜索
- 分页查询
- 多条件搜索（姓名/学号/班级）
- 排序

### 3. 响应式 UI
- 表格展示
- 表单弹窗
- 移动端适配

## 工程亮点

\`\`\`javascript
// 前后端分离
const API_BASE = 'https://api.example.com'

async function loadList() {
  showLoading()
  const data = await queryStudents(state)
  renderTable(data.list)
  renderPagination(data.total)
}
\`\`\`

## 经验总结

1. **前后端分离**：职责清晰，独立部署
2. **RESTful 规范**：统一的 API 设计
3. **静态部署**：GitHub Pages 零成本

> 从简单项目入手，理解全栈基本架构。`,
            tagSlugs: ['nodejs'],
        },
        {
            title: '电子订单查询系统',
            slug: 'project-order-management',
            categorySlug: 'frontend',
            excerpt: '基于 HTML + JavaScript + CSS + Swagger 构建的电商订单查询系统，支持订单状态跟踪、多条件搜索、订单详情查看。提供完整的 Swagger API 文档，便于接口联调与维护。纯前端实现并部署于 GitHub Pages，是 API 文档规范化的实践项目。',
            content: `# 电子订单查询系统

## 项目背景

电商场景下，订单查询是高频操作。本系统提供订单全流程跟踪能力。

## 技术栈

- **前端**：HTML、JavaScript、CSS
- **API 文档**：Swagger
- **部署**：GitHub Pages

## 核心功能

### 1. 订单状态跟踪
\`\`\`javascript
const ORDER_STATUS = {
  PENDING: '待付款',
  PAID: '已付款',
  SHIPPED: '已发货',
  DELIVERED: '已签收',
  CANCELLED: '已取消',
}

async function trackOrder(orderId) {
  const res = await fetch(\`/api/orders/\${orderId}\`)
  const order = await res.json()
  renderStatusTimeline(order.timeline)
}
\`\`\`

### 2. 多条件搜索
- 订单号、手机号、时间范围
- 状态筛选
- 组合查询

### 3. Swagger API 文档
\`\`\`yaml
openapi: 3.0.0
paths:
  /api/orders:
    get:
      summary: 查询订单列表
      parameters:
        - name: keyword
        - name: status
        - name: page
\`\`\`

## 工程亮点

\`\`\`javascript
// 状态时间线
function renderStatusTimeline(timeline) {
  timeline.forEach((step, index) => {
    const node = createNode(step.status, step.time)
    if (index === timeline.length - 1) {
      node.classList.add('active')
    }
    container.appendChild(node)
  })
}
\`\`\`

## 经验总结

1. **API 文档规范**：Swagger 提升协作效率
2. **状态机**：清晰的订单流转
3. **纯前端实现**：GitHub Pages 零成本部署

> 规范的 API 文档是团队协作的基础。`,
            tagSlugs: ['nodejs'],
        },
        {
            title: '旅游攻略网站',
            slug: 'project-travel-guide',
            categorySlug: 'frontend',
            excerpt: '基于 JavaScript + HTML + CSS 构建的旅游攻略平台，提供景点推荐、路线规划、攻略分享等功能。采用响应式设计，纯前端实现并部署于 GitHub Pages，注重移动端体验与视觉表现力，是前端工程与设计审美的综合实践。',
            content: `# 旅游攻略网站

## 项目背景

旅游信息分散，用户需要一站式攻略平台。本项目提供景点推荐与路线规划能力。

## 技术栈

- **前端**：JavaScript、HTML、CSS
- **设计**：响应式设计
- **部署**：GitHub Pages

## 核心功能

### 1. 景点推荐
\`\`\`javascript
const spots = [
  { id: 1, name: '西湖', city: '杭州', rating: 4.8, tags: ['自然', '免费'] },
  { id: 2, name: '故宫', city: '北京', rating: 4.9, tags: ['历史', '文化'] },
]

function renderSpots(list) {
  list.forEach(spot => {
    const card = createSpotCard(spot)
    grid.appendChild(card)
  })
}
\`\`\`

### 2. 路线规划
- 多日行程编排
- 景点距离计算
- 交通方式建议

### 3. 攻略分享
- 用户投稿
- 评分评论
- 收藏功能

## 工程亮点

\`\`\`css
/* 响应式设计 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
\`\`\`

## 经验总结

1. **响应式优先**：移动端体验是基础
2. **视觉表现**：图片与排版提升质感
3. **纯前端实现**：静态部署零成本

> 前端不只是代码，更是体验设计。`,
            tagSlugs: ['nodejs'],
        },
        // ============ Java后端方向 ============
        {
            title: '企业管理系统 EMS（Spring Boot + Vue）',
            slug: 'project-ems-springboot',
            categorySlug: 'java-backend',
            excerpt: '基于 Spring Boot + Vue + MySQL + Element UI 构建的企业管理后台系统，涵盖员工管理、部门管理、权限控制等核心模块。采用前后端分离架构，后端 Spring Boot 提供 RESTful API，前端 Vue + Element UI 实现，部署于 GitHub Pages。是 Java 后端工程化与企业级应用开发的综合实践。',
            content: `# 企业管理系统 EMS（Spring Boot + Vue）

## 项目背景

企业内部管理需要统一的员工、部门、权限管理平台。本项目基于 Spring Boot + Vue 实现企业级管理后台。

## 技术栈

- **后端**：Spring Boot、Java
- **前端**：Vue、Element UI
- **数据库**：MySQL
- **部署**：GitHub Pages（前端）

## 核心模块

### 1. 员工管理
\`\`\`java
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

  @GetMapping
  public Page<Employee> list(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String keyword) {
    return employeeService.query(page, size, keyword);
  }

  @PostMapping
  public Employee create(@RequestBody @Valid EmployeeDTO dto) {
    return employeeService.create(dto);
  }
}
\`\`\`

### 2. 部门管理
- 树形结构
- 部门负责人
- 人员统计

### 3. 权限控制
\`\`\`java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/users")
public List<User> adminList() {
  return userService.listAll();
}
\`\`\`

## 工程亮点

\`\`\`java
// 统一异常处理
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BusinessException.class)
  public ApiResponse handleBusiness(BusinessException e) {
    return ApiResponse.error(e.getCode(), e.getMessage());
  }
}
\`\`\`

\`\`\`java
// JWT 认证过滤器
public class JwtAuthFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest req, ...) {
    String token = extractToken(req);
    if (jwtUtil.validate(token)) {
      UserDetails user = userDetailsService.loadUserByUsername(jwtUtil.getUsername(token));
      SecurityContextHolder.getContext().setAuthentication(...);
    }
    chain.doFilter(req, res);
  }
}
\`\`\`

## 经验总结

1. **分层架构**：Controller/Service/Mapper 清晰职责
2. **权限设计**：基于角色的访问控制
3. **前后端分离**：独立开发与部署

> Java 后端的工程化是企业级应用的基础。`,
            tagSlugs: ['java', 'springboot', 'mysql', 'vue'],
        },
        {
            title: '学生信息管理系统（Java + Maven + Tomcat）',
            slug: 'project-student-enrollment-java',
            categorySlug: 'java-backend',
            excerpt: '基于 Java + Maven + Tomcat + MySQL + JSP 构建的学生学籍信息管理系统，含学生信息管理、课程流程、数据统计等功能模块。采用经典 Java Web 技术栈（Servlet + JSP），通过 Maven 管理依赖，部署于 GitHub Pages。是 Java Web 基础与传统开发流程的实践项目。',
            content: `# 学生信息管理系统（Java + Maven + Tomcat）

## 项目背景

学籍管理是教务系统的核心。本项目采用经典 Java Web 技术栈，理解传统开发流程。

## 技术栈

- **语言**：Java
- **构建**：Maven
- **容器**：Tomcat
- **数据库**：MySQL
- **视图**：JSP

## 核心模块

### 1. 学生信息管理
\`\`\`java
@WebServlet("/student/*")
public class StudentServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    String action = req.getPathInfo();
    if ("/list".equals(action)) {
      List<Student> list = studentDao.queryAll();
      req.setAttribute("list", list);
      req.getRequestDispatcher("/WEB-INF/jsp/list.jsp").forward(req, resp);
    } else if ("/add".equals(action)) {
      Student student = bindForm(req);
      studentDao.save(student);
      resp.sendRedirect("/student/list");
    }
  }
}
\`\`\`

### 2. 课程流程
- 选课管理
- 成绩录入
- 学分统计

### 3. 数据统计
\`\`\`java
public class StatsService {
  public Map<String, Object> classStats(String classId) {
    Map<String, Object> stats = new HashMap<>();
    stats.put("total", studentDao.countByClass(classId));
    stats.put("avgScore", scoreDao.avgByClass(classId));
    stats.put("passRate", scoreDao.passRateByClass(classId));
    return stats;
  }
}
\`\`\`

## 工程亮点

\`\`\`xml
<!-- Maven 依赖管理 -->
<dependencies>
  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
  </dependency>
  <dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
  </dependency>
</dependencies>
\`\`\`

\`\`\`java
// DAO 模式
public class StudentDao {
  public List<Student> queryAll() {
    String sql = "SELECT * FROM students";
    return jdbcTemplate.query(sql, new StudentRowMapper());
  }
}
\`\`\`

## 经验总结

1. **经典分层**：MVC + DAO 模式
2. **依赖管理**：Maven 统一版本
3. **传统流程**：理解 Java Web 演进

> 从传统 Java Web 入手，理解框架演进的价值。`,
            tagSlugs: ['java', 'mysql'],
        },
    ];
    let created = 0;
    let updated = 0;
    for (const article of articles) {
        const tagIds = article.tagSlugs
            .map((slug) => tagMap.get(slug))
            .filter(Boolean);
        const categoryId = catMap.get(article.categorySlug);
        const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
        if (existing) {
            // 更新已有文章的 excerpt / content / 分类
            await prisma.article.update({
                where: { id: existing.id },
                data: {
                    excerpt: article.excerpt,
                    content: article.content,
                    categoryId,
                    status: 'PUBLISHED',
                },
            });
            // 重建标签关联
            await prisma.articleTag.deleteMany({ where: { articleId: existing.id } });
            if (tagIds.length > 0) {
                await prisma.articleTag.createMany({
                    data: tagIds.map((tagId) => ({ articleId: existing.id, tagId })),
                });
            }
            console.log(`  更新: ${article.title}`);
            updated++;
        }
        else {
            await prisma.article.create({
                data: {
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.excerpt,
                    content: article.content,
                    status: 'PUBLISHED',
                    authorId: admin.id,
                    categoryId,
                    publishedAt: new Date(),
                    tags: {
                        create: tagIds.map((tagId) => ({ tagId })),
                    },
                },
            });
            console.log(`  创建: ${article.title}`);
            created++;
        }
    }
    console.log(`\n✅ 完成! 创建: ${created}, 更新: ${updated}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
