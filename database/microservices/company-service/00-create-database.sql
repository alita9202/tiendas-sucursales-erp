-- 00-create-database.sql
-- Company Service Database
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE company_service_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'company_service_db')\gexec
