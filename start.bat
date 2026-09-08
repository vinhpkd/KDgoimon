@echo off
chcp 65001 > nul
title He Thong Dat Do An Phong Kinh Doanh
echo ==========================================================
echo        🍱 HE THONG DAT DO AN PHONG KINH DOANH
echo    Dong Bo Thuc Don ShopeeFood & Tong Hop Don Real-time
echo ==========================================================
echo.
echo Dang khoi dong Web Server tren cong 8080...
echo.

where pwsh >nul 2>nul
if %errorlevel% equ 0 (
    pwsh -ExecutionPolicy Bypass -File "%~dp0server.ps1"
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
)

pause
