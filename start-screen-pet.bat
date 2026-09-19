@echo off
title BotPet Screen Companion
cd /d "%~dp0desktop"
taskkill /F /IM electron.exe >nul 2>&1
ping 127.0.0.1 -n 2 >nul
start "" "node_modules\electron\dist\electron.exe" "main.js"
echo BotPet Screen Companion launched with CLI control server enabled!
exit
