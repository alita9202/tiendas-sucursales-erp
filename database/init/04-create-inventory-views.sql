-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 04-create-inventory-views.sql
-- Responsabilidad: Crear vistas de consulta para inventario, stock y transferencias
-- Esquema: inventarios
-- =========================================================

-- =========================================================
-- Vista: v_stock_por_sucursal
-- Muestra el stock actual separado por compañía, sucursal, almacén y producto
-- =========================================================
CREATE OR REPLACE VIEW inventarios.v_stock_por_sucursal AS
SELECT
    c.id AS compania_id,
    c.nombre AS compania,
    s.id AS sucursal_id,
    s.nombre AS sucursal,
    s.ciudad,
    a.id AS almacen_id,
    a.nombre AS almacen,
    p.id AS producto_id,
    p.codigo AS codigo_producto,
    p.nombre AS producto,
    p.categoria,
    p.unidad_medida,
    st.cantidad_disponible,
    st.cantidad_reservada,
    (st.cantidad_disponible - st.cantidad_reservada) AS cantidad_libre,
    st.stock_minimo,
    CASE
        WHEN st.cantidad_disponible <= st.stock_minimo THEN 'STOCK_CRITICO'
        WHEN st.cantidad_disponible <= (st.stock_minimo * 2) THEN 'STOCK_BAJO'
        ELSE 'STOCK_NORMAL'
    END AS estado_stock,
    st.updated_at
FROM inventarios.stock_almacen st
JOIN empresas_catalogos.companias c ON c.id = st.compania_id
JOIN empresas_catalogos.sucursales s ON s.id = st.sucursal_id
JOIN empresas_catalogos.almacenes a ON a.id = st.almacen_id
JOIN inventarios.productos p ON p.id = st.producto_id;

-- =========================================================
-- Vista: v_transferencias_detalladas
-- Muestra transferencias con origen, destino, producto y cantidad
-- =========================================================
CREATE OR REPLACE VIEW inventarios.v_transferencias_detalladas AS
SELECT
    t.id AS transferencia_id,
    c.nombre AS compania,
    so.nombre AS sucursal_origen,
    ao.nombre AS almacen_origen,
    sd.nombre AS sucursal_destino,
    ad.nombre AS almacen_destino,
    t.estado,
    t.fecha_envio,
    t.fecha_recepcion,
    p.codigo AS codigo_producto,
    p.nombre AS producto,
    td.cantidad,
    t.observacion
FROM inventarios.transferencias_stock t
JOIN empresas_catalogos.companias c ON c.id = t.compania_id
JOIN empresas_catalogos.sucursales so ON so.id = t.sucursal_origen_id
JOIN empresas_catalogos.almacenes ao ON ao.id = t.almacen_origen_id
JOIN empresas_catalogos.sucursales sd ON sd.id = t.sucursal_destino_id
JOIN empresas_catalogos.almacenes ad ON ad.id = t.almacen_destino_id
JOIN inventarios.transferencia_detalles td ON td.transferencia_id = t.id
JOIN inventarios.productos p ON p.id = td.producto_id;

-- =========================================================
-- Vista: v_kardex_inventario
-- Historial de movimientos de inventario
-- =========================================================
CREATE OR REPLACE VIEW inventarios.v_kardex_inventario AS
SELECT
    m.id AS movimiento_id,
    c.nombre AS compania,
    s.nombre AS sucursal,
    a.nombre AS almacen,
    p.codigo AS codigo_producto,
    p.nombre AS producto,
    m.tipo_movimiento,
    m.cantidad,
    m.referencia_tipo,
    m.referencia_id,
    m.observacion,
    m.created_at AS fecha_movimiento
FROM inventarios.movimientos_inventario m
JOIN empresas_catalogos.companias c ON c.id = m.compania_id
JOIN empresas_catalogos.sucursales s ON s.id = m.sucursal_id
JOIN empresas_catalogos.almacenes a ON a.id = m.almacen_id
JOIN inventarios.productos p ON p.id = m.producto_id;

SELECT 'Vistas de inventario creadas correctamente' AS resultado;
