INSERT INTO notification_templates (id, name, type, subject, content) VALUES 
('f0000000-0000-0000-0000-000000000001', 'SaleCompleted', 'EMAIL', 'Comprobante de compra', 'Gracias por tu compra en Serafina. Total: {{total}}'),
('f0000000-0000-0000-0000-000000000002', 'PointsAssigned', 'SMS', NULL, 'Ganaste {{points}} puntos por tu ultima compra en Serafina.'),
('f0000000-0000-0000-0000-000000000003', 'StockLow', 'EMAIL', 'Alerta de Stock Bajo', 'El producto {{product_name}} esta por debajo del stock minimo en la sucursal {{branch_name}}');

-- Simulating a consumed event and sent notification
INSERT INTO consumed_events (event_id, event_type, payload) VALUES 
('d0000000-0000-0000-0000-000000000001', 'SaleCompleted', '{"sale_id": "e0000000-0000-0000-0000-000000000001", "total": 45.00, "customer_id": "c0000000-0000-0000-0000-000000000001"}');

INSERT INTO notifications (customer_id, template_id, type, recipient, subject, content, source_event, status, sent_at) VALUES 
('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'EMAIL', 'juan.perez@email.com', 'Comprobante de compra', 'Gracias por tu compra en Serafina. Total: 45.00', 'SaleCompleted', 'SENT', CURRENT_TIMESTAMP);


