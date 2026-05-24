CREATE TABLE loan (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(100)   NOT NULL,
    lender            VARCHAR(100),
    principal         NUMERIC(15, 2) NOT NULL,
    remaining_balance NUMERIC(15, 2) NOT NULL,
    interest_rate     NUMERIC(5, 2),
    start_date        DATE           NOT NULL,
    end_date          DATE,
    include_in_assets BOOLEAN        NOT NULL DEFAULT FALSE,
    memo              TEXT,
    created_at        TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP      NOT NULL DEFAULT NOW()
);
