-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 03-create-inventarios.sql
-- Responsabilidad: Crear tablas de productos, stock, movimientos y transferencias
-- Esquema: inventarios
-- =========================================================

-- =========================
-- Tabla: productos
-- =========================
CREATE TABLE IF NOT EXISTS inventarios.productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    codigo VARCHAR(60) NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'UNIDAD',
    precio_referencial NUMERIC(12,2) NOT NULL DEFAULT 0,
    requiere_serie BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_productos_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),

    CONSTRAINT chk_productos_estado
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),

    CONSTRAINT chk_productos_precio
        CHECK (precio_referencial >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_compania_codigo_unique
ON inventarios.productos(compania_id, codigo);

CREATE INDEX IF NOT EXISTS idx_productos_compania
ON inventarios.productos(compania_id);

DROP TRIGGER IF EXISTS trg_productos_updated_at ON inventarios.productos;
CREATE TRIGGER trg_productos_updated_at
BEFORE UPDATE ON inventarios.productos
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: stock_almacen
-- Controla el stock real por compania, sucursal, almacen y producto
-- =========================
CREATE TABLE IF NOT EXISTS inventarios.stock_almacen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    sucursal_id UUID NOT NULL,
    almacen_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad_disponible NUMERIC(14,2) NOT NULL DEFAULT 0,
    cantidad_reservada NUMERIC(14,2) NOT NULL DEFAULT 0,
    stock_minimo NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),

    CONSTRAINT fk_stock_sucursal
        FOREIGN KEY (sucursal_id)
        REFERENCES empresas_catalogos.sucursales(id),

    CONSTRAINT fk_stock_almacen
        FOREIGN KEY (almacen_id)
        REFERENCES empresas_catalogos.almacenes(id),

    CONSTRAINT fk_stock_producto
        FOREIGN KEY (producto_id)
        REFERENCES inventarios.productos(id),

    CONSTRAINT chk_stock_cantidades
        CHECK (
            cantidad_disponible >= 0
            AND cantidad_reservada >= 0
            AND stock_minimo >= 0
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_almacen_producto_unique
ON inventarios.stock_almacen(compania_id, sucursal_id, almacen_id, producto_id);

CREATE INDEX IF NOT EXISTS idx_stock_producto
ON inventarios.stock_almacen(producto_id);

CREATE INDEX IF NOT EXISTS idx_stock_sucursal
ON inventarios.stock_almacen(compania_id, sucursal_id);

DROP TRIGGER IF EXISTS trg_stock_almacen_updated_at ON inventarios.stock_almacen;
CREATE TRIGGER trg_stock_almacen_updated_at
BEFORE UPDATE ON inventarios.stock_almacen
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: transferencias_stock
-- Cabecera de transferencia entre sucursales o almacenes
-- =========================
CREATE TABLE IF NOT EXISTS inventarios.transferencias_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    sucursal_origen_id UUID NOT NULL,
    almacen_origen_id UUID NOT NULL,
    sucursal_destino_id UUID NOT NULL,
    almacen_destino_id UUID NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'EN_TRANSITO',
    observacion TEXT,
    creado_por_empleado_id UUID,
    recibido_por_empleado_id UUID,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transferencias_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),

    CONSTRAINT fk_transferencias_sucursal_origen
        FOREIGN KEY (sucursal_origen_id)
        REFERENCES empresas_catalogos.sucursales(id),

    CONSTRAINT fk_transferencias_almacen_origen
        FOREIGN KEY (almacen_origen_id)
        REFERENCES empresas_catalogos.almacenes(id),

    CONSTRAINT fk_transferencias_sucursal_destino
        FOREIGN KEY (sucursal_destino_id)
        REFERENCES empresas_catalogos.sucursales(id),

    CONSTRAINT fk_transferencias_almacen_destino
        FOREIGN KEY (almacen_destino_id)
        REFERENCES empresas_catalogos.almacenes(id),

    CONSTRAINT fk_transferencias_creado_por
        FOREIGN KEY (creado_por_empleado_id)
        REFERENCES empresas_catalogos.empleados(id),

    CONSTRAINT fk_transferencias_recibido_por
        FOREIGN KEY (recibido_por_empleado_id)
        REFERENCES empresas_catalogos.empleados(id),

    CONSTRAINT chk_transferencias_estado
        CHECK (estado IN ('EN_TRANSITO', 'COMPLETADA', 'RECHAZADA', 'CANCELADA')),

    CONSTRAINT chk_transferencias_origen_destino
        CHECK (almacen_origen_id <> almacen_destino_id)
);

CREATE INDEX IF NOT EXISTS idx_transferencias_compania_estado
ON inventarios.transferencias_stock(compania_id, estado);

CREATE INDEX IF NOT EXISTS idx_transferencias_origen
ON inventarios.transferencias_stock(compania_id, sucursal_origen_id);

