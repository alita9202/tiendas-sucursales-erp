CREATE OR REPLACE FUNCTION process_inventory_transfer_dispatch(
    p_transfer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_source_branch UUID;
    v_status VARCHAR;
    v_detail RECORD;
    v_current_stock INTEGER;
BEGIN
    SELECT source_branch_id, status INTO v_source_branch, v_status 
    FROM inventory_transfers WHERE id = p_transfer_id;

    IF v_status != 'PENDING' THEN
        RAISE EXCEPTION 'Transfer is not in PENDING state';
    END IF;

    -- Validate stock for all details before deducting
    FOR v_detail IN SELECT * FROM inventory_transfer_details WHERE transfer_id = p_transfer_id LOOP
        SELECT quantity INTO v_current_stock FROM inventory_stock 
        WHERE branch_id = v_source_branch AND product_id = v_detail.product_id;

        IF v_current_stock IS NULL OR v_current_stock < v_detail.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product % in source branch', v_detail.product_id;
        END IF;
    END LOOP;

    -- Deduct stock and record kardex
    FOR v_detail IN SELECT * FROM inventory_transfer_details WHERE transfer_id = p_transfer_id LOOP
        UPDATE inventory_stock SET quantity = quantity - v_detail.quantity 
        WHERE branch_id = v_source_branch AND product_id = v_detail.product_id
        RETURNING quantity INTO v_current_stock;

        INSERT INTO inventory_kardex (branch_id, product_id, transaction_type, reference_id, quantity_change, balance_after)
        VALUES (v_source_branch, v_detail.product_id, 'TRANSFER_OUT', p_transfer_id, -v_detail.quantity, v_current_stock);
    END LOOP;

    UPDATE inventory_transfers SET status = 'IN_TRANSIT', dispatched_at = CURRENT_TIMESTAMP WHERE id = p_transfer_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_inventory_transfer_receive(
    p_transfer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_dest_branch UUID;
    v_status VARCHAR;
    v_detail RECORD;
    v_current_stock INTEGER;
BEGIN
    SELECT destination_branch_id, status INTO v_dest_branch, v_status 
    FROM inventory_transfers WHERE id = p_transfer_id;

    IF v_status != 'IN_TRANSIT' THEN
        RAISE EXCEPTION 'Transfer is not in IN_TRANSIT state';
    END IF;

    -- Add stock and record kardex
    FOR v_detail IN SELECT * FROM inventory_transfer_details WHERE transfer_id = p_transfer_id LOOP
        -- Upsert stock for destination
        INSERT INTO inventory_stock (branch_id, product_id, quantity)
        VALUES (v_dest_branch, v_detail.product_id, v_detail.quantity)
        ON CONFLICT (branch_id, product_id) DO UPDATE 
        SET quantity = inventory_stock.quantity + v_detail.quantity;

        SELECT quantity INTO v_current_stock FROM inventory_stock 
        WHERE branch_id = v_dest_branch AND product_id = v_detail.product_id;

        INSERT INTO inventory_kardex (branch_id, product_id, transaction_type, reference_id, quantity_change, balance_after)
        VALUES (v_dest_branch, v_detail.product_id, 'TRANSFER_IN', p_transfer_id, v_detail.quantity, v_current_stock);
    END LOOP;

    UPDATE inventory_transfers SET status = 'COMPLETED', received_at = CURRENT_TIMESTAMP WHERE id = p_transfer_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

