-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 05-create-transfer-functions.sql
-- Responsabilidad: Funciones transaccionales para despachar y recibir transferencias de stock
-- Esquema: inventarios
-- =========================================================

-- =========================================================
-- Función: despachar_transferencia
-- Descuenta stock del almacén origen y crea transferencia EN_TRANSITO
-- =========================================================
CREATE OR REPLACE FUNCTION inventarios.despachar_transferencia(
    p_compania_id UUID,
    p_sucursal_origen_id UUID,
    p_almacen_origen_id UUID,
    p_sucursal_destino_id UUID,
    p_almacen_destino_id UUID,
    p_producto_id UUID,
    p_cantidad NUMERIC,
    p_empleado_id UUID DEFAULT NULL,
    p_observacion TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_stock_actual NUMERIC(14,2);
    v_transferencia_id UUID;
BEGIN
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad a transferir debe ser mayor a cero';
    END IF;

    IF p_almacen_origen_id = p_almacen_destino_id THEN
        RAISE EXCEPTION 'El almacén origen y destino no pueden ser el mismo';
    END IF;

    -- Bloqueo de la fila de stock para evitar operaciones simultáneas inconsistentes
    SELECT cantidad_disponible
    INTO v_stock_actual
    FROM inventarios.stock_almacen
    WHERE compania_id = p_compania_id
      AND sucursal_id = p_sucursal_origen_id
      AND almacen_id = p_almacen_origen_id
      AND producto_id = p_producto_id
    FOR UPDATE;

    IF v_stock_actual IS NULL THEN
        RAISE EXCEPTION 'No existe stock registrado para el producto en el almacén origen';
    END IF;

    IF v_stock_actual < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, cantidad solicitada: %', v_stock_actual, p_cantidad;
    END IF;

    -- Crear cabecera de transferencia
    INSERT INTO inventarios.transferencias_stock (
        compania_id,
        sucursal_origen_id,
        almacen_origen_id,
        sucursal_destino_id,
        almacen_destino_id,
        estado,
        observacion,
        creado_por_empleado_id,
        fecha_envio
    ) VALUES (
        p_compania_id,
        p_sucursal_origen_id,
        p_almacen_origen_id,
        p_sucursal_destino_id,
        p_almacen_destino_id,
        'EN_TRANSITO',
        p_observacion,
        p_empleado_id,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_transferencia_id;

    -- Crear detalle
    INSERT INTO inventarios.transferencia_detalles (
        transferencia_id,
        producto_id,
        cantidad
    ) VALUES (
        v_transferencia_id,
        p_producto_id,
        p_cantidad
    );

    -- Descontar stock origen
    UPDATE inventarios.stock_almacen
    SET cantidad_disponible = cantidad_disponible - p_cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE compania_id = p_compania_id
      AND sucursal_id = p_sucursal_origen_id
      AND almacen_id = p_almacen_origen_id
      AND producto_id = p_producto_id;

    -- Registrar kardex salida
    INSERT INTO inventarios.movimientos_inventario (
        compania_id,
        sucursal_id,
        almacen_id,
        producto_id,
        tipo_movimiento,
        cantidad,
        referencia_tipo,
        referencia_id,
        observacion
    ) VALUES (
        p_compania_id,
        p_sucursal_origen_id,
        p_almacen_origen_id,
        p_producto_id,
        'TRANSFERENCIA_SALIDA',
        p_cantidad,
        'TRANSFERENCIA_STOCK',
        v_transferencia_id,
        COALESCE(p_observacion, 'Salida por transferencia de stock')
    );

    RETURN v_transferencia_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- Función: recibir_transferencia
-- Completa transferencia, suma stock destino y registra kardex entrada
-- =========================================================
CREATE OR REPLACE FUNCTION inventarios.recibir_transferencia(
    p_transferencia_id UUID,
    p_empleado_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_transferencia RECORD;
    v_detalle RECORD;
BEGIN
    SELECT *
    INTO v_transferencia
    FROM inventarios.transferencias_stock
    WHERE id = p_transferencia_id
    FOR UPDATE;

    IF v_transferencia.id IS NULL THEN
        RAISE EXCEPTION 'La transferencia no existe';
    END IF;

    IF v_transferencia.estado <> 'EN_TRANSITO' THEN
        RAISE EXCEPTION 'La transferencia no puede recibirse porque está en estado: %', v_transferencia.estado;
    END IF;

    FOR v_detalle IN
        SELECT *
        FROM inventarios.transferencia_detalles
        WHERE transferencia_id = p_transferencia_id
    LOOP
        -- Sumar stock destino. Si no existe fila, se crea.
        INSERT INTO inventarios.stock_almacen (
            compania_id,
            sucursal_id,
            almacen_id,
            producto_id,
            cantidad_disponible,
            cantidad_reservada,
            stock_minimo
        ) VALUES (
            v_transferencia.compania_id,
            v_transferencia.sucursal_destino_id,
            v_transferencia.almacen_destino_id,
            v_detalle.producto_id,
            v_detalle.cantidad,
            0,
            0
        )
        ON CONFLICT (compania_id, sucursal_id, almacen_id, producto_id)
        DO UPDATE SET
            cantidad_disponible = inventarios.stock_almacen.cantidad_disponible + EXCLUDED.cantidad_disponible,
            updated_at = CURRENT_TIMESTAMP;

        -- Registrar kardex entrada
        INSERT INTO inventarios.movimientos_inventario (
            compania_id,
            sucursal_id,
            almacen_id,
            producto_id,
            tipo_movimiento,
            cantidad,
            referencia_tipo,
            referencia_id,
            observacion
        ) VALUES (
            v_transferencia.compania_id,
            v_transferencia.sucursal_destino_id,
            v_transferencia.almacen_destino_id,
            v_detalle.producto_id,
            'TRANSFERENCIA_ENTRADA',
            v_detalle.cantidad,
            'TRANSFERENCIA_STOCK',
            p_transferencia_id,
            'Entrada por recepción de transferencia de stock'
        );
    END LOOP;

    UPDATE inventarios.transferencias_stock
    SET estado = 'COMPLETADA',
        recibido_por_empleado_id = p_empleado_id,
        fecha_recepcion = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_transferencia_id;

    RETURN 'Transferencia recibida correctamente';
END;
$$ LANGUAGE plpgsql;

SELECT 'Funciones de transferencia de stock creadas correctamente' AS resultado;
