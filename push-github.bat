@echo off
REM Subir menfresh-booking a GitHub (ejecutar una vez despues de crear el repo vacio)
REM 1. Crear repo en https://github.com/new?name=menfresh-booking (sin README)
REM 2. Reemplazar TU_USUARIO abajo y ejecutar este script

set GITHUB_USER=TU_USUARIO

git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/menfresh-booking.git
git push -u origin main

echo.
echo Listo. Activa GitHub Pages: Settings ^> Pages ^> Source: GitHub Actions
