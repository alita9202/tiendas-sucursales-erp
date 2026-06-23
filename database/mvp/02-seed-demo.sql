-- 02-seed-demo.sql
-- Ejecutar conectado a 'erp_main_db'

-- UUIDs fijos para idempotencia
-- Companies
INSERT INTO companies (id, name, nit) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Supermercado Dona Serafina', '123456701'),
('c0000000-0000-0000-0000-000000000002', 'Sucursales Secundarias', '123456702')
ON CONFLICT (id) DO NOTHING;

-- Branches
INSERT INTO branches (id, company_id, name, city) VALUES 
-- Supermercado Dona Serafina
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Sucursal Central', 'La Paz'),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Zona Norte', 'Cochabamba'),
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Zona Sur', 'La Paz'),
('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'El Alto', 'El Alto')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, code, name, category, brand, unit, sale_price) VALUES 
('a0000000-0000-0000-0000-000000000001', 'PROD-001', 'Papel Higienico', 'Limpieza', 'Scott', 'Paquete', 10.00),
('a0000000-0000-0000-0000-000000000002', 'PROD-002', 'Leche Pil 980cc', 'Lácteos', 'Pil', 'Bolsa', 18.50),
('a0000000-0000-0000-0000-000000000003', 'PROD-003', 'Mayonesa Cris', 'Abarrotes', 'Cris', 'Sachet', 2.00),
('a0000000-0000-0000-0000-000000000004', 'PROD-004', 'Arroz Grano de Oro', 'Abarrotes', 'Grano de Oro', 'Kilo', 8.00),
('a0000000-0000-0000-0000-000000000005', 'PROD-005', 'Aceite Fino', 'Abarrotes', 'Fino', 'Litro', 15.00),
('a0000000-0000-0000-0000-000000000006', 'PROD-006', 'Azucar', 'Abarrotes', 'Guabirá', 'Kilo', 6.00),
('a0000000-0000-0000-0000-000000000007', 'PROD-007', 'Pan Molde', 'Panadería', 'San Gabriel', 'Unidad', 12.00),
('a0000000-0000-0000-0000-000000000008', 'PROD-008', 'Yogurt Pil', 'Lácteos', 'Pil', 'Litro', 14.00),
('a0000000-0000-0000-0000-000000000009', 'PROD-009', 'Harina', 'Abarrotes', 'Princesa', 'Kilo', 7.00),
('a0000000-0000-0000-0000-000000000010', 'PROD-010', 'Fideo', 'Abarrotes', 'Lazzaroni', 'Bolsa', 5.50),
('a0000000-0000-0000-0000-000000000011', 'PROD-011', 'Detergente', 'Limpieza', 'Omo', 'Kilo', 22.00),
('a0000000-0000-0000-0000-000000000012', 'PROD-012', 'Jabon', 'Cuidado Personal', 'Rexona', 'Unidad', 5.00),
('a0000000-0000-0000-0000-000000000013', 'PROD-013', 'Galletas', 'Abarrotes', 'Mabel', 'Paquete', 4.00),
('a0000000-0000-0000-0000-000000000014', 'PROD-014', 'Refresco', 'Bebidas', 'Coca Cola', 'Botella', 13.00)
ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customers (id, full_name, document_number, phone, points) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Juan Pérez', '1234567', '70012345', 0),
('c0000000-0000-0000-0000-000000000002', 'María López', '7654321', '70054321', 0),
('c0000000-0000-0000-0000-000000000003', 'Cliente Final', '0', '0', 0)
ON CONFLICT (id) DO NOTHING;

-- Initial Inventory Stock
INSERT INTO inventory_stock (branch_id, product_id, quantity, min_stock) VALUES 
-- Sucursal Central
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 80, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 120, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 60, 5),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 150, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 90, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 100, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 40, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 70, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', 85, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 110, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000011', 50, 10),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000012', 75, 10),
-- Zona Norte
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 20, 5),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 30, 5),
-- Zona Sur
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 18, 20),
-- El Alto
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 85, 15)
ON CONFLICT (branch_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- Registro de movimientos iniciales para el kardex
INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, notes)
SELECT branch_id, product_id, 'IN', quantity, quantity, 'Inventario inicial demo Dona Serafina'
FROM inventory_stock
WHERE quantity > 0;
