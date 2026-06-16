CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_code VARCHAR(100),
    product_name_snapshot VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 10,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, product_id)
);

CREATE TABLE inventory_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    reference_doc VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_input_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_id UUID REFERENCES inventory_inputs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    cost_price DECIMAL(10,2)
);

CREATE TABLE inventory_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    reason VARCHAR(50), -- e.g., SALE, EXPIRATION, DAMAGE
    reference_doc VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_output_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    output_id UUID REFERENCES inventory_outputs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE TABLE inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_branch_id UUID NOT NULL,
    destination_branch_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_TRANSIT, COMPLETED, CANCELLED
    notes TEXT,
    dispatched_at TIMESTAMP,
    received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transfer_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES inventory_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE TABLE inventory_kardex (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    product_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- INPUT, OUTPUT, TRANSFER_OUT, TRANSFER_IN
    reference_id UUID,
    quantity_change INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_excel_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    file_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    processed_records INTEGER DEFAULT 0,
    error_records INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


