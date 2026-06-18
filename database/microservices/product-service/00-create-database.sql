-- 00-create-database.sql
-- Product Service Database
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE product_service_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'product_service_db')\gexec
