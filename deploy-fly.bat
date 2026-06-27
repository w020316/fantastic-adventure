@echo off
chcp 65001 >nul
echo ==========================================
echo  XIAO/WU Portfolio - Fly.io 部署脚本
echo ==========================================
echo.

REM 检查 flyctl 是否安装
flyctl version >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/5] 正在安装 flyctl...
    powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
    echo.
    echo 安装完成。请关闭此窗口，重新打开 PowerShell 后再次运行本脚本。
    pause
    exit /b
)

echo [1/5] flyctl 已安装
flyctl version

echo.
echo [2/5] 检查登录状态...
flyctl auth whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 未登录，正在打开浏览器登录...
    flyctl auth login
) else (
    echo 已登录
)

echo.
echo [3/5] 创建/更新 Fly.io 应用...
cd /d "%~dp0"
flyctl launch --no-deploy --name fantastic-adventure --region hkg --org personal
if %errorlevel% neq 0 (
    echo.
    echo 应用创建失败，可能是名字已被占用。
    echo 请修改 fly.toml 中的 app 名称后重试，或按提示输入新名字。
    pause
    exit /b
)

echo.
echo [4/5] 应用创建成功！
echo.
echo 现在需要设置环境变量。请按顺序执行以下命令：
echo.
echo   flyctl secrets set DATABASE_URL="你的数据库连接串"
echo   flyctl secrets set NEXTAUTH_SECRET="随机密钥"
echo   flyctl secrets set NEXTAUTH_URL="https://fantastic-adventure.fly.dev"
echo   flyctl secrets set CONTACT_EMAIL="1181264839@qq.com"
echo.
echo 如果你还没有数据库连接串，可以继续使用 Neon 的 DATABASE_URL。
echo 设置完成后，按任意键继续部署。
pause

echo.
echo [5/5] 部署应用到 Fly.io...
flyctl deploy

echo.
echo ==========================================
echo 部署完成！请访问上方显示的 URL
echo ==========================================
pause
