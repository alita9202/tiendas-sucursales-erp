-- 00-create-database.sql
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE supermarket_mvp_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'supermarket_mvp_db')\gexec




