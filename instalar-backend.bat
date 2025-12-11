@echo off
echo ================================================
echo   INSTALACION DE TIENDATEC - BACKEND
echo ================================================
echo.

REM Verificar si XAMPP está instalado
if not exist "C:\xampp\" (
    echo [ERROR] No se encontró XAMPP en C:\xampp\
    echo Por favor instala XAMPP primero
    pause
    exit
)

echo [OK] XAMPP encontrado
echo.

REM Crear directorio para el backend
echo Creando directorio del backend...
if not exist "C:\xampp\htdocs\api-tienda-tec" (
    mkdir "C:\xampp\htdocs\api-tienda-tec"
)

REM Copiar archivos del backend
echo Copiando archivos del backend...
xcopy /E /I /Y "backend\*" "C:\xampp\htdocs\api-tienda-tec\"

echo.
echo ================================================
echo   BACKEND INSTALADO CORRECTAMENTE
echo ================================================
echo.
echo Ahora debes:
echo 1. Iniciar Apache y MySQL en XAMPP
echo 2. Abrir phpMyAdmin: http://localhost/phpmyadmin
echo 3. Importar el archivo database.sql
echo.
echo El backend estará disponible en:
echo http://localhost/api-tienda-tec/
echo.
pause
