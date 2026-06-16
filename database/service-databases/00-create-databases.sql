-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 00-create-databases.sql
-- Responsabilidad: Crear bases independientes por microservicio
-- Nota: Script idempotente usando psql \gexec
-- =========================================================

SELECT 'CREATE DATABASE company_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'company_db')\gexec

SELECT 'CREATE DATABASE auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec

SELECT 'CREATE DATABASE product_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'product_db')\gexec

SELECT 'CREATE DATABASE inventory_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inventory_db')\gexec

SELECT 'CREATE DATABASE sales_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sales_db')\gexec

SELECT 'CREATE DATABASE customer_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'customer_db')\gexec

SELECT 'CREATE DATABASE notification_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_db')\gexec

SELECT datname AS database_name
FROM pg_database
WHERE datname IN (
    'company_db',
    'auth_db',
    'product_db',
    'inventory_db',
    'sales_db',
    'customer_db',
    'notification_db'
)
ORDER BY datname;
