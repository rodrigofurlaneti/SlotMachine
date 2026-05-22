@echo off
setlocal
echo ============================================
echo   Fortune Spin - Instalar APK via USB
echo ============================================
echo.

REM Verifica se adb esta disponivel
where adb >nul 2>&1
if errorlevel 1 (
    echo ERRO: adb nao encontrado no PATH.
    echo Adicione o Android SDK platform-tools ao PATH:
    echo   C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools
    pause
    exit /b 1
)

REM Verifica dispositivo conectado
echo Dispositivos conectados:
adb devices
echo.

REM Localiza o APK debug mais recente
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk

if not exist "%APK_PATH%" (
    echo APK nao encontrado em: %APK_PATH%
    echo.
    echo Execute primeiro no Android Studio:
    echo   Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
    pause
    exit /b 1
)

echo Instalando %APK_PATH%...
adb install -r "%APK_PATH%"

if errorlevel 1 (
    echo ERRO na instalacao!
    echo Verifique: Depuracao USB ativada no celular?
) else (
    echo.
    echo Instalado com sucesso!
    echo Abrindo o app no celular...
    adb shell am start -n "br.com.fortunespin.app/br.com.fortunespin.app.MainActivity"
)

pause
endlocal
