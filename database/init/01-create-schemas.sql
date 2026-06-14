-- =========================================================
-- Proyecto: Tiendas Sucursales ERP - Microservicios
-- Archivo: 01-create-schemas.sql
-- Responsabilidad: Crear esquemas base por microservicio
-- Base de datos: erp_main_db
-- =========================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Esquema compartido para datos generales o utilidades comunes
CREATE SCHEMA IF NOT EXISTS shared;

-- Esquema del microservicio de empresas, sucursales y catálogos
CREATE SCHEMA IF NOT EXISTS empresas_catalogos;

-- Esquema del microservicio de inventarios, productos, stock y transferencias
CREATE SCHEMA IF NOT EXISTS inventarios;

-- Esquema del microservicio de ventas, caja y facturación simulada
CREATE SCHEMA IF NOT EXISTS ventas_facturacion;

-- Esquema del microservicio de finanzas, compras, CxC y CxP
CREATE SCHEMA IF NOT EXISTS finanzas;

-- Confirmación visual
SELECT 'Esquemas creados correctamente' AS resultado;
