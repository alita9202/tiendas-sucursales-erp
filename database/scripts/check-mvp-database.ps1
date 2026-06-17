# Check MVP Database
# Uses PostgreSQL inside Docker container. No local psql required.

$ErrorActionPreference = "Stop"

$PgUser = "admin"
$Database = "supermarket_mvp_db"

function Invoke-Scalar {
    param([string]$Query)

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

Write-Host "Checking MVP database..." -ForegroundColor Cyan

$dbExists = "SELECT 1 FROM pg_database WHERE datname = 'supermarket_mvp_db';" |
    docker compose exec -T postgres psql -U $PgUser -d postgres -t -A

if (($dbExists | Out-String).Trim() -ne "1") {
    throw "Database supermarket_mvp_db does not exist."
}

Write-Host "OK: supermarket_mvp_db exists" -ForegroundColor Green

$tables = [int](Invoke-Scalar "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
$functions = [int](Invoke-Scalar "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('fn_register_sale', 'fn_transfer_stock', 'fn_inventory_output_loss');")
$views = [int](Invoke-Scalar "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('v_inventory_by_branch', 'v_inventory_consolidated', 'v_sales_daily_report', 'v_sales_detail');")

$companies = [int](Invoke-Scalar "SELECT COUNT(*) FROM companies;")
$branches = [int](Invoke-Scalar "SELECT COUNT(*) FROM branches;")
$products = [int](Invoke-Scalar "SELECT COUNT(*) FROM products;")
$customers = [int](Invoke-Scalar "SELECT COUNT(*) FROM customers;")
$stock = [int](Invoke-Scalar "SELECT COUNT(*) FROM inventory_stock;")
$lecheStock = [int](Invoke-Scalar "SELECT COUNT(*) FROM inventory_stock s JOIN products p ON p.id = s.product_id WHERE p.name ILIKE '%Leche Pil%';")

Check-Minimum "Tables" $tables 11
Check-Minimum "Functions" $functions 3
Check-Minimum "Views" $views 4
Check-Minimum "Companies" $companies 4
Check-Minimum "Branches" $branches 6
Check-Minimum "Products" $products 6
Check-Minimum "Customers" $customers 1
Check-Minimum "Inventory stock rows" $stock 6
Check-Minimum "Leche Pil stock rows" $lecheStock 4

Write-Host ""
Write-Host "Checking views return data..." -ForegroundColor Cyan

Invoke-Scalar "SELECT COUNT(*) FROM v_inventory_by_branch;" | ForEach-Object { Check-Minimum "v_inventory_by_branch rows" ([int]$_) 1 }
Invoke-Scalar "SELECT COUNT(*) FROM v_inventory_consolidated;" | ForEach-Object { Check-Minimum "v_inventory_consolidated rows" ([int]$_) 1 }

Write-Host ""
Write-Host "MVP database check completed." -ForegroundColor Green
Write-Host "Review any WARNING lines before committing." -ForegroundColor Yellow
