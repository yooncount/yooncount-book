CREATE TABLE recurring_transaction (
    id                BIGSERIAL    PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    type              VARCHAR(20)  NOT NULL,
    category_id       BIGINT       NOT NULL REFERENCES category(id),
    payment_method_id BIGINT       REFERENCES payment_method(id) ON DELETE SET NULL,
    amount            NUMERIC(15, 2) NOT NULL,
    description       VARCHAR(255),
    day_of_month      INTEGER      NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    start_date        DATE         NOT NULL,
    end_date          DATE,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
