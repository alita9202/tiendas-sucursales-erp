-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 01-check-database-health.sql
-- Responsabilidad: Verificación técnica de base de datos para consumo de microservicios
-- =========================================================

\echo '========================================================='
\echo 'CHECK 1: ESQUEMAS DISPONIBLES'
\echo '========================================================='

SELECT schema_name
FROM information_schema.schemata
WHERE schema_name IN (
    'shared',
    'empresas_catalogos',
    'inventarios',
    'ventas_facturacion',
    'finanzas'
)
ORDER BY schema_name;

\echo '========================================================='
\echo 'CHECK 2: TABLAS PRINCIPALES'
\echo '========================================================='

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('empresas_catalogos', 'inventarios')
ORDER BY table_schema, table_name;

\echo '========================================================='
\echo 'CHECK 3: VISTAS DISPONIBLES PARA CONSULTA'
\echo '========================================================='

SELECT table_schema, table_name
FROM information_schema.views
WHERE table_schema = 'inventarios'
ORDER BY table_name;

\echo '========================================================='
\echo 'CHECK 4: STOCK ACTUAL POR SUCURSAL'
\echo '========================================================='

SELECT
    sucursal,
    producto,
    cantidad_disponible,
    stock_minimo,
    estado_stock
FROM inventarios.v_stock_por_sucursal
ORDER BY producto, sucursal;

\echo '========================================================='
\echo 'CHECK 5: FUNCIONES DE TRANSFERENCIA DISPONIBLES'
\echo '========================================================='

SELECT
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'inventarios'
  AND routine_name IN ('despachar_transferencia', 'recibir_transferencia')
ORDER BY routine_name;

\echo '========================================================='
\echo 'CHECK 6: TRANSFERENCIAS REGISTRADAS'
\echo '========================================================='

SELECT
    transferencia_id,
    sucursal_origen,
    sucursal_destino,
    estado,
    producto,
    cantidad,
    fecha_envio,
    fecha_recepcion
FROM inventarios.v_transferencias_detalladas
ORDER BY fecha_envio DESC
LIMIT 10;

\echo '========================================================='
\echo 'CHECK 7: KARDEX DE INVENTARIO'
\echo '========================================================='

SELECT
    sucursal,
    producto,
    tipo_movimiento,
    cantidad,
    referencia_tipo,
    fecha_movimiento
FROM inventarios.v_kardex_inventario
ORDER BY fecha_movimiento DESC
LIMIT 15;

\echo '========================================================='
\echo 'CHECK FINALIZADO: BASE LISTA PARA SER CONSUMIDA'
\echo '========================================================='
