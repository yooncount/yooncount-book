-- 모든 도메인 테이블에 user_id 추가
-- 기존 데이터는 admin@admin 계정으로 백필 후 NOT NULL 강제

DO $$
DECLARE
    admin_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@admin';
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'admin@admin user not found — V14 seed must run before V15';
    END IF;

    -- category
    ALTER TABLE category ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE category SET user_id = %s', admin_id);
    ALTER TABLE category ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_category_user_id ON category(user_id);

    -- transactions
    ALTER TABLE transactions ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE transactions SET user_id = %s', admin_id);
    ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_transactions_user_id ON transactions(user_id);

    -- budget
    ALTER TABLE budget ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE budget SET user_id = %s', admin_id);
    ALTER TABLE budget ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_budget_user_id ON budget(user_id);

    -- stock_transaction
    ALTER TABLE stock_transaction ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE stock_transaction SET user_id = %s', admin_id);
    ALTER TABLE stock_transaction ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_stock_transaction_user_id ON stock_transaction(user_id);

    -- trading_journal
    ALTER TABLE trading_journal ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE trading_journal SET user_id = %s', admin_id);
    ALTER TABLE trading_journal ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_trading_journal_user_id ON trading_journal(user_id);

    -- loan
    ALTER TABLE loan ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE loan SET user_id = %s', admin_id);
    ALTER TABLE loan ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_loan_user_id ON loan(user_id);

    -- payment_method
    ALTER TABLE payment_method ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE payment_method SET user_id = %s', admin_id);
    ALTER TABLE payment_method ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_payment_method_user_id ON payment_method(user_id);

    -- recurring_transaction
    ALTER TABLE recurring_transaction ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE recurring_transaction SET user_id = %s', admin_id);
    ALTER TABLE recurring_transaction ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_recurring_transaction_user_id ON recurring_transaction(user_id);

    -- savings_goal
    ALTER TABLE savings_goal ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE savings_goal SET user_id = %s', admin_id);
    ALTER TABLE savings_goal ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_savings_goal_user_id ON savings_goal(user_id);

    -- net_worth_snapshot
    ALTER TABLE net_worth_snapshot ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE net_worth_snapshot SET user_id = %s', admin_id);
    ALTER TABLE net_worth_snapshot ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX idx_net_worth_snapshot_user_id ON net_worth_snapshot(user_id);
END $$;
