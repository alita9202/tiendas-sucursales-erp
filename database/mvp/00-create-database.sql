-- 00-create-database.sql
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE erp_main_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'erp_main_db')\gexec




