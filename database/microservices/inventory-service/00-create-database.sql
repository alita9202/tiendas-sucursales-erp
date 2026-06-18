-- 00-create-database.sql
-- Inventory Service Database
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE inventory_service_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inventory_service_db')\gexec
