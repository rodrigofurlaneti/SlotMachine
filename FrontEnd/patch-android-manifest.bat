@echo off
echo Aplicando configuracoes Android...

REM Cria pasta xml se nao existir
if not exist "android\app\src\main\res\xml" (
    mkdir "android\app\src\main\res\xml"
)

REM Copia network security config
copy /Y "android-config\network_security_config.xml" "android\app\src\main\res\xml\"
echo   network_security_config.xml copiado

echo.
echo ATENCAO: Verifique se o AndroidManifest.xml tem:
echo   android:networkSecurityConfig="@xml/network_security_config"
echo   no elemento ^<application^>
echo.
echo Abra: android\app\src\main\AndroidManifest.xml
pause
