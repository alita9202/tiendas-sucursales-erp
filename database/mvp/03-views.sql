-- 03-views.sql

CREATE OR REPLACE VIEW v_inventory_by_branch AS
SELECT 
    c.name AS company_name, 
    b.name AS branch_name, 
    b.city, 
    p.code AS product_code, 
    p.name AS product_name, 
    i.quantity, 
    i.min_stock,
    CASE 
        WHEN i.quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN i.quantity <= i.min_stock THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status
FROM inventory_stock i
JOIN branches b ON i.branch_id = b.id
JOIN companies c ON b.company_id = c.id
JOIN products p ON i.product_id = p.id;

CREATE OR REPLACE VIEW v_inventory_consolidated AS
SELECT 
    p.code AS product_code, 
    p.name AS product_name, 
    SUM(i.quantity) AS total_quantity
FROM inventory_stock i
JOIN products p ON i.product_id = p.id
GROUP BY p.id, p.code, p.name;

CREATE OR REPLACE VIEW v_sales_daily_report AS
SELECT 
    DATE(sale_date) AS sale_date, 
    payment_method, 
    COUNT(*) AS total_sales, 
    SUM(total_amount) AS total_income
FROM sales
WHERE status = 'COMPLETED'
GROUP BY DATE(sale_date), payment_method;

CREATE OR REPLACE VIEW v_sales_detail AS
SELECT 
    s.receipt_number, 
    s.sale_date, 
    c.name AS company_name, 
    b.name AS branch_name, 
    cu.full_name AS customer_name, 
    p.name AS product_name, 
    si.quantity, 
    si.unit_price, 
    si.subtotal, 
    s.payment_method
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN branches b ON s.branch_id = b.id
JOIN companies c ON b.company_id = c.id
LEFT JOIN customers cu ON s.customer_id = cu.id
JOIN products p ON si.product_id = p.id;




