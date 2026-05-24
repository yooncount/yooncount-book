CREATE TABLE transactions (
    id               BIGSERIAL       PRIMARY KEY,
    amount           NUMERIC(15, 2)  NOT NULL,
    type             VARCHAR(20)     NOT NULL,
    category_id      BIGINT          NOT NULL REFERENCES category(id),
    description      VARCHAR(255),
    transaction_date DATE            NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_date     ON transactions (transaction_date);
CREATE INDEX idx_transaction_category ON transactions (category_id);
CREATE INDEX idx_transaction_type     ON transactions (type);
