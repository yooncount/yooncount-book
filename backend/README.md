# YoonCount Book — Backend

Spring Boot REST API 서버입니다.

## 기술 스택

- Java 21
- Spring Boot 3.5.3
- Spring Data JPA / Hibernate 6
- PostgreSQL 16+
- Flyway (DB 마이그레이션)
- Maven 3.8+
- SpringDoc OpenAPI (Swagger UI)

## 시작하기

### 1. 데이터베이스 설정 (PostgreSQL)

```bash
psql -U postgres

CREATE DATABASE yooncount_book;
CREATE USER yooncount WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE yooncount_book TO yooncount;
```

### 2. 환경 설정

```bash
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
```

`application-local.yml`을 열어 DB 접속 정보와 Finnhub API 키를 수정합니다.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yooncount_book
    username: yooncount
    password: your_password

finnhub:
  api-key: your_finnhub_api_key  # https://finnhub.io 에서 무료 발급
```

> **Finnhub API 키** — 주식 현재가 조회(`GET /api/investments/quote`) 기능에 필요합니다.  
> 키를 설정하지 않으면 해당 엔드포인트에서 503과 함께 안내 메시지를 반환합니다.  
> 나머지 기능은 키 없이도 모두 정상 동작합니다.

### 3. 빌드 및 실행

```bash
# Maven으로 바로 실행
mvn spring-boot:run -Dspring-boot.run.profiles=local

# 또는 jar 빌드 후 실행
mvn clean package -DskipTests
java -jar target/yooncount-book-*.jar --spring.profiles.active=local
```

### 4. API 문서 확인

서버 실행 후 Swagger UI에서 모든 엔드포인트를 확인할 수 있습니다.

```
http://localhost:8080/swagger-ui/index.html
```

## 주요 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| `GET/POST` | `/api/transactions` | 거래 목록 조회 / 등록 |
| `PUT/DELETE` | `/api/transactions/{id}` | 거래 수정 / 삭제 |
| `GET/POST/DELETE` | `/api/categories` | 카테고리 관리 |
| `GET/POST` | `/api/budgets` | 예산 설정 및 조회 |
| `GET` | `/api/statistics/monthly` | 월별 수입·지출 통계 |
| `GET` | `/api/statistics/annual` | 연간 월별 집계 |
| `GET` | `/api/statistics/trend` | 카테고리별 지출 추이 |
| `GET/POST` | `/api/investments/transactions` | 주식 거래 내역 |
| `GET` | `/api/investments/portfolio` | 포트폴리오 조회 (평균단가·손익) |
| `GET` | `/api/investments/quote` | 주식 현재가 조회 (Finnhub) |
| `GET` | `/api/assets/summary` | 총자산·순자산 요약 |
| `GET/POST/PUT/DELETE` | `/api/journals` | 매매 일지 |
| `GET/POST/PUT/DELETE` | `/api/loans` | 대출 관리 |
| `PATCH` | `/api/loans/{id}/toggle` | 대출 자산 포함 여부 토글 |
| `GET/POST/PUT/DELETE` | `/api/payment-methods` | 결제 수단 관리 |
| `GET` | `/api/payment-methods/stats` | 결제 수단별 지출 통계 |
| `GET/POST/PUT/DELETE` | `/api/recurring` | 정기 지출·수입 관리 |
| `POST` | `/api/recurring/{id}/apply` | 이번 달 거래로 즉시 등록 |
| `GET/POST/PUT/DELETE` | `/api/savings-goals` | 저축 목표 관리 |
| `PATCH` | `/api/savings-goals/{id}/deposit` | 저축액 적립 |
| `GET` | `/api/net-worth/snapshots` | 순자산 추이 조회 |
| `POST` | `/api/net-worth/snapshot` | 현재 순자산 스냅샷 저장 |

## 프로젝트 구조

```
src/main/java/com/yooncount/book/
├── domain/
│   ├── asset/         # 총자산·순자산 요약
│   ├── budget/        # 예산 관리
│   ├── category/      # 카테고리
│   ├── investment/    # 주식 거래, 포트폴리오, Finnhub 현재가
│   ├── journal/       # 매매 일지
│   ├── loan/          # 대출 관리
│   ├── networth/      # 순자산 스냅샷
│   ├── payment/       # 결제 수단
│   ├── recurring/     # 정기 지출·수입
│   ├── savings/       # 저축 목표
│   ├── statistics/    # 월별·연간 통계, 카테고리 추이
│   └── transaction/   # 거래 내역
└── global/
    ├── common/        # ApiResponse 공통 응답 포맷
    ├── config/        # Swagger, Finnhub 설정
    ├── exception/     # 공통 예외 처리
    ├── github/        # GitHub 이슈 연동
    └── logging/       # API 요청·응답 로깅 필터
```

## DB 마이그레이션

Flyway가 앱 시작 시 자동으로 마이그레이션을 적용합니다.

| 버전 | 내용 |
|------|------|
| V1 | category 테이블 + 기본 카테고리 13개 |
| V2 | transactions 테이블 |
| V3 | budget 테이블 |
| V4 | budget 컬럼 타입 수정 (SMALLINT → INTEGER) |
| V5 | stock_transaction 테이블 |
| V6 | trading_journal 테이블 |
| V7 | loan 테이블 |
| V8 | payment_method 테이블 + transactions 컬럼 추가 |
| V9 | recurring_transaction 테이블 |
| V10 | savings_goal 테이블 |
| V11 | net_worth_snapshot 테이블 |
