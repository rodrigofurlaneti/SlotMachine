@echo off
setlocal
echo ============================================
echo   Fortune Spin - Setup Android (1x)
echo ============================================
echo.

echo [1/4] Instalando dependencias do Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android
if errorlevel 1 ( echo ERRO! & pause & exit /b 1 )

echo.
echo [2/4] Build inicial do React...
call npm run build
if errorlevel 1 ( echo ERRO no build! & pause & exit /b 1 )

echo.
echo [3/4] Adicionando plataforma Android...
call npx cap add android
if errorlevel 1 ( echo ERRO ao adicionar Android! & pause & exit /b 1 )

echo.
echo [4/4] Sincronizando assets...
call npx cap sync android
if errorlevel 1 ( echo ERRO no sync! & pause & exit /b 1 )

echo.
echo ============================================
echo   Setup concluido com sucesso!
echo.
echo   Proximos passos:
echo   1. Execute android-build.bat para buildar
echo   2. No Android Studio: Build > Build APK
echo   3. Execute install-apk.bat para instalar
echo ============================================
pause
endlocal
