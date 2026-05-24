# YoonCount Book — Backend

Spring Boot REST API 서버입니다.

## 기술 스택

- Java 21
- Spring Boot 3.3.5
- Spring Data JPA
- MySQL 8.x / PostgreSQL 16.x
- Flyway (DB 마이그레이션)
- Maven

## 시작하기

### 1. 데이터베이스 설정

#### MySQL

```bash
mysql -u root -p

CREATE DATABASE yooncount_book CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yooncount'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON yooncount_book.* TO 'yooncount'@'localhost';
FLUSH PRIVILEGES;
```

#### PostgreSQL

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

`application-local.yml`을 열어 DB 접속 정보를 수정합니다.

### 3. 빌드 및 실행

```bash
# 빌드
mvn clean package -DskipTests

# 실행
java -jar target/yooncount-book-*.jar --spring.profiles.active=local
```

또는 Maven으로 바로 실행:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 4. API 문서 확인

서버 실행 후 아래 URL에서 Swagger UI를 확인할 수 있습니다.

```
http://localhost:8080/swagger-ui/index.html
```

## 주요 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/transactions` | 거래 목록 조회 |
| `POST` | `/api/transactions` | 거래 등록 |
| `PUT` | `/api/transactions/{id}` | 거래 수정 |
| `DELETE` | `/api/transactions/{id}` | 거래 삭제 |
| `GET` | `/api/categories` | 카테고리 목록 |
| `POST` | `/api/categories` | 카테고리 등록 |
| `GET` | `/api/statistics/monthly` | 월별 통계 |
| `GET` | `/api/budgets` | 예산 목록 |
| `POST` | `/api/budgets` | 예산 설정 |

## 프로젝트 구조

```
src/main/java/com/yooncount/book/
├── domain/
│   ├── transaction/   # 거래
│   ├── category/      # 카테고리
│   ├── budget/        # 예산
│   └── statistics/    # 통계
└── global/
    ├── common/        # 공통 응답 포맷
    ├── config/        # Swagger 등 설정
    └── exception/     # 공통 예외 처리
```
