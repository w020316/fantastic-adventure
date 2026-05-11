# 个人博客网站 — 实施计划

> 日期：2026-05-11
> 关联设计文档：2026-05-11-personal-blog-design.md
> 仓库：https://github.com/w020316/fantastic-adventure
> 项目路径：d:\xm\wz\grbk

---

## 实施阶段总览

| 阶段 | 内容 | 依赖 |
|------|------|------|
| P1 | 项目初始化 & 基础架构搭建 | 无 |
| P2 | 后端核心 API 开发 | P1 |
| P3 | 管理后台开发 | P2 |
| P4 | 博客前台开发 | P2 |
| P5 | 联调 & 优化 & 部署 | P3 + P4 |

---

## P1：项目初始化 & 基础架构搭建

### 任务 1.1：初始化 Monorepo 项目结构

**目标**：创建项目根目录和 npm workspace 配置

**步骤**：
1. 在 `d:\xm\wz\grbk` 初始化根 `package.json`，配置 npm workspaces
2. 创建 `client/`、`admin/`、`server/`、`shared/` 四个子目录
3. 初始化 Git 仓库，关联远程 `https://github.com/w020316/fantastic-adventure`
4. 创建 `.gitignore`（node_modules、dist、.env 等）
5. 创建根级 `.editorconfig` 和 `.prettierrc`

**产出**：
```
grbk/
├── client/          # (空，待 P4 填充)
├── admin/           # (空，待 P3 填充)
├── server/          # (空，待 P2 填充)
├── shared/          # (空，待 P1.2 填充)
├── .gitignore
├── .editorconfig
├── .prettierrc
└── package.json     # workspaces: ["client", "admin", "server", "shared"]
```

**验证**：`npm install` 无报错，`git remote -v` 显示正确仓库

---

### 任务 1.2：共享类型定义

**目标**：建立前后端共享的 TypeScript 类型

**步骤**：
1. 初始化 `shared/` 为 TypeScript 包（`package.json` + `tsconfig.json`）
2. 定义核心类型：
   - `types/article.ts`：Article、ArticleListQuery、ArticleListResponse
   - `types/comment.ts`：Comment、CommentTree
   - `types/category.ts`：Category
   - `types/tag.ts`：Tag
   - `types/project.ts`：Project
   - `types/user.ts`：User、LoginRequest、LoginResponse
   - `types/stats.ts`：StatsOverview、StatsTrend
   - `types/api.ts`：ApiResponse、PaginatedResponse、ApiError
3. 导出统一入口 `index.ts`

**验证**：`shared/` 可被 server 和 client 正确 import

---

### 任务 1.3：初始化后端项目

**目标**：搭建 Express + TypeScript 后端骨架

**步骤**：
1. 在 `server/` 初始化 `package.json`，安装核心依赖：
   - express、typescript、ts-node-dev（开发）
   - mysql2、jsonwebtoken、bcryptjs、multer、cors、helmet、express-validator
   - @types/express、@types/jsonwebtoken、@types/bcryptjs、@types/multer、@types/cors
2. 创建 `tsconfig.json`
3. 创建目录结构：
   ```
   server/
   ├── src/
   │   ├── config/        # 配置（数据库、JWT密钥等）
   │   ├── middleware/     # 中间件（auth、errorHandler）
   │   ├── modules/       # 业务模块
   │   │   ├── auth/
   │   │   ├── article/
   │   │   ├── category/
   │   │   ├── tag/
   │   │   ├── comment/
   │   │   ├── project/
   │   │   ├── stats/
   │   │   └── upload/
   │   ├── utils/         # 工具函数
   │   ├── types/         # 补充类型
   │   └── app.ts         # 入口
   ├── .env.example
   ├── .env.development
   └── tsconfig.json
   ```
4. 编写 `app.ts`：创建 Express 实例，注册全局中间件（cors、helmet、express.json、路由挂载、错误处理）
5. 编写 `config/index.ts`：读取环境变量（PORT、DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD、JWT_SECRET）
6. 编写 `middleware/errorHandler.ts`：统一错误响应格式
7. 配置 `npm scripts`：`dev`（ts-node-dev）、`build`（tsc）、`start`（node dist/app.js）

**验证**：`npm run dev` 启动后，`GET /api/health` 返回 200

---

### 任务 1.4：数据库初始化

**目标**：创建 MySQL 数据库和表结构

**步骤**：
1. 编写 SQL 初始化脚本 `server/sql/init.sql`：
   - 创建数据库 `blog_db`
   - 创建 8 张表（users、articles、categories、tags、article_tags、comments、projects、stats）
   - 添加外键约束和索引
   - 插入默认管理员账户（username: admin, password: bcrypt hash）
