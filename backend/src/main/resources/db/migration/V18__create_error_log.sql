CREATE TABLE error_log (
    id BIGSERIAL PRIMARY KEY,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(10),
    path VARCHAR(500),
    user_id BIGINT REFERENCES users(id),
    message VARCHAR(1000),
    stack_trace TEXT
);

CREATE INDEX idx_error_log_occurred_at ON error_log(occurred_at DESC);
CREATE INDEX idx_error_log_user_id ON error_log(user_id);
