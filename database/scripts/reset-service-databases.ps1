# Reset Microservices Databases
# Uses PostgreSQL inside Docker container. No local psql required.
# Drops and recreates all independent service databases.

$ErrorActionPreference = "Stop"

$PgUser = "admin"
$DbScriptsPath = Join-Path (Get-Location).Path "database\service-databases"

function Invoke-PsqlSql {
    param(
        [string]$Database,
        [string]$Sql
    )

    $Sql | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $PgUser -d $Database

    if ($LASTEXITCODE -ne 0) {
        throw "psql command failed on database $Database."
    }
}

function Invoke-PsqlFile {
    param(
        [string]$Database,
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "Skipping missing file: $FilePath" -ForegroundColor Yellow
        return
    }

    Write-Host "Executing $FilePath on $Database..."
    Get-Content -Raw $FilePath | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $PgUser -d $Database

    if ($LASTEXITCODE -ne 0) {
        throw "psql file execution failed: $FilePath"
    }
}

Write-Host "Starting PostgreSQL and RabbitMQ with Docker Compose..."
docker compose up -d postgres rabbitmq

Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 8

$Databases = @(
    "company",
    "auth",
    "product",
    "inventory",
    "sales",
    "customer",
    "notification"
)

Write-Host ""
Write-Host "Dropping and recreating independent service databases..." -ForegroundColor Cyan

foreach ($db in $Databases) {
    $dbName = "${db}_db"

    Write-Host "Resetting $dbName..." -ForegroundColor Yellow

    Invoke-PsqlSql -Database "postgres" -Sql "DROP DATABASE IF EXISTS $dbName WITH (FORCE);"
    Invoke-PsqlSql -Database "postgres" -Sql "CREATE DATABASE $dbName;"
}

foreach ($db in $Databases) {
    $dbName = "${db}_db"
    $dbDir = Join-Path $DbScriptsPath "${db}-db"

    Write-Host ""
    Write-Host "Reinstalling $dbName..." -ForegroundColor Cyan

    $SchemaFile = Join-Path $dbDir "01-schema.sql"
    Invoke-PsqlFile -Database $dbName -FilePath $SchemaFile

    if ($db -eq "inventory") {
        $FunctionsFile = Join-Path $dbDir "03-functions.sql"
        Invoke-PsqlFile -Database $dbName -FilePath $FunctionsFile

        $ViewsFile = Join-Path $dbDir "04-views.sql"
        Invoke-PsqlFile -Database $dbName -FilePath $ViewsFile
    }

    $SeedFile = Join-Path $dbDir "02-seed.sql"
    Invoke-PsqlFile -Database $dbName -FilePath $SeedFile
}

Write-Host ""
Write-Host "Reset completed successfully." -ForegroundColor Green
Write-Host "Run .\database\scripts\check-service-databases.ps1 to validate the installation."
