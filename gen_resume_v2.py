# -*- coding: utf-8 -*-
"""
基于 OCR 提取的简历原内容生成新 PDF。
仅将每份简历中的一个项目替换为「个人博客作品集」，其余内容保留原样。
"""
import os
from fpdf import FPDF

# ---------- 字体 ----------
FONT_REG = "C:/Windows/Fonts/msyh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"

# ---------- 颜色 ----------
C_NAME = (17, 17, 17)
C_TITLE = (26, 58, 92)        # 深蓝
C_TEXT = (34, 34, 34)
C_SUB = (90, 90, 90)
C_LINK = (21, 101, 192)
C_TAG_BG = (232, 240, 247)
C_TAG_FG = (26, 58, 92)
C_LINE = (200, 210, 220)

PAGE_W, PAGE_H = 210, 297
M_L, M_R, M_T, M_B = 15, 15, 12, 12
CW = PAGE_W - M_L - M_R  # 内容宽 180


class ResumePDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=True, margin=M_B)
        self.set_margins(M_L, M_T, M_R)
        self.add_font('msyh', '', FONT_REG, uni=True)
        self.add_font('msyh', 'B', FONT_BOLD, uni=True)

    # ---- 基础 ----
    def _text(self, txt, size=9.5, style='', color=C_TEXT):
        self.set_font('msyh', style, size)
        self.set_text_color(*color)
        self.cell(0, 5, txt, ln=True)

    def header(self):
        pass

    def footer(self):
        pass

    # ---- 区块标题 ----
    def section_title(self, title):
        y = self.get_y()
        if y > PAGE_H - M_B - 60:
            self.add_page()
            y = self.get_y()
        self.set_font('msyh', 'B', 11.5)
        self.set_text_color(*C_TITLE)
        self.set_y(y + 3)
        self.cell(0, 7, title, ln=True)
        yy = self.get_y()
        self.set_draw_color(*C_LINE)
        self.set_line_width(0.3)
        self.line(M_L, yy, PAGE_W - M_R, yy)
        self.ln(2)

    # ---- 技能标签横排 ----
    def tag_row(self, tags):
        x = M_L
        self.set_font('msyh', '', 8.5)
        for t in tags:
            w = self.get_string_width(t) + 4
            if x + w > PAGE_W - M_R:
                x = M_L
                self.ln(5.5)
            self.set_xy(x, self.get_y())
            self.set_fill_color(*C_TAG_BG)
            self.set_text_color(*C_TAG_FG)
            self.cell(w, 4.8, t, fill=True, align='C')
            x += w + 2
        self.ln(6)

    # ---- 要点列表 ----
    def bullets(self, items, size=9.3, lh=4.6):
        self.set_font('msyh', '', size)
        self.set_text_color(*C_TEXT)
        for it in items:
            self._bullet_line(it, size, lh)

    def _bullet_line(self, text, size, lh):
        x0 = M_L
        y0 = self.get_y()
        self.set_xy(x0, y0)
        self.set_font('msyh', '', size)
        self.set_text_color(*C_TITLE)
        self.cell(4, lh, '·')
        self.set_text_color(*C_TEXT)
        w = CW - 4
        self.multi_cell(w, lh, text)
        self.ln(1)

    # ---- 项目块 ----
    def project(self, title, subtitle, tags, points, link):
        y = self.get_y()
        if y > PAGE_H - M_B - 45:
            self.add_page()
        self.set_font('msyh', 'B', 10.5)
        self.set_text_color(*C_NAME)
        self.cell(0, 5.5, title, ln=True)
        if subtitle:
            self.set_font('msyh', '', 9)
            self.set_text_color(*C_SUB)
            self.cell(0, 4.5, subtitle, ln=True)
        # 技术标签
        self.tag_row(tags)
        # 要点
        self.bullets(points, size=9.0, lh=4.4)
        # 链接
        self.set_font('msyh', '', 8.8)
        self.set_text_color(*C_LINK)
        self.cell(0, 4.5, link, ln=True)
        self.ln(3)

    # ---- 头部 ----
    def head(self, name, contact, title_line, city, tags):
        # 姓名
        self.set_font('msyh', 'B', 19)
        self.set_text_color(*C_NAME)
        self.cell(0, 9, name, ln=True)
        # 联系方式
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.cell(0, 5, contact, ln=True)
        self.ln(1.5)
        # 标题行
        self.set_font('msyh', 'B', 11.5)
        self.set_text_color(*C_TITLE)
        self.cell(0, 6, title_line, ln=True)
        # 城市
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.cell(0, 5, city, ln=True)
        self.ln(1.5)
        # 技能标签
        self.tag_row(tags)

    # ---- 教育/实习行 ----
    def edu(self, school, degree, dates, detail):
        self.set_font('msyh', 'B', 10)
        self.set_text_color(*C_NAME)
        self.cell(90, 5.5, school)
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.cell(0, 5.5, dates, ln=True, align='R')
        self.set_font('msyh', '', 9.3)
        self.set_text_color(*C_TEXT)
        self.cell(0, 5, degree, ln=True)
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.multi_cell(0, 4.6, detail)
        self.ln(2)

    def intern(self, company, role, dates, points):
        self.set_font('msyh', 'B', 10)
        self.set_text_color(*C_NAME)
        self.cell(110, 5.5, company)
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.cell(0, 5.5, dates, ln=True, align='R')
        self.set_font('msyh', '', 9.3)
        self.set_text_color(*C_TEXT)
        self.cell(0, 5, role, ln=True)
        self.ln(0.5)
        self.bullets(points, size=9.0, lh=4.4)
        self.ln(1.5)

    # ---- 专业技能（两列）----
    def skill_grid(self, cats):
        """cats: [(category, desc), ...] 两列排布"""
        half = CW / 2 - 3
        rows = [(i, i + len(cats) // 2 + len(cats) % 2) for i in range(len(cats) // 2 + len(cats) % 2)]
        for i, j in rows:
            y_left = self.get_y()
            # 左列
            self.set_xy(M_L, y_left)
            self.set_font('msyh', 'B', 9.3)
            self.set_text_color(*C_TITLE)
            self.cell(0, 5, cats[i][0], ln=True)
            self.set_x(M_L)
            self.set_font('msyh', '', 8.8)
            self.set_text_color(*C_TEXT)
            self.multi_cell(half, 4.3, cats[i][1])
            y_after_left = self.get_y()
            # 右列
            if j < len(cats):
                self.set_xy(M_L + half + 6, y_left)
                self.set_font('msyh', 'B', 9.3)
                self.set_text_color(*C_TITLE)
                self.cell(0, 5, cats[j][0], ln=True)
                self.set_xy(M_L + half + 6, y_left + 5)
                self.set_font('msyh', '', 8.8)
                self.set_text_color(*C_TEXT)
                self.multi_cell(half, 4.3, cats[j][1])
            self.set_y(max(y_after_left, self.get_y()) + 2.5)

    # ---- 社团 ----
    def club(self, org, role, dates, desc):
        self.set_font('msyh', 'B', 10)
        self.set_text_color(*C_NAME)
        self.cell(110, 5.5, org)
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.cell(0, 5.5, dates, ln=True, align='R')
        self.set_font('msyh', '', 9.3)
        self.set_text_color(*C_TEXT)
        self.cell(0, 5, role, ln=True)
        self.set_font('msyh', '', 9)
        self.set_text_color(*C_SUB)
        self.multi_cell(0, 4.6, desc)
        self.ln(1)


# ============================ 数据 ============================

# 个人博客项目（后端版侧重后端工程化）
BLOG_BE = {
    "title": "个人博客作品集  |  Personal Blog",
    "subtitle": "全栈个人博客与作品集平台",
    "tags": ["Next.js 16", "React 19", "TypeScript", "Prisma", "PostgreSQL", "NextAuth.js", "Docker", "Fly.io"],
    "points": [
        "基于 Next.js 16 App Router + React 19 RSC 构建的全栈个人博客与作品集平台，采用 Prisma ORM 设计 11 张数据表（用户/文章/分类/标签/评论/项目/能力卡片/联系消息/站点配置等），覆盖内容管理、项目展示、访客互动 3 大业务模块。",
        "实现 NextAuth.js JWT 双 Token 认证体系（access/refresh），管理员权限守卫关键 API；文章支持草稿/发布状态机、Markdown 渲染（rehype-highlight 代码高亮）、分类标签多对多关联、嵌套评论树与点赞浏览统计。",
        "使用 PostgreSQL(Neon) 持久化，Prisma Client 类型安全查询；GitHub Actions CI/CD 自动构建 Docker 镜像并滚动部署至 Fly.io 香港节点，线上地址 fantastic-adventure.fly.dev。",
        "数据库连接池 SIGTERM/SIGINT 优雅关闭，登录限速与评论频控缓存自动清理；zod schema 统一表单校验，sitemap/robots SEO 配置完备。",
    ],
    "link": "github.com/w020316/fantastic-adventure",
}

# 个人博客项目（前端版侧重视觉交互）
BLOG_FE = {
    "title": "个人博客作品集  |  Personal Blog",
    "subtitle": "全栈个人博客与作品集平台",
    "tags": ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Framer Motion", "Prisma", "GitHub"],
    "points": [
        "基于 Next.js 16 App Router + React 19 服务端组件构建的全栈个人博客与作品集，采用 Streaming SSR 流式渲染首屏；Tailwind CSS v4 实现赛博朋克设计系统（霓虹荧光绿 #ccff00 + 深黑底 + Orbitron 字体）。",
        "首页集成 GitHub 仓库实时拉取与在线体验入口；文章页支持 Markdown 渲染（rehype-highlight 代码高亮、rehype-slug 锚点）、嵌套评论、点赞交互；Framer Motion 实现页面切换动画与滚动触发动效。",
        "响应式适配移动端与桌面端，使用 (hover: none) 媒体查询区分触屏交互；尊重 prefers-reduced-motion 系统设置自动禁用动画；sonner 提供优雅的 Toast 通知。",
        "通过 GitHub Actions 自动化部署至 Fly.io，线上地址 fantastic-adventure.fly.dev。",
    ],
    "link": "github.com/w020316/fantastic-adventure",
}


# ============================ 后端简历 ============================
def gen_backend(out_path):
    pdf = ResumePDF()
    pdf.add_page()

    pdf.head(
        name="吴宇威",
        contact="18124902920  |  1181264839@qq.com  |  github.com/w020316",
        title_line="后端开发工程师  |  2027届应届生",
        city="期望城市：广州",
        tags=["Node.js", "AI应用开发", "RAG架构", "Python", "Java / SpringBoot"],
    )

    # 个人优势
    pdf.section_title("个人优势")
    pdf.bullets([
        "独立完成 3 个后端项目从 0 到 1 开发并部署上线，覆盖 Python / Node.js / Java 多语言技术栈。",
        "熟悉 AI 应用后端架构，掌握 RAG 检索增强生成、多智能体协作编排、LLM API 集成与 SSE 流式响应。",
        "注重系统设计：独立完成数据库建模（17 张表）、API 设计（11 个接口）、向量检索引擎搭建。",
        "具备工程化交付能力：Docker 容器化部署、GitHub Actions CI/CD、单元测试与集成测试。",
    ])

    # 教育经历
    pdf.section_title("教育经历")
    pdf.edu(
        "广州工商学院",
        "本科 · 软件工程",
        "2023 - 2027",
        "专业排名：前 5%  |  主修：JavaWeb 开发、SpringBoot 企业级开发、Python 应用开发、数据库原理与应用、计算机网络、Linux 操作系统",
    )

    # 实习经历
    pdf.section_title("实习经历")
    pdf.intern(
        "广州简正信息科技有限公司",
        "开发实习生",
        "2024.01 - 2024.03",
        [
            "参与公司 Web 应用开发，对接 10+ 个后端 API 接口，完成前后端联调与数据交互。",
            "参与制定开发规范（代码风格、Git 提交规范），团队 3 人采纳执行。",
            "修复跨浏览器兼容性问题 6 项，定位并解决接口数据格式不一致导致的联调异常。",
            "编写接口文档与联调测试用例，提升前后端协作效率。",
        ],
    )

    # 项目经历
    pdf.section_title("项目经历")

    # 项目1: MyLibrary RAG（保留）
    pdf.project(
        "智能文档问答系统  MyLibrary RAG",
        "基于 RAG 的本地知识库问答系统",
        ["Python", "Langchain", "ChromaDB", "DeepSeek", "Streamlit", "GitHub"],
        [
            "基于 RAG 检索增强生成技术的本地知识库问答系统，支持 PDF/TXT/MD 多格式文档向量化入库。",
            "设计智能对话路由：启发式规则 + 相似度阈值双重判断，自动切换 RAG/自由对话模式，准确率 92%+；自进化反馈引擎：Wilson 区间统计评分，基于历史反馈自动推荐最优检索参数。",
            "实现 MMR 多样性检索、多轮对话记忆（问题压缩 + 记忆窗口管理）、4 种提示词模板、相似度拒答机制；编写 6 个模块单元测试 + 集成测试。",
        ],
        "github.com/w020316/demo-mx",
    )

    # 项目2: 心语日记（保留）
    pdf.project(
        "心语日记  |  多智能体 AI 助手",
        "基于多智能体协作的 AI 日记应用",
        ["Python", "FastAPI", "ChromaDB", "SSE", "Docker", "GitHub"],
        [
            "基于多智能体协作的 AI 日记应用，设计 4 个智能体（情绪感知器、记忆管家、日记生成器、对话精灵）协同工作。编排顺序：情绪分析 > 记忆检索 > 日记生成 > 回复整合。",
            "使用 ChromaDB 向量数据库 + BGE 中文嵌入模型实现长期记忆（语义检索相关记忆），短期记忆保留最近 10 轮对话上下文；SSE 流式响应实时推送各智能体处理进度。",
            "提供 FastAPI 后端（11 个 REST API 接口：对话/日记 CRUD/记忆管理/情绪统计），支持 Docker 一键部署，日记自动保存与 Markdown 导出。",
        ],
        "github.com/w020316/geren-riji",
    )

    # 项目3: 个人博客（替换恋爱日常）
    pdf.project(BLOG_BE["title"], BLOG_BE["subtitle"], BLOG_BE["tags"], BLOG_BE["points"], BLOG_BE["link"])

    # 专业技能
    pdf.section_title("专业技能")
    pdf.skill_grid([
        ("Python 后端", "熟练掌握 Python 3.12，熟悉 FastAPI 框架开发 RESTful API，掌握 Langchain 框架进行 AI 应用开发；具备爬虫与数据处理实践经验。"),
        ("Java 后端", "掌握 Java 基础与面向对象设计，熟悉 SpringBoot + MyBatis 主流框架，熟悉 MVC 开发模式，有 JavaWeb 项目开发经验。"),
        ("Node.js 后端", "掌握 Node.js + Express 后端开发，熟悉 Next.js API Routes 接口开发，掌握 Prisma ORM 数据库操作。"),
        ("数据库", "熟悉 MySQL 关系型数据库，掌握 SQL 编写与优化；掌握 Prisma ORM 操作；掌握 ChromaDB 向量数据库，有向量检索与嵌入模型实践经验。"),
        ("AI 应用开发", "熟悉 LLM API 集成（DeepSeek/OpenAI），掌握 RAG 检索增强生成架构、多智能体协作系统设计、SSE 流式响应、提示词工程。"),
        ("工程化与部署", "熟悉 Git 版本管理，掌握 GitHub Actions CI/CD 自动化部署，熟悉 Docker 容器化部署，熟悉 Linux 常用命令与服务器配置。"),
    ])

    # 社团经历
    pdf.section_title("社团经历")
    pdf.club(
        "学院宣传部",
        "干事",
        "2024.01 - 至今",
        "负责学院各类活动（迎新晚会、毕业晚会等）的线上线下宣传策划；统筹团队协作确保活动顺利推进；管理社团线上宣传渠道运营。",
    )

    pdf.output(out_path)
    print(f"已生成: {out_path}")


# ============================ 前端简历 ============================
def gen_frontend(out_path):
    pdf = ResumePDF()
    pdf.add_page()

    pdf.head(
        name="吴宇威",
        contact="18124902920  |  1181264839@qq.com  |  github.com/w020316",
        title_line="前端开发工程师  |  2027届应届生",
        city="期望城市：广州",
        tags=["uni-app", "AI应用开发", "Next.js", "TypeScript", "React", "Vue"],
    )

    # 个人优势
    pdf.section_title("个人优势")
    pdf.bullets([
        "独立完成 3 个完整项目从 0 到 1 开发并上线部署，具备需求分析 → 技术选型 → 开发 → 部署的全流程能力。",
        "前端技术栈覆盖 Vue 2/3 + React + Next.js + uni-app，均有可演示的线上项目。",
        "有 AI + 前端结合的实战经验，掌握 LLM API 集成、SSE 流式渲染、RAG 架构等前沿技术。",
        "注重工程化：GitHub Actions CI/CD、Docker 部署、PWA 离线应用均有生产级实践。",
    ])

    # 教育经历
    pdf.section_title("教育经历")
    pdf.edu(
        "广州工商学院",
        "本科 · 软件工程",
        "2023 - 2027",
        "专业排名：前 5%  |  主修：Web 前端框架技术、HTML5 前端框架、响应式开发技术、小程序开发、数据库原理与应用、计算机网络",
    )

    # 实习经历
    pdf.section_title("实习经历")
    pdf.intern(
        "广州简正信息科技有限公司",
        "前端实习生",
        "2024.01 - 2024.03",
        [
            "独立完成 5+ 个 Web 页面的前端开发，涉及表单、数据看板、文件上传等复杂交互组件。",
            "对接 10+ 个后端 API 接口，完成前后端联调与异常处理，保障数据交互稳定性。",
            "参与制定前端开发规范（代码风格、组件命名、Git 提交规范），团队 3 人采纳执行。",
            "修复 IE/Chrome/Firefox 跨浏览器兼容性问题 6 项，将页面异常率降低至 0。",
        ],
    )

    # 项目经历
    pdf.section_title("项目经历")

    # 项目1: 恋爱日常（保留）
    pdf.project(
        "恋爱日常  Love Daily AI",
        "面向情侣的 AI 日常管理应用",
        ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Prisma", "GitHub"],
        [
            "一款面向情侣的 AI 日常管理应用，涵盖待办系统、AI 日记、相册管理、情侣绑定、健康管理等 6 大核心模块，已部署上线。",
            "前端采用 Next.js 16 + React 19 + TypeScript + Tailwind CSS 4，实现磨砂玻璃拟物 UI + 4 套主题切换（库洛米/美乐蒂/玉桂狗/暗黑），响应式适配移动端与桌面端。",
            "集成 DeepSeek API 实现 AI 聊天/日记扩写/任务生成，使用 SSE 流式渲染逐字输出；Prisma ORM 设计 17 张数据表管理业务数据。",
            "通过 GitHub Actions 自动化部署至 Vercel，支持 PWA 离线访问。",
        ],
        "github.com/w020316/xiaoling-rij",
    )

    # 项目2: 个人博客（替换医疗健康管理小程序）
    pdf.project(BLOG_FE["title"], BLOG_FE["subtitle"], BLOG_FE["tags"], BLOG_FE["points"], BLOG_FE["link"])

    # 项目3: 心语日记（保留）
    pdf.project(
        "心语日记  |  多智能体 AI 助手",
        "基于多智能体协作的 AI 日记应用",
        ["ChromaDB", "FastAPI", "SSE", "DeepSeek", "Docker", "GitHub"],
        [
            "基于多智能体协作的 AI 日记应用，设计 4 个智能体（情绪感知器、记忆管家、日记生成器、对话精灵）协同工作。",
            "前端实现暗色主题响应式界面，使用 SSE EventSource 实现流式逐字输出，实时展示各智能体处理进度；日记列表支持浏览、搜索与 Markdown 导出。",
            "后端使用 FastAPI + ChromaDB 向量数据库，提供 11 个 REST API；支持 Docker 一键部署。",
        ],
        "github.com/w020316/geren-riji",
    )

    # 专业技能
    pdf.section_title("专业技能")
    pdf.skill_grid([
        ("前端开发", "熟练掌握 HTML5/CSS3/JavaScript，熟练使用 Vue 2/3 + Vuex/Pinia + Vue Router 开发单页应用；掌握 React 19 + Next.js 16 全栈开发；熟悉 TypeScript、Tailwind CSS 4、响应式布局与移动端适配。"),
        ("跨端开发", "熟练使用 uni-app 进行微信小程序/H5/App 多端开发；有医疗、兼职等多款小程序项目实战经验；熟悉小程序开发流程与发布规范。"),
        ("AI 应用集成", "熟悉 LLM API 集成（DeepSeek/OpenAI），掌握 SSE 流式渲染、RAG 检索增强生成、多智能体协作；熟悉 Langchain 框架。"),
        ("后端与数据库", "掌握 Node.js/Express 后端开发，熟悉 Prisma ORM、MySQL/SQLite；熟悉 Next.js API Routes 接口开发；熟悉 ChromaDB 向量数据库；Python + FastAPI。"),
        ("工程化与部署", "熟悉 Git 版本管理与协作流程，掌握 GitHub Actions CI/CD 自动化部署；熟悉 Vercel/Docker 部署方案；了解 PWA 离线应用开发。"),
        ("其他", "熟悉 Linux 常用命令，了解网络安全基础知识；具备 Python 爬虫与数据处理实践经验。"),
    ])

    # 社团经历
    pdf.section_title("社团经历")
    pdf.club(
        "学院宣传部",
        "干事",
        "2024.01 - 至今",
        "负责学院各类活动（迎新晚会、毕业晚会等）的线上线下宣传策划；统筹团队协作确保活动顺利推进；管理社团线上宣传渠道运营。",
    )

    pdf.output(out_path)
    print(f"已生成: {out_path}")


# ============================ 主流程 ============================
if __name__ == "__main__":
    # 先输出到 D 盘临时目录（sandbox 限制 C 盘写入）
    tmp_dir = r"d:\xm\wz\grbk\resume_output"
    os.makedirs(tmp_dir, exist_ok=True)
    be_path = os.path.join(tmp_dir, "吴宇威-后端开发-27届应届生.pdf")
    fe_path = os.path.join(tmp_dir, "吴宇威-前端开发-27届应届生.pdf")
    gen_backend(be_path)
    gen_frontend(fe_path)
    print(f"\nPDF 已生成至: {tmp_dir}")
    print("请用 Copy-Item 复制到桌面实习文件夹")
