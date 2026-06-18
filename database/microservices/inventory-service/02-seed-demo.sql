-- 02-seed-demo.sql
-- Inventory Service Seed Data
-- Ejecutar conectado a 'inventory_service_db'

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
