-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 00-reset-demo-data.sql
-- Responsabilidad: Limpiar datos demo transaccionales antes de recargar seed
-- =========================================================

BEGIN;

-- Limpia movimientos de inventario de la compañía demo
DELETE FROM inventarios.movimientos_inventario
WHERE compania_id = '11111111-1111-1111-1111-111111111111';

-- Limpia series demo si existieran
DELETE FROM inventarios.producto_series
WHERE compania_id = '11111111-1111-1111-1111-111111111111';

-- Limpia detalles de transferencias de la compañía demo
DELETE FROM inventarios.transferencia_detalles
WHERE transferencia_id IN (
    SELECT id
    FROM inventarios.transferencias_stock
    WHERE compania_id = '11111111-1111-1111-1111-111111111111'
);

-- Limpia transferencias de la compañía demo
DELETE FROM inventarios.transferencias_stock
WHERE compania_id = '11111111-1111-1111-1111-111111111111';

-- Limpia stock demo para recargarlo desde cero
DELETE FROM inventarios.stock_almacen
WHERE compania_id = '11111111-1111-1111-1111-111111111111';

COMMIT;

SELECT 'Datos demo limpiados correctamente' AS resultado;
