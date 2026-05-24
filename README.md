# YoonCount Book

개인 맞춤형 가계부 앱입니다.  
REST API 백엔드(Spring Boot)와 프론트엔드로 구성되어 있습니다.

## 기능

- **거래 관리** — 수입/지출 등록, 수정, 삭제, 목록 조회 (날짜·카테고리·타입 필터)
- **카테고리 관리** — 기본 카테고리 제공, 커스텀 카테고리 추가/삭제
- **월별 통계** — 월별 수입·지출 합계, 카테고리별 지출 분류
- **예산 관리** — 카테고리별 월 예산 설정 및 달성률 조회

## 프로젝트 구조

```
yooncount-book/
├── backend/     # Spring Boot REST API
└── frontend/    # 프론트엔드 (준비 중)
```

## 시작하기

### Docker / Podman으로 실행 (권장)

**사전 요구사항:** Docker 또는 Podman + docker-compose / podman-compose

#### Podman 설치 (macOS)

```bash
# Homebrew로 Podman 설치
brew install podman

# Podman 가상머신 초기화 및 시작
podman machine init
podman machine start

# podman-compose 설치
brew install podman-compose

# 설치 확인
podman --version
podman-compose --version
```

```bash
# 바로 실행 (기본 비밀번호 사용)
docker compose up -d
# 또는 Podman 사용 시
podman-compose up -d
```

DB 비밀번호를 변경하고 싶은 경우에만 `.env` 파일을 생성하세요.

```bash
cp .env.example .env
# .env 파일에서 DB_PASSWORD 값 변경 후 실행
```

실행 후 접속 주소:

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost |
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |

```bash
# 중지
docker compose down

# 데이터까지 삭제할 경우
docker compose down -v
```

---

### 로컬 개발 환경 (직접 실행)

**사전 요구사항:** JDK 21+, PostgreSQL 16+, Maven 3.8+

자세한 내용은 [backend/README.md](backend/README.md)를 참고하세요.

```bash
cd backend
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
# application-local.yml 을 본인 DB 설정에 맞게 수정 후 실행
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

## 기여하기

1. 이 저장소를 Fork 합니다.
2. 새 브랜치를 생성합니다. (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다. (`git commit -m 'feat: 새기능 추가'`)
4. 브랜치에 Push 합니다. (`git push origin feature/새기능`)
5. Pull Request를 생성합니다.

## 라이선스

MIT License — 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
