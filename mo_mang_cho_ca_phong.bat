@echo off
chcp 65001 > nul
title Mo Quyen Mang Cho Ca Phong Truy Cap

:: Kiem tra quyen Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [i] Dang yeu cau quyen Administrator de mo Tuong lua Windows...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==================================================================
echo    ðŸ± MO QUYEN TUONG LUA DE CA PHONG CUNG TRUY CAP
echo ==================================================================
echo.
echo [+] Dang them quyen cho phep tren Tuong lua Windows (Firewall)...
netsh advfirewall firewall delete rule name="He Thong Dat Do An Phong Kinh Doanh" >nul 2>&1
netsh advfirewall firewall add rule name="He Thong Dat Do An Phong Kinh Doanh" dir=in action=allow protocol=TCP localport=8080 profile=any >nul
netsh advfirewall firewall add rule name="He Thong Dat Do An Phong Kinh Doanh (8088)" dir=in action=allow protocol=TCP localport=8088 profile=any >nul

echo.
echo [DA XONG] Tuong lua Windows da duoc mo cho cong 8080 & 8088!
echo Tat ca dien thoai va may tinh cung mang Wi-Fi da co the vao dat mon.
echo.
pause