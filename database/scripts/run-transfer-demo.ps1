# =========================================================
# Proyecto: Tiendas Sucursales ERP - Microservicios
# Archivo: run-transfer-demo.ps1
# Responsabilidad: Demostracion controlada de transferencia de stock
# =========================================================

Write-Host "========================================================="
Write-Host "DEMO: TRANSFERENCIA DE STOCK ENTRE SUCURSALES"
Write-Host "========================================================="

Write-Host ""
Write-Host "Reiniciando datos demo para iniciar desde un estado limpio..."

Get-Content -Raw database\seed\00-reset-demo-data.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
Get-Content -Raw database\seed\01-seed-demo-base.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Write-Host ""
Write-Host "========================================================="
Write-Host "1. STOCK INICIAL DE LAPTOPS"
Write-Host "========================================================="

docker compose exec postgres psql -U admin -d erp_main_db -P pager=off -c "
SELECT
    sucursal,
    producto,
    cantidad_disponible
FROM inventarios.v_stock_por_sucursal
WHERE codigo_producto = 'PROD-LAP-001'
ORDER BY sucursal;
"

Write-Host ""
Write-Host "========================================================="
Write-Host "2. DESPACHANDO 10 LAPTOPS DE LA PAZ A COCHABAMBA"
Write-Host "========================================================="

$TRANSFER_ID = docker compose exec -T postgres psql -U admin -d erp_main_db -t -A -c "
SELECT inventarios.despachar_transferencia(
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    '10000000-0000-0000-0000-000000000001',
    10,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Demo controlada: transferencia de 10 laptops de La Paz a Cochabamba'
);
"

$TRANSFER_ID = $TRANSFER_ID.Trim()

Write-Host ""
Write-Host "Transferencia creada con ID:"
Write-Host $TRANSFER_ID

Write-Host ""
Write-Host "========================================================="
Write-Host "3. STOCK DESPUES DEL DESPACHO"
Write-Host "La Paz debe bajar de 50 a 40."
Write-Host "Cochabamba aun debe seguir en 20 porque esta EN_TRANSITO."
Write-Host "========================================================="

docker compose exec postgres psql -U admin -d erp_main_db -P pager=off -c "
SELECT
    sucursal,
    producto,
    cantidad_disponible
FROM inventarios.v_stock_por_sucursal
WHERE codigo_producto = 'PROD-LAP-001'
ORDER BY sucursal;
"

Write-Host ""
Write-Host "========================================================="
Write-Host "4. TRANSFERENCIA EN TRANSITO"
Write-Host "========================================================="

docker compose exec postgres psql -U admin -d erp_main_db -P pager=off -c "
SELECT
    transferencia_id,
    sucursal_origen,
    sucursal_destino,
    estado,
    producto,
    cantidad
FROM inventarios.v_transferencias_detalladas
WHERE transferencia_id = '$TRANSFER_ID'::uuid;
"

Write-Host ""
Write-Host "========================================================="
Write-Host "5. RECIBIENDO TRANSFERENCIA EN COCHABAMBA"
Write-Host "========================================================="

docker compose exec postgres psql -U admin -d erp_main_db -c "
SELECT inventarios.recibir_transferencia(
    '$TRANSFER_ID'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);
"

Write-Host ""
Write-Host "========================================================="
Write-Host "6. STOCK FINAL"
Write-Host "La Paz debe quedar en 40."
Write-Host "Cochabamba debe subir de 20 a 30."
Write-Host "Santa Cruz debe mantenerse en 10."
Write-Host "========================================================="

docker compose exec postgres psql -U admin -d erp_main_db -P pager=off -c "
SELECT
    sucursal,
    producto,
    cantidad_disponible
FROM inventarios.v_stock_por_sucursal
WHERE codigo_producto = 'PROD-LAP-001'
ORDER BY sucursal;
"

Write-Host ""
Write-Host "========================================================="
Write-Host "7. KARDEX DE LA TRANSFERENCIA"
Write-Host "Debe mostrar salida en La Paz y entrada en Cochabamba."
Write-Host "========================================================="

docker compose exec postgres psql -U admin -d erp_main_db -P pager=off -c "
SELECT
    sucursal,
    producto,
    tipo_movimiento,
    cantidad,
    referencia_tipo,
    referencia_id,
    fecha_movimiento
FROM inventarios.v_kardex_inventario
WHERE referencia_id = '$TRANSFER_ID'::uuid
ORDER BY fecha_movimiento;
"

Write-Host ""
Write-Host "========================================================="
Write-Host "DEMO FINALIZADA CORRECTAMENTE"
Write-Host "========================================================="