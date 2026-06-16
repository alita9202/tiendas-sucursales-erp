INSERT INTO customers (id, first_name, last_name, document_id, email, phone) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Juan', 'Perez', '1234567', 'juan.perez@email.com', '70000001'),
('c0000000-0000-0000-0000-000000000002', 'Maria', 'Gomez', '2345678', 'maria.gomez@email.com', '70000002'),
('c0000000-0000-0000-0000-000000000003', 'Carlos', 'Lopez', '3456789', 'carlos.lopez@email.com', '70000003'),
('c0000000-0000-0000-0000-000000000004', 'Ana', 'Martinez', '4567890', 'ana.martinez@email.com', '70000004'),
('c0000000-0000-0000-0000-000000000005', 'Luis', 'Rodriguez', '5678901', 'luis.rodriguez@email.com', '70000005');

-- Create generic customers 6 to 20
INSERT INTO customers (first_name, last_name, document_id)
SELECT 'Cliente', 'Demo ' || i, '1000' || i
FROM generate_series(6, 20) as i;

INSERT INTO loyalty_accounts (customer_id, points_balance, tier) VALUES 
('c0000000-0000-0000-0000-000000000001', 500, 'SILVER'),
('c0000000-0000-0000-0000-000000000002', 1200, 'GOLD'),
('c0000000-0000-0000-0000-000000000003', 50, 'BRONZE');

INSERT INTO loyalty_movements (loyalty_account_id, movement_type, points, reference_doc)
SELECT id, 'EARN', points_balance, 'INITIAL_BONUS' FROM loyalty_accounts;

INSERT INTO customer_discounts (customer_id, discount_percentage, valid_until) VALUES 
('c0000000-0000-0000-0000-000000000002', 10.00, CURRENT_TIMESTAMP + INTERVAL '30 days');

