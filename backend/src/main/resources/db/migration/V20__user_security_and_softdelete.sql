-- 보안 질문/답변(비번 초기화용) 및 soft-delete 컬럼 추가
ALTER TABLE users ADD COLUMN security_question VARCHAR(255);
ALTER TABLE users ADD COLUMN security_answer   VARCHAR(255); -- BCrypt 해시 저장
ALTER TABLE users ADD COLUMN deleted_at        TIMESTAMP;

CREATE INDEX idx_users_deleted_at ON users(deleted_at);
