-- 초기 admin 계정 시드 (기존 데이터를 백필할 owner + 관리자 기능 수행)
-- 로그인: admin@admin / admin
-- 최초 로그인 후 즉시 변경 권장 (PUT /api/auth/me/password)
INSERT INTO users (email, password, name, role)
VALUES (
    'admin@admin',
    '$2a$10$vACD.ZmEWIjDmCMaQQGC1evftgUoHZ2C531k4y8tqgY/eB5ZKzqWu',
    'Admin',
    'ADMIN'
);
