INSERT INTO sales (id, branch_id, customer_id, cashier_id, total_amount, status) VALUES 
('e0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333331', 'c0000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555552', 45.00, 'COMPLETED');

INSERT INTO sale_details (sale_id, product_id, product_code, product_name_snapshot, quantity, unit_price_snapshot, subtotal) VALUES 
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'AB-ARR-001', 'Arroz Grano Largo', 2, 8.50, 17.00),
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'LA-LEC-001', 'Leche Entera UHT', 2, 6.50, 13.00),
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000028', 'FV-MAN-001', 'Manzana Roja', 1, 15.00, 15.00);

INSERT INTO payments (sale_id, payment_method, amount, status) VALUES 
('e0000000-0000-0000-0000-000000000001', 'CARD', 45.00, 'COMPLETED');

INSERT INTO receipts (sale_id, receipt_number, tax_id, customer_name, total_amount) VALUES 
('e0000000-0000-0000-0000-000000000001', 'FAC-000001', '1234567', 'Juan Perez', 45.00);

