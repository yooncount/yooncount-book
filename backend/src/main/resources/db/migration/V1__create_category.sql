CREATE TABLE category (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(50)  NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    is_default BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_name UNIQUE (name)
);

INSERT INTO category (name, type, is_default) VALUES
    ('식비',   'EXPENSE', TRUE),
    ('교통',   'EXPENSE', TRUE),
    ('주거',   'EXPENSE', TRUE),
    ('의료',   'EXPENSE', TRUE),
    ('여가',   'EXPENSE', TRUE),
    ('쇼핑',   'EXPENSE', TRUE),
    ('통신',   'EXPENSE', TRUE),
    ('교육',   'EXPENSE', TRUE),
    ('기타지출', 'EXPENSE', TRUE),
    ('급여',   'INCOME',  TRUE),
    ('부수입', 'INCOME',  TRUE),
    ('투자',   'INCOME',  TRUE),
    ('기타수입', 'INCOME',  TRUE);
