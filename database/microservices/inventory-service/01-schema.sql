-- 01-schema.sql
-- Inventory Service Schema
-- Ejecutar conectado a 'inventory_service_db'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS inventory_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, product_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL,
    product_id UUID NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- IN, OUT, SALE, TRANSFER_IN, TRANSFER_OUT, LOSS
    quantity_change INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_branch_id UUID NOT NULL,
    destination_branch_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_inventory_stock_branch_id ON inventory_stock(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_product_id ON inventory_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_branch_id ON inventory_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_source_branch_id ON inventory_transfers(source_branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_destination_branch_id ON inventory_transfers(destination_branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_inventory_transfer_items_transfer_id ON inventory_transfer_items(transfer_id);
