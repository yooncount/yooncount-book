CREATE TABLE stock_transaction (
    id          BIGSERIAL       PRIMARY KEY,
    ticker      VARCHAR(20)     NOT NULL,
    stock_name  VARCHAR(100)    NOT NULL,
    type        VARCHAR(10)     NOT NULL,
    quantity    INTEGER         NOT NULL,
    price       NUMERIC(15, 2)  NOT NULL,
    fee         NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    traded_at   DATE            NOT NULL,
    memo        VARCHAR(255),
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_tx_ticker ON stock_transaction (ticker);
CREATE INDEX idx_stock_tx_date   ON stock_transaction (traded_at);
