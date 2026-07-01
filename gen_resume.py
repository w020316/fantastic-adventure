# -*- coding: utf-8 -*-
"""生成两份简历 PDF（后端/前端），把个人博客作为主项目"""
import os
import shutil
from fpdf import FPDF

# ===== 字体 =====
MSYH = r"C:\Windows\Fonts\msyh.ttc"
MSYH_B = r"C:\Windows\Fonts\msyhbd.ttc"
SIMHEI = r"C:\Windows\Fonts\simhei.ttf"

BACKUP_DIR = r"d:\xm\wz\grbk\resume_backup"
os.makedirs(BACKUP_DIR, exist_ok=True)

# ===== 简历数据 =====
INFO = {
    "name": "吴宇威",
    "phone": "18124902920",
    "email": "1181264839@qq.com",
    "github": "github.com/w020316",
    "city": "广州",
    "edu": "广州华商职业学院 | 软件工程（专升本） | 2025.09 - 2027.06",
}

BLOG_URL = "https://fantastic-adventure.fly.dev"
BLOG_REPO = "github.com/w020316/fantastic-adventure"

# 后端版
BACKEND = {
    "title": "后端开发工程师 | 2027届应届生",
    "skills": [
        "熟悉 Node.js 后端开发，掌握 Express/Koa 框架与 RESTful API 接口设计规范",
        "熟练使用 PostgreSQL 关系型数据库与 Prisma ORM，能独立完成数据建模、迁移与查询优化",
        "掌握 JWT 身份认证、NextAuth 鉴权、requireAdmin 权限守卫、Zod 请求体校验等安全实践",
        "熟悉 Next.js 16 App Router 服务端组件与 API Route 后端接口开发",
        "掌握 AI 接口集成（DeepSeek 流式对话），实现 IP 限流（5次/分钟+50次/天）防滥用",
        "熟悉 Docker 容器化部署、Fly.io 云平台、GitHub Actions CI/CD 自动化部署流水线",
        "掌握 Git 版本控制与团队协作开发流程，了解 Linux 基本运维",
    ],
    "blog_stack": "Next.js 16 + React 19 + TypeScript + Prisma 6 + PostgreSQL(Neon) + Tailwind v4 + next-auth",
    "blog_points": [
        "独立设计 8 个数据模型（用户/文章/分类/标签/评论/项目/消息/配置），使用 Prisma ORM 管理 PostgreSQL 数据库",
        "实现基于 next-auth 的 JWT 身份认证与 requireAdmin 鉴权守卫，保护后台管理与敏感 API 接口",
        "设计 RESTful API，涵盖文章 CRUD、嵌套评论与回复、点赞、联系表单、AI 对话等业务模块",
        "集成 DeepSeek AI 流式对话接口（SSE），实现 IP 维度限流防滥用与每日调用上限",
        "使用 Zod 进行请求体校验，统一错误处理与 Toast 反馈，修复多处鉴权缺失漏洞",
        "通过 Docker 容器化 + GitHub Actions 实现推送 main 自动部署到 Fly.io 云平台",
    ],
    "fitlog_stack": "React 19 + TypeScript + Vite + Recharts + Google Gemini AI",
    "fitlog_points": [
        "实现用户认证与 localStorage 持久化登录状态管理",
        "设计运动记录与健康数据看板，使用 Recharts 进行数据可视化呈现",
        "集成 Google Gemini AI 接口提供个性化健康与运动建议",
    ],
    "eval": "热爱后端开发，注重接口设计规范与数据安全；具备独立全栈开发与云端部署能力；学习能力强，能快速掌握新技术并落地到实际项目中。",
}

# 前端版
FRONTEND = {
    "title": "前端开发工程师 | 2027届应届生",
    "skills": [
        "熟练掌握 HTML/CSS/JavaScript，精通 React 19 + TypeScript 现代前端开发",
        "熟练使用 Next.js 16 App Router、React Server Components 与流式 SSR 渲染",
        "掌握 Tailwind CSS v4 原子化样式与赛博朋克设计系统搭建",
        "熟悉 Framer Motion 动画、lucide-react 图标库、sonner 通知组件等前端生态",
        "掌握响应式布局与移动端交互（陀螺仪 3D 倾斜、触摸跟随光斑、hover 媒体查询）",
        "熟悉无障碍访问（prefers-reduced-motion、focus-visible、sr-only 语义化）",
        "掌握 Git 版本控制与前端工程化（Vite、ESLint、TypeScript 类型检查）",
    ],
    "blog_stack": "Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion + next/font",
    "blog_points": [
        "设计并实现赛博朋克视觉风格设计系统（荧光绿+深黑底+Orbitron 字体+故障特效）",
        "使用 next/font/google 加载 Inter/Space Grotesk/JetBrains Mono 字体，消除系统字体降级",
        "实现 React Server Components 数据获取与流式 SSR，优化首屏加载性能",
        "开发移动端三大交互：姓名中英文自动循环、陀螺仪驱动 3D 倾斜卡片、触摸跟随光斑",
        "使用 (hover: none) 媒体查询隔离移动端逻辑，尊重 prefers-reduced-motion 系统设置",
        "实现路由级 error.tsx/loading.tsx 错误边界与加载状态，用 next/image 优化图片加载",
    ],
    "fitlog_stack": "React 19 + TypeScript + Vite + Recharts + Tailwind CSS",
    "fitlog_points": [
        "采用组件化架构，实现 Auth/Dashboard/Sports/Health/AIAdvice 多视图切换",
        "使用 Recharts 实现运动与健康数据可视化图表展示",
        "实现响应式布局（md:flex-row 自适应）与 Sidebar 侧边导航交互",
        "集成 Google Gemini AI 智能健康建议视图",
    ],
    "eval": "对前端视觉设计与用户体验有较强把控力；注重性能优化、响应式与无障碍；具备独立从设计到开发到部署的全流程能力；持续关注 React 生态与前端新技术。",
}


class ResumePDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self._load_fonts()

    def _load_fonts(self):
        try:
            self.add_font("MSYH", "", MSYH)
            self.add_font("MSYH", "B", MSYH_B)
            self.font_family = "MSYH"
        except Exception:
            self.add_font("MSYH", "", SIMHEI)
            self.add_font("MSYH", "B", SIMHEI)
            self.font_family = "MSYH"

    def header_line(self):
        # 顶部细线
        self.set_draw_color(204, 255, 0)
        self.set_line_width(0.8)
        y = self.get_y()
        self.line(18, y, 192, y)
        self.ln(2)

    def section_title(self, text):
        self.ln(2)
        self.set_font("MSYH", "B", 12)
        self.set_text_color(20, 20, 20)
        self.cell(0, 7, text, ln=1)
        self.set_draw_color(180, 180, 180)
        self.set_line_width(0.2)
        y = self.get_y()
        self.line(18, y, 192, y)
        self.ln(2)

    def bullet(self, text, indent=4):
        self.set_font("MSYH", "", 9.5)
        self.set_text_color(50, 50, 50)
        x0 = self.get_x()
        self.set_x(x0 + indent)
        self.cell(4, 5.5, "•")
        self.set_x(x0 + indent + 4)
        self.multi_cell(192 - 18 - indent - 4, 5.5, text)
        self.ln(0.5)


def generate(data, out_path, tag):
    pdf = ResumePDF()
    pdf.set_auto_page_break(True, margin=15)
    pdf.add_page()

    # 姓名
    pdf.set_font("MSYH", "B", 22)
    pdf.set_text_color(15, 15, 15)
    pdf.cell(0, 10, INFO["name"], align='C', ln=1)

    # 副标题
    pdf.set_font("MSYH", "", 12)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 6, data["title"], align='C', ln=1)

    # 联系方式
    pdf.set_font("MSYH", "", 9)
    pdf.set_text_color(110, 110, 110)
    contact = f'{INFO["phone"]}  |  {INFO["email"]}  |  {INFO["github"]}  |  期望城市：{INFO["city"]}'
    pdf.cell(0, 5, contact, align='C', ln=1)
    pdf.ln(1)
    pdf.header_line()

    # 教育背景
    pdf.section_title("教育背景")
    pdf.set_font("MSYH", "B", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 6, INFO["edu"], ln=1)
    pdf.ln(1)

    # 专业技能
    pdf.section_title("专业技能")
    for s in data["skills"]:
        pdf.bullet(s)

    # 项目经历
    pdf.section_title("项目经历")

    # 项目一：个人博客
    pdf.set_font("MSYH", "B", 10.5)
    pdf.set_text_color(15, 15, 15)
    pdf.cell(120, 6, "个人博客系统（全栈个人作品集）")
    pdf.set_font("MSYH", "", 9)
    pdf.set_text_color(110, 110, 110)
    pdf.cell(0, 6, "2026.05 - 至今", align='R', ln=1)
    pdf.set_font("MSYH", "", 9)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 5, f"技术栈：{data['blog_stack']}", ln=1)
    pdf.ln(0.5)
    for p in data["blog_points"]:
        pdf.bullet(p)
    pdf.set_font("MSYH", "", 9)
    pdf.set_text_color(70, 70, 70)
    pdf.set_x(22)
    pdf.multi_cell(192 - 22, 5, f"项目地址：{BLOG_URL}    仓库：{BLOG_REPO}")
    pdf.ln(2)

    # 项目二：FitLog
    pdf.set_font("MSYH", "B", 10.5)
    pdf.set_text_color(15, 15, 15)
    pdf.cell(120, 6, "个人健康记录应用（FitLog Pro）")
    pdf.set_font("MSYH", "", 9)
    pdf.set_text_color(110, 110, 110)
    pdf.cell(0, 6, "2025.10 - 2025.12", align='R', ln=1)
    pdf.set_font("MSYH", "", 9)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 5, f"技术栈：{data['fitlog_stack']}", ln=1)
    pdf.ln(0.5)
    for p in data["fitlog_points"]:
        pdf.bullet(p)
    pdf.ln(2)

    # 自我评价
    pdf.section_title("自我评价")
    pdf.set_font("MSYH", "", 9.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 5.5, data["eval"])

    pdf.output(out_path)
    print(f"已生成: {out_path}")


def main():
    files = {
        "backend": (BACKEND, r"C:\Users\86181\Desktop\实习\吴宇威-后端开发-27届应届生.pdf"),
        "frontend": (FRONTEND, r"C:\Users\86181\Desktop\实习\吴宇威-前端开发-27届应届生.pdf"),
    }
    for tag, (data, path) in files.items():
        # 备份原文件
        if os.path.exists(path):
            bak = os.path.join(BACKUP_DIR, os.path.basename(path) + ".bak")
            shutil.copy2(path, bak)
            print(f"已备份原文件: {bak}")
        generate(data, path, tag)
    print("\n全部完成")


if __name__ == "__main__":
    main()
