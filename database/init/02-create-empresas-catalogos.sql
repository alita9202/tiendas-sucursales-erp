-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 02-create-empresas-catalogos.sql
-- Responsabilidad: Crear tablas base de multicompañía y multisucursal
-- Esquema: empresas_catalogos
-- =========================================================

-- Función común para actualizar updated_at
CREATE OR REPLACE FUNCTION shared.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Tabla: companias
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.companias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    razon_social VARCHAR(180),
    nit VARCHAR(30),
    rubro VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_companias_estado CHECK (estado IN ('ACTIVA', 'INACTIVA'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_companias_nit_unique
ON empresas_catalogos.companias(nit)
WHERE nit IS NOT NULL;

DROP TRIGGER IF EXISTS trg_companias_updated_at ON empresas_catalogos.companias;
CREATE TRIGGER trg_companias_updated_at
BEFORE UPDATE ON empresas_catalogos.companias
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: sucursales
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    direccion TEXT,
    telefono VARCHAR(30),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sucursales_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),
    CONSTRAINT chk_sucursales_estado CHECK (estado IN ('ACTIVA', 'INACTIVA'))
);

CREATE INDEX IF NOT EXISTS idx_sucursales_compania
ON empresas_catalogos.sucursales(compania_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sucursales_compania_nombre_unique
ON empresas_catalogos.sucursales(compania_id, nombre);

DROP TRIGGER IF EXISTS trg_sucursales_updated_at ON empresas_catalogos.sucursales;
CREATE TRIGGER trg_sucursales_updated_at
BEFORE UPDATE ON empresas_catalogos.sucursales
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: almacenes
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.almacenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    sucursal_id UUID NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'PRINCIPAL',
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_almacenes_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),
    CONSTRAINT fk_almacenes_sucursal
        FOREIGN KEY (sucursal_id)
        REFERENCES empresas_catalogos.sucursales(id),
    CONSTRAINT chk_almacenes_tipo CHECK (tipo IN ('PRINCIPAL', 'SECUNDARIO', 'TRANSITO')),
    CONSTRAINT chk_almacenes_estado CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE INDEX IF NOT EXISTS idx_almacenes_compania_sucursal
ON empresas_catalogos.almacenes(compania_id, sucursal_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_almacenes_sucursal_nombre_unique
ON empresas_catalogos.almacenes(sucursal_id, nombre);

DROP TRIGGER IF EXISTS trg_almacenes_updated_at ON empresas_catalogos.almacenes;
CREATE TRIGGER trg_almacenes_updated_at
BEFORE UPDATE ON empresas_catalogos.almacenes
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: cajas
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.cajas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    sucursal_id UUID NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cajas_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),
    CONSTRAINT fk_cajas_sucursal
        FOREIGN KEY (sucursal_id)
        REFERENCES empresas_catalogos.sucursales(id),
    CONSTRAINT chk_cajas_estado CHECK (estado IN ('ACTIVA', 'INACTIVA'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cajas_sucursal_codigo_unique
ON empresas_catalogos.cajas(sucursal_id, codigo);

DROP TRIGGER IF EXISTS trg_cajas_updated_at ON empresas_catalogos.cajas;
CREATE TRIGGER trg_cajas_updated_at
BEFORE UPDATE ON empresas_catalogos.cajas
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: empleados
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    sucursal_id UUID,
    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    ci VARCHAR(30),
    cargo VARCHAR(100),
    email VARCHAR(150),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empleados_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),
    CONSTRAINT fk_empleados_sucursal
        FOREIGN KEY (sucursal_id)
        REFERENCES empresas_catalogos.sucursales(id),
    CONSTRAINT chk_empleados_estado CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE INDEX IF NOT EXISTS idx_empleados_compania_sucursal
ON empresas_catalogos.empleados(compania_id, sucursal_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_empleados_compania_ci_unique
ON empresas_catalogos.empleados(compania_id, ci)
WHERE ci IS NOT NULL;

DROP TRIGGER IF EXISTS trg_empleados_updated_at ON empresas_catalogos.empleados;
CREATE TRIGGER trg_empleados_updated_at
BEFORE UPDATE ON empresas_catalogos.empleados
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: clientes
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    nombre_razon_social VARCHAR(180) NOT NULL,
    nit_ci VARCHAR(40),
    telefono VARCHAR(30),
    email VARCHAR(150),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clientes_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),
    CONSTRAINT chk_clientes_estado CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE INDEX IF NOT EXISTS idx_clientes_compania
ON empresas_catalogos.clientes(compania_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_compania_nit_unique
ON empresas_catalogos.clientes(compania_id, nit_ci)
WHERE nit_ci IS NOT NULL;

DROP TRIGGER IF EXISTS trg_clientes_updated_at ON empresas_catalogos.clientes;
CREATE TRIGGER trg_clientes_updated_at
BEFORE UPDATE ON empresas_catalogos.clientes
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

-- =========================
-- Tabla: proveedores
-- =========================
CREATE TABLE IF NOT EXISTS empresas_catalogos.proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compania_id UUID NOT NULL,
    nombre_razon_social VARCHAR(180) NOT NULL,
    nit VARCHAR(40),
    telefono VARCHAR(30),
    email VARCHAR(150),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proveedores_compania
        FOREIGN KEY (compania_id)
        REFERENCES empresas_catalogos.companias(id),
    CONSTRAINT chk_proveedores_estado CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE INDEX IF NOT EXISTS idx_proveedores_compania
ON empresas_catalogos.proveedores(compania_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proveedores_compania_nit_unique
ON empresas_catalogos.proveedores(compania_id, nit)
WHERE nit IS NOT NULL;

DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON empresas_catalogos.proveedores;
CREATE TRIGGER trg_proveedores_updated_at
BEFORE UPDATE ON empresas_catalogos.proveedores
FOR EACH ROW
EXECUTE FUNCTION shared.set_updated_at();

SELECT 'Tablas base de empresas y catálogos creadas correctamente' AS resultado;
