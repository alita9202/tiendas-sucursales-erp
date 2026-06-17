$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "     INICIANDO DEMO MVP TIENDAS ERP          " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# 1. Resetear base
Write-Host "`n1. Reseteando base de datos..." -ForegroundColor Cyan
.\database\scripts\reset-mvp-database.ps1

# IDs conocidos del seed
$oxxoPrado = "b0000000-0000-0000-0000-000000000001"
$oxxoElAlto = "b0000000-0000-0000-0000-000000000002"
$hipermaxiSuc1 = "b0000000-0000-0000-0000-000000000003"
$lechePil = "a0000000-0000-0000-0000-000000000002"
$juanito = "c0000000-0000-0000-0000-000000000001"

# 2. Stock inicial
Write-Host "`n2. Stock inicial de Leche Pil en OXXO Prado:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT branch_name, product_name, quantity FROM v_inventory_by_branch WHERE product_code = 'PROD-002' AND branch_name = 'Sucursal Prado';"

# 3. Vender 2 unidades
Write-Host "`n3. Vender 2 unidades a Juanito Perez desde OXXO Prado:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT * FROM fn_register_sale('$oxxoPrado', '$juanito', '$lechePil', 2, 'CASH');"

# 4. Transferir 50 unidades
Write-Host "`n4. Transferir 50 unidades de OXXO Prado a OXXO El Alto:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT fn_transfer_stock('$oxxoPrado', '$oxxoElAlto', '$lechePil', 50);"

# 5. Vender 1 unidad desde Hipermaxi
Write-Host "`n5. Vender 1 unidad a Juanito Perez desde Hipermaxi Sucursal 1:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT * FROM fn_register_sale('$hipermaxiSuc1', '$juanito', '$lechePil', 1, 'CARD');"

# 6. Registrar baja por perdida
Write-Host "`n6. Registrar baja por perdida o vencimiento de 1 unidad en OXXO Prado:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT fn_inventory_output_loss('$oxxoPrado', '$lechePil', 1, 'Envase danado');"

# 7. Mostrar consolidado
Write-Host "`n7. Reporte consolidado de stock de Leche Pil:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT * FROM v_inventory_consolidated WHERE product_code = 'PROD-002';"

# 8. Reporte de ventas del dia
Write-Host "`n8. Reporte de ventas del dia:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT * FROM v_sales_daily_report;"

# 9. Mostrar movimientos
Write-Host "`n9. Movimientos recientes de kardex (OXXO Prado):" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT movement_type, quantity_change, balance_after, notes FROM inventory_movements WHERE branch_id = '$oxxoPrado' ORDER BY created_at DESC LIMIT 5;"

# 10. Notificaciones
Write-Host "`n10. Notificaciones simuladas:" -ForegroundColor Cyan
docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT event_type, content FROM notifications ORDER BY created_at DESC;"

# 11. Venta imposible
Write-Host "`n11. Intentando venta sin stock (99999 unidades):" -ForegroundColor Cyan
try {
    docker compose exec -T postgres psql -U admin -d supermarket_mvp_db -c "SELECT * FROM fn_register_sale('$oxxoPrado', '$juanito', '$lechePil', 99999, 'CASH');" 2>&1
    Write-Host "Si ves esto, algo fallo, la venta deberia haber sido rechazada." -ForegroundColor Red
} catch {
    Write-Host "Correcto! La base de datos rechazo la venta." -ForegroundColor Green
}

Write-Host "`n=============================================" -ForegroundColor Yellow
Write-Host "                DEMO COMPLETADO              " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow





