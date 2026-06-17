-- 04-functions.sql

CREATE OR REPLACE FUNCTION fn_register_sale(
    p_branch_id UUID,
    p_customer_id UUID,
    p_product_id UUID,
    p_quantity INTEGER,
    p_payment_method VARCHAR
) RETURNS TABLE (new_sale_id UUID, receipt_no VARCHAR) AS $$
DECLARE
    v_stock INTEGER;
    v_price DECIMAL;
    v_sale_id UUID;
    v_receipt VARCHAR;
    v_subtotal DECIMAL;
    v_customer_name VARCHAR;
BEGIN
    -- Validar stock
    SELECT quantity INTO v_stock FROM inventory_stock WHERE branch_id = p_branch_id AND product_id = p_product_id;
    IF v_stock IS NULL OR v_stock < p_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente o producto no disponible en la sucursal';
    END IF;

    -- Obtener precio
    SELECT sale_price INTO v_price FROM products WHERE id = p_product_id;
    v_subtotal := v_price * p_quantity;

    -- Generar recibo
    v_receipt := 'REC-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || floor(random()*1000);

    -- Crear venta
    INSERT INTO sales (branch_id, customer_id, receipt_number, payment_method, total_amount)
    VALUES (p_branch_id, p_customer_id, v_receipt, p_payment_method, v_subtotal)
    RETURNING id INTO v_sale_id;

    -- Crear detalle
    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    VALUES (v_sale_id, p_product_id, p_quantity, v_price, v_subtotal);

    -- Descontar stock
    UPDATE inventory_stock SET quantity = quantity - p_quantity WHERE branch_id = p_branch_id AND product_id = p_product_id;

    -- Registrar movimiento
    INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, reference_type, reference_id, notes)
    VALUES (p_branch_id, p_product_id, 'SALE', -p_quantity, v_stock - p_quantity, 'SALE', v_sale_id, 'Venta generada');

    -- Sumar puntos al cliente (1 punto por unidad)
    IF p_customer_id IS NOT NULL THEN
        UPDATE customers SET points = points + p_quantity WHERE id = p_customer_id;
        SELECT full_name INTO v_customer_name FROM customers WHERE id = p_customer_id;
        
        -- Crear notificacion
        INSERT INTO notifications (event_type, customer_id, content)
        VALUES ('SALE_COMPLETED', p_customer_id, 'Gracias por su compra ' || v_customer_name || '. Ha ganado ' || p_quantity || ' puntos.');
    END IF;

    RETURN QUERY SELECT v_sale_id, v_receipt;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_transfer_stock(
    p_source_branch_id UUID,
    p_destination_branch_id UUID,
    p_product_id UUID,
    p_quantity INTEGER
) RETURNS UUID AS $$
DECLARE
    v_source_stock INTEGER;
    v_dest_stock INTEGER;
    v_transfer_id UUID;
BEGIN
    -- Validar stock origen
    SELECT quantity INTO v_source_stock FROM inventory_stock WHERE branch_id = p_source_branch_id AND product_id = p_product_id;
    IF v_source_stock IS NULL OR v_source_stock < p_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente en la sucursal de origen para transferir';
    END IF;

    -- Crear transferencia
    INSERT INTO inventory_transfers (source_branch_id, destination_branch_id, status, completed_at)
    VALUES (p_source_branch_id, p_destination_branch_id, 'COMPLETED', CURRENT_TIMESTAMP)
    RETURNING id INTO v_transfer_id;

    INSERT INTO inventory_transfer_items (transfer_id, product_id, quantity)
    VALUES (v_transfer_id, p_product_id, p_quantity);

    -- Descontar stock origen
    UPDATE inventory_stock SET quantity = quantity - p_quantity WHERE branch_id = p_source_branch_id AND product_id = p_product_id;
    
    -- Aumentar stock destino (upsert por si no existia registro de stock)
    INSERT INTO inventory_stock (branch_id, product_id, quantity)
    VALUES (p_destination_branch_id, p_product_id, p_quantity)
    ON CONFLICT (branch_id, product_id) 
    DO UPDATE SET quantity = inventory_stock.quantity + p_quantity;

    -- Obtener nuevo stock destino para el kardex
    SELECT quantity INTO v_dest_stock FROM inventory_stock WHERE branch_id = p_destination_branch_id AND product_id = p_product_id;

    -- Movimientos
    INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, reference_type, reference_id, notes)
    VALUES (p_source_branch_id, p_product_id, 'TRANSFER_OUT', -p_quantity, v_source_stock - p_quantity, 'TRANSFER', v_transfer_id, 'Transferencia enviada');

    INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, reference_type, reference_id, notes)
    VALUES (p_destination_branch_id, p_product_id, 'TRANSFER_IN', p_quantity, v_dest_stock, 'TRANSFER', v_transfer_id, 'Transferencia recibida');

    -- Notificacion simulada (sin cliente especifico, solo informativo a nivel sistema)
    INSERT INTO notifications (event_type, content)
    VALUES ('TRANSFER_COMPLETED', 'Transferencia completada de ' || p_quantity || ' unidades.');

    RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_inventory_output_loss(
    p_branch_id UUID,
    p_product_id UUID,
    p_quantity INTEGER,
    p_reason TEXT
) RETURNS VOID AS $$
DECLARE
    v_stock INTEGER;
BEGIN
    SELECT quantity INTO v_stock FROM inventory_stock WHERE branch_id = p_branch_id AND product_id = p_product_id;
    IF v_stock IS NULL OR v_stock < p_quantity THEN
        RAISE EXCEPTION 'No se puede dar de baja mas stock del existente';
    END IF;

    UPDATE inventory_stock SET quantity = quantity - p_quantity WHERE branch_id = p_branch_id AND product_id = p_product_id;

    INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, notes)
    VALUES (p_branch_id, p_product_id, 'LOSS', -p_quantity, v_stock - p_quantity, p_reason);
END;
$$ LANGUAGE plpgsql;




