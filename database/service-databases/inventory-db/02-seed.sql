-- =========================================================
-- Inventory DB Seed
-- Demo stock for Abuelita Serafina SuperMarket Bolivia S.A.
-- This seed is idempotent and aligned with ProductDB product_id snapshots.
-- =========================================================

-- Clean demo kardex before regenerating initial movements
DELETE FROM inventory_kardex;

-- Initial stock for Branch Central
INSERT INTO inventory_stock (
    branch_id, product_id, product_code, product_name_snapshot, quantity, min_stock
) VALUES
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000001', 'AB-ARR-001', 'Arroz Grano Largo', 100, 20),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000002', 'AB-ACE-001', 'Aceite Vegetal', 50, 10),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000003', 'AB-AZU-001', 'Azucar Blanca', 80, 20),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000004', 'AB-FID-001', 'Fideo Tallarin', 70, 15),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000005', 'AB-HAR-001', 'Harina de Trigo', 65, 15),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000006', 'AB-AVE-001', 'Avena Instantanea', 45, 10),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000007', 'AB-SAL-001', 'Sal Yodada', 90, 20),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000008', 'LA-LEC-001', 'Leche Entera UHT', 200, 50),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000009', 'LA-YOG-001', 'Yogurt Frutado', 75, 20),
('33333333-3333-3333-3333-333333333331', 'a0000000-0000-0000-0000-000000000010', 'LA-QUE-001', 'Queso Edam', 30, 10)

ON CONFLICT (branch_id, product_id) DO UPDATE SET
    product_code = EXCLUDED.product_code,
    product_name_snapshot = EXCLUDED.product_name_snapshot,
    quantity = EXCLUDED.quantity,
    min_stock = EXCLUDED.min_stock,
    last_updated = CURRENT_TIMESTAMP;

-- Initial stock for Branch Zona Norte
INSERT INTO inventory_stock (
    branch_id, product_id, product_code, product_name_snapshot, quantity, min_stock
) VALUES
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000001', 'AB-ARR-001', 'Arroz Grano Largo', 40, 20),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000002', 'AB-ACE-001', 'Aceite Vegetal', 5, 10),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000003', 'AB-AZU-001', 'Azucar Blanca', 18, 20),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000008', 'LA-LEC-001', 'Leche Entera UHT', 60, 50),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000011', 'LA-MAN-001', 'Mantequilla', 22, 10),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000012', 'BE-GAS-001', 'Coca Cola Regular', 150, 30),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000013', 'BE-AGU-001', 'Agua sin Gas', 100, 25),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000014', 'BE-JUG-001', 'Jugo de Naranja', 45, 15),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000015', 'BE-SPR-001', 'Sprite', 80, 20),
('33333333-3333-3333-3333-333333333332', 'a0000000-0000-0000-0000-000000000016', 'LI-DET-001', 'Detergente Polvo', 14, 15)

ON CONFLICT (branch_id, product_id) DO UPDATE SET
    product_code = EXCLUDED.product_code,
    product_name_snapshot = EXCLUDED.product_name_snapshot,
    quantity = EXCLUDED.quantity,
    min_stock = EXCLUDED.min_stock,
    last_updated = CURRENT_TIMESTAMP;

-- Initial stock for Branch La Paz
INSERT INTO inventory_stock (
    branch_id, product_id, product_code, product_name_snapshot, quantity, min_stock
) VALUES
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000017', 'LI-LAV-001', 'Lavandina', 35, 10),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000018', 'LI-ESP-001', 'Esponja Doble', 60, 15),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000019', 'HI-JAB-001', 'Jabon de Tocador', 90, 20),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000020', 'HI-SHA-001', 'Shampoo Reparacion', 25, 10),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000021', 'HI-PAP-001', 'Papel Higienico', 120, 30),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000022', 'PA-MOL-001', 'Pan Molde Blanco', 10, 15),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000023', 'PA-GAL-001', 'Galletas Dulces', 55, 15),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000024', 'PA-MAR-001', 'Marraqueta', 80, 20),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000025', 'CA-POL-001', 'Pollo Entero', 45, 10),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000026', 'CA-MOL-001', 'Carne Molida', 22, 10),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000027', 'CA-MIL-001', 'Milanesa', 9, 10),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000028', 'FV-MAN-001', 'Manzana Roja', 65, 20),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000029', 'FV-PAP-001', 'Papa Holandesa', 100, 30),
('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000030', 'FV-TOM-001', 'Tomate', 55, 20)

ON CONFLICT (branch_id, product_id) DO UPDATE SET
    product_code = EXCLUDED.product_code,
    product_name_snapshot = EXCLUDED.product_name_snapshot,
    quantity = EXCLUDED.quantity,
    min_stock = EXCLUDED.min_stock,
    last_updated = CURRENT_TIMESTAMP;

-- Initial kardex entries for demo stock
INSERT INTO inventory_kardex (
    branch_id, product_id, transaction_type, reference_id, quantity_change, balance_after
)
SELECT
    branch_id,
    product_id,
    'INPUT',
    NULL,
    quantity,
    quantity
FROM inventory_stock;
