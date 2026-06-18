-- 01-schema.sql
-- Customer Service Schema
-- Ejecutar conectado a 'customer_service_db'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(100),
    points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    points_change INTEGER DEFAULT 0,
    points_balance INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    discount_code VARCHAR(50) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_history_customer_id ON customer_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_history_event_type ON customer_history(event_type);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_customer_id ON customer_discounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_status ON customer_discounts(status);
