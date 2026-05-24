CREATE TABLE payment_method (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions
    ADD COLUMN payment_method_id BIGINT REFERENCES payment_method(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_payment_method ON transactions (payment_method_id);
