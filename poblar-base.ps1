$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "     POBLAR BASE DE DATOS DOÑA SERAFINA      " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

Write-Host "Iniciando contenedores..." -ForegroundColor Cyan
docker start erp-postgres
Start-Sleep -Seconds 3

Write-Host "Configurando base de datos..." -ForegroundColor Cyan
.\database\scripts\setup-mvp-database.ps1

Write-Host "Base de datos lista con datos iniciales." -ForegroundColor Green
Write-Host "Para iniciar la aplicacion:" -ForegroundColor Yellow
Write-Host "1. En una terminal (api-gateway): npm run start:dev" -ForegroundColor White
Write-Host "2. En otra terminal (dashboard-web): npm run dev" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Yellow
