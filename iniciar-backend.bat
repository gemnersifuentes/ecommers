@echo off
echo ====================================
echo Iniciando servidor backend local
echo ====================================
echo.
echo Backend corriendo en: http://localhost:8000
echo Frontend debe estar en: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
cd backend
php -S localhost:8000 router.php
