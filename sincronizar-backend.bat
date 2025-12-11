@echo off
echo ====================================
echo Sincronizando archivos de backend
echo ====================================
echo.

REM Copiar upload.php
echo Copiando upload.php...
copy /Y "backend\public\upload.php" "C:\xampp\htdocs\api-tienda-tec\public\upload.php"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo copiar upload.php
    echo Asegurate de que existe C:\xampp\htdocs\api-tienda-tec\public\
    pause
    exit /b 1
)

REM Copiar .htaccess
echo Copiando .htaccess...
copy /Y "backend\public\.htaccess" "C:\xampp\htdocs\api-tienda-tec\public\.htaccess"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo copiar .htaccess
    pause
    exit /b 1
)

REM Crear directorio uploads si no existe
echo Creando directorio uploads...
if not exist "C:\xampp\htdocs\api-tienda-tec\uploads" (
    mkdir "C:\xampp\htdocs\api-tienda-tec\uploads"
    echo Directorio uploads creado
) else (
    echo Directorio uploads ya existe
)

REM Copiar imagenes existentes si hay alguna en desarrollo
if exist "backend\uploads\*.*" (
    echo Copiando imagenes existentes...
    xcopy /Y /Q "backend\uploads\*.*" "C:\xampp\htdocs\api-tienda-tec\uploads\"
    echo Imagenes copiadas
)

echo.
echo ====================================
echo Sincronizacion completada!
echo ====================================
echo.
echo Archivos copiados:
echo - upload.php
echo - .htaccess
echo.
echo Directorio creado:
echo - uploads/
echo.
echo Ahora puedes probar la subida de imagenes en el panel de admin
echo Recuerda actualizar la pagina del navegador (Ctrl+F5)
echo.
pause
