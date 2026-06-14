-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 01-seed-demo-base.sql
-- Responsabilidad: Datos demo para multicompañía, sucursales, almacenes, productos y stock inicial
-- =========================================================

BEGIN;

-- Limpieza controlada de movimientos seed para evitar duplicados si se vuelve a ejecutar
DELETE FROM inventarios.movimientos_inventario
WHERE referencia_tipo = 'SEED_STOCK_INICIAL';

-- =========================
-- Compañía demo
-- =========================
INSERT INTO empresas_catalogos.companias (
    id, nombre, razon_social, nit, rubro, estado
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Grupo Comercial Demo',
    'Grupo Comercial Demo S.R.L.',
    '1020304050',
    'Retail multirubro',
    'ACTIVA'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    razon_social = EXCLUDED.razon_social,
    nit = EXCLUDED.nit,
    rubro = EXCLUDED.rubro,
    estado = EXCLUDED.estado;

-- =========================
-- Sucursales
-- =========================
INSERT INTO empresas_catalogos.sucursales (
    id, compania_id, nombre, ciudad, departamento, direccion, telefono, estado
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Sucursal La Paz',
    'La Paz',
    'La Paz',
    'Av. Mariscal Santa Cruz #100',
    '70000001',
    'ACTIVA'
),
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Sucursal Cochabamba',
    'Cochabamba',
    'Cochabamba',
    'Av. América #200',
    '70000002',
    'ACTIVA'
),
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Sucursal Santa Cruz',
    'Santa Cruz',
    'Santa Cruz',
    'Av. Cristo Redentor #300',
    '70000003',
    'ACTIVA'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    ciudad = EXCLUDED.ciudad,
    departamento = EXCLUDED.departamento,
    direccion = EXCLUDED.direccion,
    telefono = EXCLUDED.telefono,
    estado = EXCLUDED.estado;

-- =========================
-- Almacenes principales
-- =========================
INSERT INTO empresas_catalogos.almacenes (
    id, compania_id, sucursal_id, nombre, tipo, estado
) VALUES
(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Almacén Principal La Paz',
    'PRINCIPAL',
    'ACTIVO'
),
(
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'Almacén Principal Cochabamba',
    'PRINCIPAL',
    'ACTIVO'
),
(
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'Almacén Principal Santa Cruz',
    'PRINCIPAL',
    'ACTIVO'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    tipo = EXCLUDED.tipo,
    estado = EXCLUDED.estado;

-- =========================
-- Cajas
-- =========================
INSERT INTO empresas_catalogos.cajas (
    id, compania_id, sucursal_id, codigo, nombre, estado
) VALUES
(
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'CAJA-LP-01',
    'Caja 1 La Paz',
    'ACTIVA'
),
(
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'CAJA-CBBA-01',
    'Caja 1 Cochabamba',
    'ACTIVA'
)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    estado = EXCLUDED.estado;

-- =========================
-- Empleados demo
-- =========================
INSERT INTO empresas_catalogos.empleados (
    id, compania_id, sucursal_id, nombres, apellidos, ci, cargo, email, estado
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Juan',
    'Pérez',
    '1001',
    'Encargado de Almacén La Paz',
    'juan.perez@demo.local',
    'ACTIVO'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'María',
    'Gómez',
    '1002',
    'Encargada de Almacén Cochabamba',
    'maria.gomez@demo.local',
    'ACTIVO'
)
ON CONFLICT (id) DO UPDATE SET
    nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    cargo = EXCLUDED.cargo,
    email = EXCLUDED.email,
    estado = EXCLUDED.estado;

-- =========================
-- Productos
-- =========================
INSERT INTO inventarios.productos (
    id, compania_id, codigo, nombre, descripcion, categoria, unidad_medida, precio_referencial, requiere_serie, estado
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'PROD-LAP-001',
    'Laptop Lenovo ThinkPad',
    'Laptop empresarial para ventas y administración',
    'Tecnología',
    'UNIDAD',
    6200.00,
    TRUE,
    'ACTIVO'
),
(
    '10000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'PROD-MOU-001',
    'Mouse Logitech M170',
    'Mouse inalámbrico',
    'Tecnología',
    'UNIDAD',
    85.00,
    FALSE,
    'ACTIVO'
),
(
    '10000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'PROD-TEC-001',
    'Teclado Redragon Kumara',
    'Teclado mecánico',
    'Tecnología',
    'UNIDAD',
    320.00,
    FALSE,
    'ACTIVO'
),
(
    '10000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'PROD-ARR-001',
    'Arroz Premium 5kg',
    'Producto de supermercado',
    'Abarrotes',
    'BOLSA',
    42.00,
    FALSE,
    'ACTIVO'
)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    categoria = EXCLUDED.categoria,
    unidad_medida = EXCLUDED.unidad_medida,
    precio_referencial = EXCLUDED.precio_referencial,
    requiere_serie = EXCLUDED.requiere_serie,
    estado = EXCLUDED.estado;

-- =========================
-- Stock inicial por sucursal y almacén
-- =========================
INSERT INTO inventarios.stock_almacen (
    compania_id, sucursal_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo
) VALUES
-- La Paz
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10000000-0000-0000-0000-000000000001', 50, 0, 5),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10000000-0000-0000-0000-000000000002', 100, 0, 20),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10000000-0000-0000-0000-000000000003', 80, 0, 10),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10000000-0000-0000-0000-000000000004', 200, 0, 30),

-- Cochabamba
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '10000000-0000-0000-0000-000000000001', 20, 0, 5),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '10000000-0000-0000-0000-000000000002', 40, 0, 10),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '10000000-0000-0000-0000-000000000003', 25, 0, 8),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '10000000-0000-0000-0000-000000000004', 90, 0, 20),

-- Santa Cruz
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', '10000000-0000-0000-0000-000000000001', 10, 0, 3),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', '10000000-0000-0000-0000-000000000002', 30, 0, 10),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', '10000000-0000-0000-0000-000000000003', 15, 0, 5),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', '10000000-0000-0000-0000-000000000004', 120, 0, 20)
ON CONFLICT (compania_id, sucursal_id, almacen_id, producto_id) DO UPDATE SET
    cantidad_disponible = EXCLUDED.cantidad_disponible,
    cantidad_reservada = EXCLUDED.cantidad_reservada,
    stock_minimo = EXCLUDED.stock_minimo,
    updated_at = CURRENT_TIMESTAMP;

-- =========================
-- Movimientos de entrada inicial
-- =========================
INSERT INTO inventarios.movimientos_inventario (
    compania_id, sucursal_id, almacen_id, producto_id, tipo_movimiento, cantidad, referencia_tipo, observacion
)
SELECT
    compania_id,
    sucursal_id,
    almacen_id,
    producto_id,
    'ENTRADA_INICIAL',
    cantidad_disponible,
    'SEED_STOCK_INICIAL',
    'Carga inicial de stock para demo'
FROM inventarios.stock_almacen
WHERE compania_id = '11111111-1111-1111-1111-111111111111';

COMMIT;

SELECT 'Seed demo base cargado correctamente' AS resultado;
