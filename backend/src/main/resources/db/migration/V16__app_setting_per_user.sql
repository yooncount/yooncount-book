-- app_setting을 사용자별로 분리
-- 기존 PK였던 key는 (user_id, key) 복합 UNIQUE로 변경, id BIGSERIAL 신규 PK

DO $$
DECLARE
    admin_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@admin';
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'admin@admin user not found';
    END IF;

    ALTER TABLE app_setting ADD COLUMN id BIGSERIAL;
    ALTER TABLE app_setting ADD COLUMN user_id BIGINT REFERENCES users(id);
    EXECUTE format('UPDATE app_setting SET user_id = %s', admin_id);
    ALTER TABLE app_setting ALTER COLUMN user_id SET NOT NULL;

    ALTER TABLE app_setting DROP CONSTRAINT app_setting_pkey;
    ALTER TABLE app_setting ADD PRIMARY KEY (id);
    ALTER TABLE app_setting ADD CONSTRAINT uk_app_setting_user_key UNIQUE (user_id, key);
    CREATE INDEX idx_app_setting_user_id ON app_setting(user_id);
END $$;
