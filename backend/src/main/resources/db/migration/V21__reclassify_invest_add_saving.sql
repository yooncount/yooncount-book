-- '투자' 카테고리를 수입 → 지출로 재분류 (사용자별 모든 행)
-- '저축' 카테고리 신규 추가 (각 사용자가 보유 안 한 경우에만)
-- 기존 거래(transactions)의 type은 그대로 두며, 사용자가 필요 시 직접 정정한다.

UPDATE category SET type = 'EXPENSE' WHERE name = '투자';

INSERT INTO category (user_id, name, type, is_default, created_at, updated_at)
SELECT u.id, '저축', 'EXPENSE', TRUE, NOW(), NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM category c WHERE c.user_id = u.id AND c.name = '저축'
);