2. 编写数据库连接模块 `server/src/config/database.ts`（mysql2 连接池）
3. 创建 `.env.development` 配置本地数据库连接

**验证**：运行 SQL 脚本后，`SHOW TABLES` 显示 8 张表，默认管理员可查询到

---

## P2：后端核心 API 开发

### 任务 2.1：认证模块

**目标**：实现 JWT 登录/登出/刷新/获取信息

**步骤**：
1. `modules/auth/auth.controller.ts`：实现 4 个路由处理函数
2. `modules/auth/auth.service.ts`：
   - login：查询用户 → bcrypt.compare → 生成 access_token(2h) + refresh_token(7d)
   - logout：将 refresh_token 加入黑名单（可选，简单实现可前端清除）
   - profile：从 JWT 解析用户信息
   - refresh：验证 refresh_token → 生成新 access_token
3. `modules/auth/auth.validator.ts`：express-validator 校验登录参数
4. `middleware/auth.ts`：JWT 验证中间件，从 Authorization 头解析 token
5. 注册路由 `POST /api/auth/login|logout|refresh`、`GET /api/auth/profile`

**验证**：
- 登录返回 access_token 和 refresh_token
- 携带 token 访问 /api/auth/profile 返回用户信息
- 无 token 访问受保护接口返回 401

---

### 任务 2.2：文章模块

**目标**：实现文章 CRUD + 列表筛选 + 点赞

**步骤**：
1. `modules/article/article.controller.ts`：6 个路由处理函数
2. `modules/article/article.service.ts`：
   - list：分页 + 分类/标签/关键词筛选 + 关联查询分类名和标签
   - detail：单篇文章 + 分类 + 标签 + 浏览数 +1
   - create：创建文章 + 处理标签关联
   - update：更新文章 + 同步标签关联
   - remove：删除文章 + 清理标签关联
   - like：点赞 +1（同一 IP 限制）
3. `modules/article/article.validator.ts`：校验 title、content、category_id 等
4. 注册路由

**验证**：
- 创建文章 → 获取列表可见 → 获取详情内容正确
- 按分类/标签筛选结果正确
- 点赞数 +1

---

### 任务 2.3：分类模块

**目标**：实现分类 CRUD

**步骤**：
1. `modules/category/category.controller.ts`：4 个路由处理函数
2. `modules/category/category.service.ts`：list、create、update、remove
3. `modules/category/category.validator.ts`
4. 注册路由

**验证**：分类 CRUD 正常，删除有关联文章的分类时返回错误提示

---

### 任务 2.4：标签模块

**目标**：实现标签 CRUD

**步骤**：
1. `modules/tag/tag.controller.ts`：4 个路由处理函数
2. `modules/tag/tag.service.ts`：list、create、update、remove
3. `modules/tag/tag.validator.ts`
4. 注册路由

**验证**：标签 CRUD 正常

---

### 任务 2.5：评论模块

**目标**：实现评论发表、列表、删除、审核

**步骤**：
1. `modules/comment/comment.controller.ts`：4 个路由处理函数
2. `modules/comment/comment.service.ts`：
   - listByArticle：获取文章评论，构建嵌套树结构（parent_id 分组）
   - create：发表评论，默认 pending 状态
   - remove：删除评论（含子评论处理）
   - updateStatus：审核/隐藏评论
3. `modules/comment/comment.validator.ts`
4. 注册路由

**验证**：
- 发表评论 → 获取列表可见
- 嵌套回复正确展示
- 审核状态变更生效

---

### 任务 2.6：作品集模块

**目标**：实现作品 CRUD

**步骤**：
1. `modules/project/project.controller.ts`：4 个路由处理函数
2. `modules/project/project.service.ts`：list、create、update、remove
3. `modules/project/project.validator.ts`
4. 注册路由

**验证**：作品 CRUD 正常，tech_stack JSON 字段正确存取

---

### 任务 2.7：统计模块

**目标**：实现访问记录上报和数据查询

**步骤**：
1. `modules/stats/stats.controller.ts`：3 个路由处理函数
2. `modules/stats/stats.service.ts`：
   - record：写入访问记录
   - overview：聚合查询（总访问量、今日访问、文章总数、评论总数）
   - trend：按天聚合最近 30 天访问趋势
3. 注册路由

**验证**：上报记录后，overview 和 trend 接口返回正确聚合数据

---

### 任务 2.8：文件上传模块

**目标**：实现图片/文件上传

**步骤**：
1. `modules/upload/upload.controller.ts`：上传处理函数
2. 配置 multer：存储路径、文件大小限制（5MB）、文件类型过滤（图片）
3. 返回文件访问 URL
4. 注册路由 + 静态文件服务

