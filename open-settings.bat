@echo off
title BotPet Settings Panel

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:5178/settings/settings.html" --window-size=860,720
    exit
)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:5178/settings/settings.html" --window-size=860,720
    exit
)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://127.0.0.1:5178/settings/settings.html" --window-size=860,720
    exit
)

start "" "http://127.0.0.1:5178/settings/settings.html"
exit
