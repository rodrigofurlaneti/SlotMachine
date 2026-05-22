@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Fortune Spin - Build Android
echo ============================================
echo.

REM Detecta o IP da maquina na rede local (primeira entrada IPv4 nao-loopback)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    if not "!IP!"=="127.0.0.1" (
        set LOCAL_IP=!IP!
        goto :found_ip
    )
)
:found_ip

echo IP detectado: %LOCAL_IP%
echo API URL:      http://%LOCAL_IP%:5232/api
echo.

REM Garante que a API do .NET aceita conexoes externas (nao so localhost)
echo IMPORTANTE: O backend precisa estar rodando com:
echo   dotnet run --urls "http://0.0.0.0:5232"
echo.
pause

REM Build do React com a URL da API apontando para este PC
set VITE_API_BASE_URL=http://%LOCAL_IP%:5232/api
echo Buildando React...
call npm run build
if errorlevel 1 (
    echo ERRO no build do React!
    pause
    exit /b 1
)

REM Sincroniza os assets com a plataforma Android
echo Sincronizando com Android...
call npx cap sync android
if errorlevel 1 (
    echo ERRO no cap sync!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Build concluido!
echo   Abrindo Android Studio...
echo ============================================
call npx cap open android
endlocal
