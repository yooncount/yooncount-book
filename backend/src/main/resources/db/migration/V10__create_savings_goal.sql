CREATE TABLE savings_goal (
    id             BIGSERIAL      PRIMARY KEY,
    name           VARCHAR(100)   NOT NULL,
    target_amount  NUMERIC(15, 2) NOT NULL,
    saved_amount   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    target_date    DATE           NOT NULL,
    memo           TEXT,
    is_completed   BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);
