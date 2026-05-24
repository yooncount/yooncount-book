CREATE TABLE trading_journal (
    id          BIGSERIAL PRIMARY KEY,
    ticker      VARCHAR(20)    NOT NULL,
    stock_name  VARCHAR(100)   NOT NULL,
    trade_type  VARCHAR(10)    NOT NULL,
    trade_date  DATE           NOT NULL,
    quantity    INTEGER        NOT NULL,
    price       NUMERIC(15, 2) NOT NULL,
    reason      TEXT           NOT NULL,
    strategy    VARCHAR(255),
    reflection  TEXT,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trading_journal_ticker     ON trading_journal (ticker);
CREATE INDEX idx_trading_journal_trade_date ON trading_journal (trade_date DESC);
CREATE INDEX idx_trading_journal_trade_type ON trading_journal (trade_type);