**验证**：上传图片成功，返回可访问 URL

---

## P3：管理后台开发

### 任务 3.1：初始化管理后台项目

**目标**：搭建 Vue 3 + Vite + Element Plus 管理后台骨架

**步骤**：
1. 在 `admin/` 用 Vite 创建 Vue 3 + TypeScript 项目
2. 安装依赖：element-plus、vue-router、pinia、axios、md-editor-v3、echarts
3. 配置 Tailwind CSS（可选，Element Plus 为主）
4. 创建目录结构：
   ```
   admin/src/
   ├── api/           # 接口请求模块
   ├── assets/        # 静态资源
   ├── components/    # 公共组件
   ├── composables/   # 组合式函数
   ├── layouts/       # 布局组件
   ├── pages/         # 页面
   ├── router/        # 路由
   ├── stores/        # 状态管理
   ├── styles/        # 全局样式
   ├── types/         # 类型定义
   └── utils/         # 工具函数
   ```
5. 配置 Axios 实例：baseURL、请求/响应拦截器（token 注入、401 跳转、错误提示）
6. 配置 Vue Router：路由守卫（未登录跳转）
7. 配置 Pinia：用户状态 store

**验证**：`npm run dev` 启动后，空白页面无报错

---

### 任务 3.2：登录页

**目标**：管理员登录功能

**步骤**：
1. 创建 `pages/Login.vue`：Element Plus 表单 + 深色主题
2. 调用 `/api/auth/login`，存储 token 到 localStorage
3. 登录成功跳转 Dashboard

**验证**：输入正确账号密码可登录，错误时显示提示

---

### 任务 3.3：后台布局

**目标**：管理后台整体布局

**步骤**：
1. 创建 `layouts/AdminLayout.vue`：侧边栏 + 顶部栏 + 内容区
2. 侧边栏菜单：仪表盘、文章管理、分类管理、标签管理、评论管理、作品管理、个人设置
3. 顶部栏：用户头像 + 退出登录
4. Element Plus Container 布局

**验证**：侧边栏菜单点击可切换页面

---

### 任务 3.4：仪表盘页

**目标**：数据统计总览

**步骤**：
1. 创建 `pages/Dashboard.vue`
2. 调用 `/api/stats/overview` 获取总览数据
3. ECharts 展示：访问趋势折线图、文章分类饼图
4. 统计卡片：总访问量、今日访问、文章总数、评论总数

**验证**：仪表盘正确展示统计数据和图表

---

### 任务 3.5：文章管理页

**目标**：文章列表 + 新增/编辑/删除

**步骤**：
1. 创建 `pages/ArticleList.vue`：Element Plus Table + 分页 + 筛选
2. 创建 `pages/ArticleEdit.vue`：md-editor-v3 Markdown 编辑器 + 分类/标签选择 + 封面上传
3. 调用文章 CRUD API

**验证**：文章增删改查完整可用

---

### 任务 3.6：分类 & 标签管理页

**目标**：分类和标签的 CRUD

**步骤**：
1. 创建 `pages/CategoryList.vue`：表格 + 内联编辑
2. 创建 `pages/TagList.vue`：表格 + 颜色选择器
3. 调用分类/标签 API

**验证**：分类和标签增删改查可用

---

### 任务 3.7：评论管理页

**目标**：评论审核和管理

**步骤**：
1. 创建 `pages/CommentList.vue`：表格 + 状态筛选 + 审核/隐藏操作
2. 调用评论 API

**验证**：评论审核状态变更生效

---

### 任务 3.8：作品管理页

**目标**：作品集 CRUD

**步骤**：
1. 创建 `pages/ProjectList.vue`：表格 + 新增/编辑弹窗
2. 编辑弹窗：项目名、描述、技术栈（动态标签输入）、封面图、链接
3. 调用作品 API

**验证**：作品增删改查可用

---

### 任务 3.9：个人设置页

**目标**：修改密码、头像

**步骤**：
1. 创建 `pages/Settings.vue`：修改密码表单 + 头像上传
2. 调用用户相关 API

**验证**：修改密码后可用新密码登录

---

## P4：博客前台开发

### 任务 4.1：初始化前台项目

**目标**：搭建 Vue 3 + Vite + Tailwind CSS 前台骨架

