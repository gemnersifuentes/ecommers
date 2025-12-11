@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         VERIFICADOR DE INSTALACIÓN - TIENDATEC                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Verificar XAMPP
echo [1/6] Verificando XAMPP...
if exist "C:\xampp\" (
    echo    ✓ XAMPP encontrado
) else (
    echo    ✗ XAMPP NO encontrado
    echo    → Instala XAMPP desde: https://www.apachefriends.org/
    pause
    exit
)

REM Verificar si Apache está corriendo
echo.
echo [2/6] Verificando Apache...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    ✓ Apache está corriendo
) else (
    echo    ✗ Apache NO está corriendo
    echo    → Abre XAMPP Control Panel y presiona START en Apache
)

REM Verificar si MySQL está corriendo
echo.
echo [3/6] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    ✓ MySQL está corriendo
) else (
    echo    ✗ MySQL NO está corriendo
    echo    → Abre XAMPP Control Panel y presiona START en MySQL
)

REM Verificar backend
echo.
echo [4/6] Verificando Backend...
if exist "C:\xampp\htdocs\api-tienda-tec\public\index.php" (
    echo    ✓ Backend instalado correctamente
) else (
    echo    ✗ Backend NO encontrado
    echo    → Ejecuta: instalar-backend.bat
)

REM Verificar archivo de prueba
echo.
echo [5/6] Verificando archivo de prueba...
if exist "C:\xampp\htdocs\api-tienda-tec\test-conexion.php" (
    echo    ✓ Archivo de prueba creado
    echo.
    echo    Abre en tu navegador:
    echo    → http://localhost/api-tienda-tec/test-conexion.php
) else (
    echo    ! Copiando archivo de prueba...
    copy "backend\public\test-conexion.php" "C:\xampp\htdocs\api-tienda-tec\test-conexion.php" >nul 2>&1
    if exist "C:\xampp\htdocs\api-tienda-tec\test-conexion.php" (
        echo    ✓ Archivo de prueba creado
    )
)

REM Verificar Node.js
echo.
echo [6/6] Verificando Node.js...
where node >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo    ✓ Node.js instalado
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    Version: %NODE_VERSION%
) else (
    echo    ✗ Node.js NO encontrado
    echo    → Instala Node.js desde: https://nodejs.org/
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   RESUMEN
echo ════════════════════════════════════════════════════════════════
echo.
echo PRUEBA LA CONEXIÓN:
echo 1. Abre: http://localhost/api-tienda-tec/test-conexion.php
echo    → Debe mostrar "TODO FUNCIONA CORRECTAMENTE"
echo.
echo 2. Si no funciona:
echo    → Abre phpMyAdmin: http://localhost/phpmyadmin
echo    → Verifica que exista la base de datos: db_tienda_tec
echo    → Si no existe, importa el archivo: database.sql
echo.
echo 3. Inicia el frontend:
echo    → Abre PowerShell en esta carpeta
echo    → Ejecuta: npm run dev
echo    → Abre: http://localhost:5173
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause

REM Preguntar si quiere abrir el test de conexión
echo.
set /p ABRIR="¿Quieres abrir el test de conexión ahora? (S/N): "
if /i "%ABRIR%"=="S" (
    start http://localhost/api-tienda-tec/test-conexion.php
)

REM Preguntar si quiere abrir phpMyAdmin
echo.
set /p PHPMYADMIN="¿Quieres abrir phpMyAdmin? (S/N): "
if /i "%PHPMYADMIN%"=="S" (
    start http://localhost/phpmyadmin
)

echo.
echo ¡Listo! Presiona cualquier tecla para salir...
pause >nul