CREATE INDEX IF NOT EXISTS idx_transferencias_destino
ON inventarios.transferencias_stock(compania_id, sucursal_destino_id);

DROP TRIGGER IF EXISTS trg_transferencias_stock_updated_at ON inventarios.transferencias_stock;
CREATE TRIGGER trg_transferencias_stock_updated_at
BEFORE UPDATE ON inventarios.transferencias_stock
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: transferencia_detalles
-- Productos y cantidades movidas en cada transferencia
-- =========================
CREATE TABLE IF NOT EXISTS inventarios.transferencia_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transferencia_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transferencia_detalles_transferencia
        FOREIGN KEY (transferencia_id)
        REFERENCES inventarios.transferencias_stock(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transferencia_detalles_producto
        FOREIGN KEY (producto_id)
        REFERENCES inventarios.productos(id),

    CONSTRAINT chk_transferencia_detalles_cantidad
        CHECK (cantidad > 0)
);

CREATE INDEX IF NOT EXISTS idx_transferencia_detalles_transferencia
ON inventarios.transferencia_detalles(transferencia_id);

CREATE INDEX IF NOT EXISTS idx_transferencia_detalles_producto
ON inventarios.transferencia_detalles(producto_id);

-- =========================
-- Tabla: movimientos_inventario
-- Kardex / historial de entradas y salidas
-- =========================
CREATE TABLE IF NOT EXISTS inventarios.movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    sucursal_id UUID NOT NULL,
    almacen_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    tipo_movimiento VARCHAR(40) NOT NULL,
    cantidad NUMERIC(14,2) NOT NULL,
    referencia_tipo VARCHAR(60),
    referencia_id UUID,
    observacion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimientos_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),

    CONSTRAINT fk_movimientos_sucursal
        FOREIGN KEY (sucursal_id)
        REFERENCES empresas_catalogos.sucursales(id),

    CONSTRAINT fk_movimientos_almacen
        FOREIGN KEY (almacen_id)
        REFERENCES empresas_catalogos.almacenes(id),

    CONSTRAINT fk_movimientos_producto
        FOREIGN KEY (producto_id)
        REFERENCES inventarios.productos(id),

    CONSTRAINT chk_movimientos_tipo
        CHECK (
            tipo_movimiento IN (
                'ENTRADA_INICIAL',
                'ENTRADA_COMPRA',
                'SALIDA_VENTA',
                'TRANSFERENCIA_SALIDA',
                'TRANSFERENCIA_ENTRADA',
                'AJUSTE_POSITIVO',
                'AJUSTE_NEGATIVO'
            )
        ),

    CONSTRAINT chk_movimientos_cantidad
        CHECK (cantidad > 0)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_compania_fecha
ON inventarios.movimientos_inventario(compania_id, created_at);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto
ON inventarios.movimientos_inventario(producto_id);

CREATE INDEX IF NOT EXISTS idx_movimientos_referencia
ON inventarios.movimientos_inventario(referencia_tipo, referencia_id);

-- =========================
-- Tabla: producto_series
-- Para productos tecnológicos con número de serie único
-- =========================
CREATE TABLE IF NOT EXISTS inventarios.producto_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    numero_serie VARCHAR(120) NOT NULL,
    sucursal_actual_id UUID,
    almacen_actual_id UUID,
    transferencia_actual_id UUID,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_producto_series_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),

    CONSTRAINT fk_producto_series_producto
        FOREIGN KEY (producto_id)
        REFERENCES inventarios.productos(id),

    CONSTRAINT fk_producto_series_sucursal
        FOREIGN KEY (sucursal_actual_id)
        REFERENCES empresas_catalogos.sucursales(id),

    CONSTRAINT fk_producto_series_almacen
        FOREIGN KEY (almacen_actual_id)
        REFERENCES empresas_catalogos.almacenes(id),

    CONSTRAINT fk_producto_series_transferencia
        FOREIGN KEY (transferencia_actual_id)
        REFERENCES inventarios.transferencias_stock(id),

    CONSTRAINT chk_producto_series_estado
        CHECK (estado IN ('DISPONIBLE', 'EN_TRANSITO', 'VENDIDO', 'BAJA'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_producto_series_compania_numero_unique
ON inventarios.producto_series(compania_id, numero_serie);

CREATE INDEX IF NOT EXISTS idx_producto_series_producto
ON inventarios.producto_series(producto_id);

CREATE INDEX IF NOT EXISTS idx_producto_series_estado
ON inventarios.producto_series(compania_id, estado);

DROP TRIGGER IF EXISTS trg_producto_series_updated_at ON inventarios.producto_series;
CREATE TRIGGER trg_producto_series_updated_at
BEFORE UPDATE ON inventarios.producto_series
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

SELECT 'Tablas de inventario, stock y transferencias creadas correctamente' AS resultado;
