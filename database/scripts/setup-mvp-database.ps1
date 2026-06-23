# Setup MVP Database
# Uses PostgreSQL inside Docker container. No local psql required.

$ErrorActionPreference = "Stop"

$PgUser = "admin"
$MvpPath = Join-Path (Get-Location).Path "database\mvp"

function Invoke-PsqlFile {
    param(
        [string]$Database,
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        throw "File not found: $FilePath"
    }

    Write-Host "Executing $FilePath on $Database..." -ForegroundColor Cyan
    Get-Content -Raw $FilePath | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $PgUser -d $Database

    if ($LASTEXITCODE -ne 0) {
        throw "Error executing $FilePath"
    }
}

Write-Host "Starting PostgreSQL and RabbitMQ..." -ForegroundColor Cyan
docker compose up -d postgres rabbitmq

Start-Sleep -Seconds 5

Write-Host "Creating MVP database..." -ForegroundColor Cyan
Invoke-PsqlFile -Database "postgres" -FilePath (Join-Path $MvpPath "00-create-database.sql")

Write-Host "Installing schema..." -ForegroundColor Cyan
Invoke-PsqlFile -Database "erp_main_db" -FilePath (Join-Path $MvpPath "01-schema.sql")

Write-Host "Installing functions..." -ForegroundColor Cyan
Invoke-PsqlFile -Database "erp_main_db" -FilePath (Join-Path $MvpPath "04-functions.sql")

Write-Host "Installing views..." -ForegroundColor Cyan
Invoke-PsqlFile -Database "erp_main_db" -FilePath (Join-Path $MvpPath "03-views.sql")

Write-Host "Loading demo seed..." -ForegroundColor Cyan
Invoke-PsqlFile -Database "erp_main_db" -FilePath (Join-Path $MvpPath "02-seed-demo.sql")

Write-Host ""
Write-Host "MVP database setup completed successfully." -ForegroundColor Green
