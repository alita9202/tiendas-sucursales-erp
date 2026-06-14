# =========================================================
# Proyecto: Tiendas Sucursales ERP - Microservicios
# Archivo: setup-database.ps1
# Responsabilidad: Levantar y preparar la base de datos completa
# =========================================================

Write-Host "========================================================="
Write-Host "LEVANTANDO SERVICIOS DOCKER"
Write-Host "========================================================="

docker compose up -d postgres rabbitmq

Write-Host ""
Write-Host "========================================================="
Write-Host "ESPERANDO POSTGRES..."
Write-Host "========================================================="

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================================="
Write-Host "EJECUTANDO SCRIPTS DE ESTRUCTURA"
Write-Host "========================================================="

Get-Content -Raw database\init\01-create-schemas.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
Get-Content -Raw database\init\02-create-empresas-catalogos.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
Get-Content -Raw database\init\03-create-inventarios.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
Get-Content -Raw database\init\04-create-inventory-views.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
Get-Content -Raw database\init\05-create-transfer-functions.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Write-Host ""
Write-Host "========================================================="
Write-Host "CARGANDO DATOS DEMO"
Write-Host "========================================================="

Get-Content -Raw database\seed\01-seed-demo-base.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Write-Host ""
Write-Host "========================================================="
Write-Host "EJECUTANDO VERIFICACION TECNICA"
Write-Host "========================================================="

Get-Content -Raw database\checks\01-check-database-health.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Write-Host ""
Write-Host "========================================================="
Write-Host "BASE DE DATOS LISTA PARA SER CONSUMIDA"
Write-Host "========================================================="

Write-Host "PostgreSQL local:"
Write-Host "postgresql://admin:erp_secure_password_2024@localhost:5432/erp_main_db"

Write-Host ""
Write-Host "PostgreSQL desde servicios Docker:"
Write-Host "postgresql://admin:erp_secure_password_2024@postgres:5432/erp_main_db"

Write-Host ""
Write-Host "RabbitMQ Management:"
Write-Host "http://localhost:15672"
Write-Host "Usuario: guest"
Write-Host "Password: guest"
