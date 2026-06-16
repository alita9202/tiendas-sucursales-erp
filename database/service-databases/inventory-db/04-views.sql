CREATE VIEW v_inventory_balance AS
SELECT 
    branch_id,
    product_id,
    product_code,
    product_name_snapshot,
    quantity,
    min_stock,
    CASE 
        WHEN quantity <= min_stock THEN 'LOW_STOCK'
        ELSE 'NORMAL'
    END AS stock_status,
    last_updated
FROM inventory_stock;

CREATE VIEW v_inventory_kardex_history AS
SELECT 
    k.branch_id,
    k.product_id,
    s.product_code,
    s.product_name_snapshot,
    k.transaction_type,
    k.quantity_change,
    k.balance_after,
    k.created_at
FROM inventory_kardex k
LEFT JOIN inventory_stock s ON k.product_id = s.product_id AND k.branch_id = s.branch_id
ORDER BY k.created_at DESC;

