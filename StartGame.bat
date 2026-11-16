@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
    echo 请先安装 Node.js 18 或更新版本，再运行此文件。
    pause
    exit /b 1
)
echo 回煞 3D - 归门
echo 请打开 http://127.0.0.1:8133
echo 关闭此窗口即可停止本地服务。
node tools\serve.mjs
pause
