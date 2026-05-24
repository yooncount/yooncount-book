-- 이전엔 app_setting.value가 평문이었음.
-- 이번 변경으로 AES-GCM 암호화 컬럼이 되어, 기존 평문 값은 더 이상 복호화 불가(=무효).
-- 잔존 평문 행을 모두 삭제. 사용자(특히 Finnhub 키)는 settings에서 다시 입력해야 함.
DELETE FROM app_setting;
