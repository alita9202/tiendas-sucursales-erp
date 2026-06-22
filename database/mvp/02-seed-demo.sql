-- 02-seed-demo.sql
-- Ejecutar conectado a 'supermarket_mvp_db'

-- UUIDs fijos para idempotencia
-- Companies
INSERT INTO companies (id, name, nit) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Abuelita Serafina SuperMarket Bolivia S.A.', '123456701'),
('c0000000-0000-0000-0000-000000000002', 'OXXO Bolivia', '123456702'),
('c0000000-0000-0000-0000-000000000003', 'Hipermaxi', '123456703'),
('c0000000-0000-0000-0000-000000000004', 'IC Norte', '123456704')
ON CONFLICT (id) DO NOTHING;

-- Branches
INSERT INTO branches (id, company_id, name, city) VALUES 
-- OXXO Bolivia
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Sucursal Prado', 'La Paz'),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Sucursal El Alto', 'El Alto'),
-- Hipermaxi
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Sucursal 1', 'Santa Cruz'),
-- IC Norte
('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Melchor Perez', 'Cochabamba'),
-- Abuelita Serafina
('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Central', 'La Paz'),
('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Zona Sur', 'La Paz')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, code, name, category, brand, unit, sale_price) VALUES 
('a0000000-0000-0000-0000-000000000001', 'PROD-001', 'Producto X', 'Varios', 'Generico', 'Unidad', 10.00),
('a0000000-0000-0000-0000-000000000002', 'PROD-002', 'Leche Pil 980cc', 'Lacteos', 'Pil', 'Bolsa', 18.50),
('a0000000-0000-0000-0000-000000000003', 'PROD-003', 'Mayonesa Cris', 'Salsas', 'Cris', 'Sachet', 2.00),
('a0000000-0000-0000-0000-000000000004', 'PROD-004', 'Arroz', 'Abarrotes', 'Grano de Oro', 'Kilo', 8.00),
('a0000000-0000-0000-0000-000000000005', 'PROD-005', 'Aceite', 'Abarrotes', 'Fino', 'Litro', 15.00),
('a0000000-0000-0000-0000-000000000006', 'PROD-006', 'Azucar', 'Abarrotes', 'Guabira', 'Kilo', 6.00)
ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customers (id, full_name, document_number, phone, points) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Juanito Perez', '1234567', '70012345', 0)
ON CONFLICT (id) DO NOTHING;

-- Initial Inventory Stock
INSERT INTO inventory_stock (branch_id, product_id, quantity, min_stock) VALUES 
-- OXXO Bolivia / Sucursal Prado / Leche Pil 980cc: 100
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 100, 10),
-- OXXO Bolivia / Sucursal El Alto / Leche Pil 980cc: 0
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 0, 5),
-- Hipermaxi / Sucursal 1 / Leche Pil 980cc: 18
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 18, 20),
-- IC Norte / Melchor Perez / Leche Pil 980cc: 85
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 85, 15),
-- Abuelita Serafina / Central / Leche Pil 980cc: 30
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 30, 10),

-- Mayonesa Cris stock suficiente
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 50, 5),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 50, 5),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 50, 5)
ON CONFLICT (branch_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- Registro de movimientos iniciales para el kardex (Opcional, pero bueno para demos)
INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, notes)
SELECT branch_id, product_id, 'IN', quantity, quantity, 'Inventario inicial demo'
FROM inventory_stock
WHERE quantity > 0;





