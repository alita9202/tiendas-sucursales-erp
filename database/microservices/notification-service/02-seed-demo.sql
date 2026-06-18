-- 02-seed-demo.sql
-- Notification Service Seed Data
-- Ejecutar conectado a 'notification_service_db'

-- Notification Templates
INSERT INTO notification_templates (id, event_type, template_subject, template_content, channel) VALUES 
('00000000-0000-0000-0000-000000000301', 'SALE_COMPLETED', '¡Gracias por su compra!', 'Gracias por su compra {{customer_name}}. Ha ganado {{points}} puntos.', 'EMAIL'),
('00000000-0000-0000-0000-000000000302', 'TRANSFER_COMPLETED', 'Transferencia completada', 'Se ha completado la transferencia de {{quantity}} unidades.', 'EMAIL'),
('00000000-0000-0000-0000-000000000303', 'POINTS_ASSIGNED', 'Puntos asignados', 'Se han asignado {{points}} puntos a su cuenta.', 'EMAIL'),
('00000000-0000-0000-0000-000000000304', 'STOCK_LOW', 'Stock bajo', 'El producto {{product_name}} tiene stock bajo en la sucursal {{branch_name}}.', 'EMAIL')
ON CONFLICT (event_type) DO NOTHING;
