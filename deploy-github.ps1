# Deploy Menfresh Booking → GitHub Pages
# Ejecutar en PowerShell:  .\deploy-github.ps1

$ErrorActionPreference = "Stop"
$repoName = "menfresh-booking"
$githubUser = "kirit0-1"
$gh = "C:\Program Files\GitHub CLI\gh.exe"

Write-Host "`n=== Deploy Menfresh Booking ===" -ForegroundColor Cyan
Write-Host "Cuenta: $githubUser / Repo: $repoName`n"

Set-Location $PSScriptRoot

# 1. Verificar gh
if (-not (Test-Path $gh)) {
    Write-Host "GitHub CLI no instalado. Instala con: winget install GitHub.cli" -ForegroundColor Red
    exit 1
}

# 2. Login si hace falta
$authOk = $false
try { & $gh auth status 2>$null; $authOk = $true } catch { }

if (-not $authOk) {
    Write-Host "Abriendo login de GitHub en el navegador..." -ForegroundColor Yellow
    & $gh auth login -h github.com -p https -w
}

# 3. Crear repo si no existe
$repoExists = $false
try {
    & $gh repo view "$githubUser/$repoName" 2>$null
    $repoExists = $true
    Write-Host "Repo ya existe en GitHub." -ForegroundColor Green
} catch {
    Write-Host "Creando repo publico $repoName ..." -ForegroundColor Yellow
    & $gh repo create $repoName --public --description "Reservas online - Barberia Menfresh"
    $repoExists = $true
}

# 4. Remote y push
git remote remove origin 2>$null
git remote add origin "https://github.com/$githubUser/$repoName.git"
git branch -M main
git -c user.name="kirit0-1" -c user.email="292630021+kirit0-1@users.noreply.github.com" push -u origin main

Write-Host "`nCodigo subido correctamente." -ForegroundColor Green

# 5. Habilitar GitHub Pages (workflow)
Write-Host "Configurando GitHub Pages (GitHub Actions)..." -ForegroundColor Yellow
& $gh api repos/$githubUser/$repoName/pages -X POST -f build_type=workflow 2>$null

Write-Host @"

========================================
  LISTO PARA COMPARTIR CON TU SOCIO
========================================

  URL (en 1-3 minutos):
  https://$githubUser.github.io/$repoName/

  Si no carga aun:
  1. Ve a https://github.com/$githubUser/$repoName/settings/pages
  2. Source: GitHub Actions
  3. Revisa el workflow en Actions si falla

  Link directo al repo:
  https://github.com/$githubUser/$repoName

"@ -ForegroundColor Cyan
