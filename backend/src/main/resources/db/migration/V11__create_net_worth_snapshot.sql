CREATE TABLE net_worth_snapshot (
    id                 BIGSERIAL      PRIMARY KEY,
    snapshot_date      DATE           NOT NULL,
    cash_balance       NUMERIC(15, 2) NOT NULL,
    stock_investment   NUMERIC(15, 2) NOT NULL,
    realized_stock_pnl NUMERIC(15, 2) NOT NULL,
    gross_assets       NUMERIC(15, 2) NOT NULL,
    total_debt         NUMERIC(15, 2) NOT NULL,
    net_assets         NUMERIC(15, 2) NOT NULL,
    memo               TEXT,
    created_at         TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_net_worth_snapshot_date ON net_worth_snapshot (snapshot_date DESC);
