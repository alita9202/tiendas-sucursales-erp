# Check Microservices Databases
# Uses PostgreSQL inside Docker container. No local psql required.

$ErrorActionPreference = "Stop"

$PgUser = "admin"

function Invoke-PsqlScalar {
    param(
        [string]$Database,
        [string]$Query
    )

    $result = $Query | docker compose exec -T postgres psql -U $PgUser -d $Database -t -A
    return ($result | Out-String).Trim()
}

function Check-Minimum {
    param(
        [string]$Name,
        [int]$Actual,
        [int]$Expected
    )

    if ($Actual -lt $Expected) {
        Write-Host "WARNING: $Name = $Actual. Expected at least $Expected." -ForegroundColor Yellow
    } else {
        Write-Host "OK: $Name = $Actual" -ForegroundColor Green
    }
}

Write-Host "Checking independent microservice databases..." -ForegroundColor Cyan
Write-Host ""

$Databases = @(
    "company_db",
    "auth_db",
    "product_db",
    "inventory_db",
    "sales_db",
    "customer_db",
    "notification_db"
)

foreach ($dbName in $Databases) {
    $tableCount = Invoke-PsqlScalar -Database $dbName -Query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
    Write-Host "OK: $dbName has $tableCount tables" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking seed data..." -ForegroundColor Cyan

$companies = [int](Invoke-PsqlScalar -Database "company_db" -Query "SELECT COUNT(*) FROM companies;")
$branches = [int](Invoke-PsqlScalar -Database "company_db" -Query "SELECT COUNT(*) FROM branches;")
$roles = [int](Invoke-PsqlScalar -Database "auth_db" -Query "SELECT COUNT(*) FROM roles;")
$users = [int](Invoke-PsqlScalar -Database "auth_db" -Query "SELECT COUNT(*) FROM users;")
$products = [int](Invoke-PsqlScalar -Database "product_db" -Query "SELECT COUNT(*) FROM products;")
$categories = [int](Invoke-PsqlScalar -Database "product_db" -Query "SELECT COUNT(*) FROM categories;")
$stock = [int](Invoke-PsqlScalar -Database "inventory_db" -Query "SELECT COUNT(*) FROM inventory_stock;")
$lowStock = [int](Invoke-PsqlScalar -Database "inventory_db" -Query "SELECT COUNT(*) FROM inventory_stock WHERE quantity <= min_stock;")
$customers = [int](Invoke-PsqlScalar -Database "customer_db" -Query "SELECT COUNT(*) FROM customers;")
$sales = [int](Invoke-PsqlScalar -Database "sales_db" -Query "SELECT COUNT(*) FROM sales;")
$templates = [int](Invoke-PsqlScalar -Database "notification_db" -Query "SELECT COUNT(*) FROM notification_templates;")
$notifications = [int](Invoke-PsqlScalar -Database "notification_db" -Query "SELECT COUNT(*) FROM notifications;")

Check-Minimum "Companies" $companies 1
Check-Minimum "Branches" $branches 5
Check-Minimum "Roles" $roles 4
Check-Minimum "Users" $users 4
Check-Minimum "Categories" $categories 8
Check-Minimum "Products" $products 30
Check-Minimum "Inventory stock rows" $stock 30
Check-Minimum "Low stock rows" $lowStock 1
Check-Minimum "Customers" $customers 20
Check-Minimum "Sales" $sales 1
Check-Minimum "Notification templates" $templates 3
Check-Minimum "Notifications" $notifications 1

Write-Host ""
Write-Host "Checking inventory functions and views..." -ForegroundColor Cyan

$functions = [int](Invoke-PsqlScalar -Database "inventory_db" -Query "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('process_inventory_transfer_dispatch', 'process_inventory_transfer_receive');")
$views = [int](Invoke-PsqlScalar -Database "inventory_db" -Query "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('v_inventory_balance', 'v_inventory_kardex_history');")

Check-Minimum "Inventory transfer functions" $functions 2
Check-Minimum "Inventory views" $views 2

Write-Host ""
Write-Host "Database check completed." -ForegroundColor Green
Write-Host "Review any WARNING lines before committing." -ForegroundColor Yellow

