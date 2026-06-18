-- 00-create-database.sql
-- Sales Service Database
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE sales_service_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sales_service_db')\gexec
