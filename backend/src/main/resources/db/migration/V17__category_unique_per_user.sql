-- category.name은 글로벌 UNIQUE였으나 사용자별 분리 후에는 (user_id, name) UNIQUE여야 함
ALTER TABLE category DROP CONSTRAINT uq_category_name;
ALTER TABLE category ADD CONSTRAINT uq_category_user_name UNIQUE (user_id, name);
