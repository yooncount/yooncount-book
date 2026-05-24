CREATE TABLE budget (
    id          BIGSERIAL       PRIMARY KEY,
    category_id BIGINT          NOT NULL REFERENCES category(id),
    year        SMALLINT        NOT NULL,
    month       SMALLINT        NOT NULL,
    amount      NUMERIC(15, 2)  NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_budget_category_month UNIQUE (category_id, year, month)
);