**步骤**：
1. 在 `client/` 用 Vite 创建 Vue 3 + TypeScript 项目
2. 安装依赖：vue-router、pinia、axios、@vueuse/core、markdown-it、highlight.js、animate.css
3. 配置 Tailwind CSS：深色主题色板、自定义渐变、毛玻璃工具类
4. 创建目录结构：
   ```
   client/src/
   ├── api/           # 接口请求
   ├── assets/        # 静态资源
   ├── components/    # 公共组件
   │   ├── layout/    # 布局组件（Header、Footer、Sidebar）
   │   ├── article/   # 文章相关组件
   │   ├── project/   # 作品相关组件
   │   └── common/    # 通用组件（Loading、Pagination）
   ├── composables/   # 组合式函数
   ├── pages/         # 页面
   ├── router/        # 路由
   ├── stores/        # 状态
   ├── styles/        # 全局样式
   ├── types/         # 类型
   └── utils/         # 工具
   ```
5. 配置 Axios 实例：baseURL、响应拦截器
6. 配置 Vue Router：5 个前台路由 + 过渡动画
7. 配置 Pinia：全局状态

**验证**：`npm run dev` 启动后，空白页面无报错，Tailwind 样式生效

---

### 任务 4.2：全局布局 & 导航

**目标**：前台整体布局和导航栏

**步骤**：
1. 创建 `components/layout/AppHeader.vue`：
   - 深色毛玻璃导航栏
   - Logo + 导航链接（首页、文章、作品集、关于）
   - 响应式汉堡菜单
   - 可选：ReactBits Dock 组件作为导航
2. 创建 `components/layout/AppFooter.vue`：版权信息 + 社交链接
3. 创建 `App.vue` 布局：Header + RouterView（带过渡） + Footer
4. 全局样式：深色背景、渐变强调色、字体

**验证**：导航栏在各页面顶部显示，移动端汉堡菜单可用

---

### 任务 4.3：首页

**目标**：Hero 动画 + 最新文章 + 精选项目

**步骤**：
1. 创建 `pages/Home.vue`
2. Hero 区域：
   - ReactBits Aurora / Line Waves 动态背景
   - ReactBits Shiny Text / Gradient Text 标题动效
   - 打字机效果副标题
   - CTA 按钮（浏览文章 / 查看作品）
3. 最新文章区：3-6 篇文章卡片，ReactBits Tilted Card / Spotlight Card
4. 精选项目区：2-3 个项目卡片
5. 滚动入场动画（Intersection Observer + animate.css）

**验证**：首页展示 Hero 动画、文章卡片、项目卡片，滚动有入场动效

---

### 任务 4.4：文章列表页

**目标**：分页文章列表 + 分类/标签筛选

**步骤**：
1. 创建 `pages/ArticleList.vue`
2. 顶部筛选栏：分类下拉 + 标签选择 + 搜索框
3. 文章卡片网格：封面图 + 标题 + 摘要 + 标签 + 日期
4. 分页组件
5. 空状态和加载状态

**验证**：分页、筛选、搜索功能正常

---

### 任务 4.5：文章详情页

**目标**：Markdown 渲染 + 目录 + 评论

**步骤**：
1. 创建 `pages/ArticleDetail.vue`
2. 文章头部：标题 + 分类 + 标签 + 日期 + 浏览数
3. Markdown 渲染区：markdown-it + highlight.js 代码高亮 + 深色代码块样式
4. 侧边栏目录：自动从 Markdown 标题生成，吸顶
5. 点赞按钮
6. 评论区：
   - 评论列表（嵌套展示）
   - 发表评论表单（昵称 + 邮箱 + 内容）
   - 回复功能

**验证**：文章详情渲染正确，目录跳转正常，评论可发表和展示

---

### 任务 4.6：作品集页

**目标**：项目卡片展示

**步骤**：
1. 创建 `pages/ProjectList.vue`
2. 项目卡片网格：ReactBits Tilted Card / Spotlight Card
3. 卡片内容：封面图 + 项目名 + 描述 + 技术栈标签 + Demo/Repo 链接
4. ReactBits Orbit Images 作为装饰元素

**验证**：作品集卡片展示正常，悬浮动效生效

---

### 任务 4.7：关于我页

**目标**：个人介绍 + 技能 + 联系方式

**步骤**：
1. 创建 `pages/About.vue`
2. 个人介绍区：头像 + 简介
3. 技能展示：技能标签 + ReactBits Count Up 数字动效
4. 时间轴：教育/工作经历
5. 联系方式：社交链接图标

**验证**：关于我页面内容完整，数字动效生效

---

### 任务 4.8：全局动效 & 鼠标交互

**目标**：全局鼠标特效和页面过渡

**步骤**：
1. 集成 ReactBits Blob Cursor / Splash Cursor 全局鼠标特效
2. Vue Router 页面过渡动画（fade + slide）
3. 滚动视差效果（@vueuse/core 的 useParallax）
4. 访问统计上报（路由切换时 POST /api/stats）

