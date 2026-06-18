-- 00-create-database.sql
-- Customer Service Database
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE customer_service_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'customer_service_db')\gexec
