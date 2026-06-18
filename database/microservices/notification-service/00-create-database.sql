-- 00-create-database.sql
-- Notification Service Database
-- Ejecutar conectado a la base 'postgres' o por defecto

SELECT 'CREATE DATABASE notification_service_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_service_db')\gexec