**验证**：鼠标跟随特效可见，页面切换有过渡动画

---

## P5：联调 & 优化 & 部署

### 任务 5.1：前后端联调

**目标**：确保所有功能端到端可用

**步骤**：
1. 启动后端服务 + 前台 + 后台
2. 完整走通以下流程：
   - 后台登录 → 发布文章 → 前台查看
   - 前台发表评论 → 后台审核 → 前台显示
   - 后台创建作品 → 前台展示
   - 后台查看统计数据
3. 修复联调发现的问题

**验证**：所有核心流程无阻断性 bug

---

### 任务 5.2：性能优化

**目标**：首屏加载 < 2s

**步骤**：
1. Vite 构建分析（rollup-plugin-visualizer）
2. 路由懒加载（defineAsyncComponent）
3. 图片懒加载 + WebP
4. 代码分割优化
5. Gzip 压缩（服务端）

**验证**：Lighthouse 性能评分 > 80

---

### 任务 5.3：响应式适配

**目标**：移动端体验良好

**步骤**：
1. 逐页检查移动端（< 640px）布局
2. 调整导航栏为汉堡菜单
3. 卡片网格自适应列数
4. 文章详情页移动端目录折叠
5. 触摸友好的交互区域

**验证**：Chrome DevTools 移动端模拟各页面正常

---

### 任务 5.4：部署

**目标**：项目上线可访问

**步骤**：
1. 前端构建：`npm run build`（client + admin）
2. 后端构建：`npm run build`（server）
3. 配置 GitHub Actions CI/CD
4. 前端部署到 Vercel/Netlify
5. 后端部署到云服务器（PM2）
6. 配置数据库连接
7. 配置域名（如有）

**验证**：线上环境可正常访问和使用

---

## 任务依赖关系

```
P1.1 ─→ P1.2 ─→ P1.3 ─→ P1.4
                      │
                      ▼
                    P2.1 ─→ P2.2 ─→ P2.3 ─→ P2.4 ─→ P2.5 ─→ P2.6 ─→ P2.7 ─→ P2.8
                      │                                                    │
                      ▼                                                    │
                    P3.1 ─→ P3.2 ─→ P3.3 ─→ P3.4 ─→ P3.5 ─→ P3.6 ─→ P3.7 ─→ P3.8 ─→ P3.9
                      │                                                    │
                      ▼                                                    │
                    P4.1 ─→ P4.2 ─→ P4.3 ─→ P4.4 ─→ P4.5 ─→ P4.6 ─→ P4.7 ─→ P4.8
                                                                           │
                                                                           ▼
                                                    P5.1 ─→ P5.2 ─→ P5.3 ─→ P5.4
```

**注意**：P2 中的各模块（2.2-2.8）可以并行开发，P3 和 P4 也可以并行开发。

---

## 风险 & 缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| ReactBits 是 React 组件，Vue 项目需适配 | 前台动效实现 | 将 ReactBits 组件通过 Web Component 包装或手动用 Vue 重写核心动效逻辑 |
| MySQL 本地环境配置 | 开发阻塞 | 提供 Docker Compose 一键启动 MySQL |
| JWT 安全性 | Token 被盗用 | 使用 httpOnly cookie 存储 refresh_token，access_token 短有效期 |
| 图片存储 | 服务器磁盘不足 | 初期本地存储 + 定期清理，后期迁移 OSS |

---

## ReactBits 适配方案

由于 ReactBits 是 React 组件库，而本项目前台使用 Vue 3，需要适配策略：

**方案 A（推荐）：手动用 Vue 重写核心动效**
- 参考 ReactBits 源码逻辑，用 Vue 3 Composition API + Canvas/CSS 重写
- 优先重写：Aurora（背景）、Shiny Text（标题）、Tilted Card（卡片）、Blob Cursor（鼠标）
- 优势：纯 Vue 生态，无额外依赖，性能最优

**方案 B：通过 Web Component 桥接**
- 使用 `@r2wc/react-to-web-component` 将 ReactBits 组件转为 Web Component
- 在 Vue 中直接使用自定义标签
- 优势：快速集成，无需重写
- 劣势：包体积增大（需加载 React 运行时），调试复杂

**方案 C：前台改用 React**
- 前台使用 React + Vite，管理后台仍用 Vue + Element Plus
- 可直接使用 ReactBits 全部组件
- 劣势：技术栈不统一，增加学习成本

**推荐方案 A**，在实施 P4 阶段时，参考 ReactBits 源码用 Vue 重写核心动效组件。
