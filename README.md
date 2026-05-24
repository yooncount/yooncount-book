# YoonCount Book

개인 맞춤형 가계부 앱입니다.  
REST API 백엔드(Spring Boot)와 프론트엔드로 구성되어 있습니다.

## 기능

- **거래 관리** — 수입/지출 등록, 수정, 삭제, 목록 조회 (날짜·카테고리·결제 수단 필터)
- **카테고리 관리** — 기본 카테고리 제공, 커스텀 카테고리 추가/삭제
- **결제 수단 관리** — 카드/현금/계좌이체 등록 및 수단별 지출 통계
- **월별·연간 통계** — 수입·지출 합계, 카테고리별 비율, 월별 추이
- **예산 관리** — 카테고리별 월 예산 설정 및 소비율 조회
- **주식 투자** — 매수/매도 거래 기록, 평균단가법 손익 계산, 포트폴리오 조회
- **주식 현재가** — Finnhub API 연동 실시간 주가 조회 (한국·미국 주식)
- **매매 일지** — 매수/매도 이유·전략 기록, 사후 회고 작성
- **총자산·순자산** — 현금 잔액 + 주식 투자금 + 실현 손익 - 대출 잔액
- **대출 관리** — 대출 등록 및 순자산 포함 여부 선택
- **정기 지출·수입** — 월세·구독 등 고정 항목 관리, 이번 달 즉시 반영
- **저축 목표** — 목표 금액·달성률 관리, 목표 달성 시 자동 완료
- **순자산 스냅샷** — 시점별 자산 상태 저장 및 추이 조회

## 프로젝트 구조

```
yooncount-book/
├── backend/     # Spring Boot REST API
└── frontend/    # 프론트엔드 (준비 중)
```

## 시작하기

### Docker / Podman으로 실행 (권장)

**사전 요구사항:** Docker 또는 Podman + docker-compose / podman-compose

```bash
# .env 파일 생성 (DB 비밀번호, Finnhub API 키 설정)
cp .env.example .env
# .env 파일을 열어 값 수정 후 실행
```

```bash
docker compose up -d
# 또는 Podman 사용 시
podman-compose up -d
```

실행 후 접속 주소:

| 서비스 | 주소 |
|--------|------|
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| 프론트엔드 | http://localhost (준비 중) |

```bash
# 중지
docker compose down

# 데이터까지 삭제
docker compose down -v
```

---

### 로컬 개발 환경 (직접 실행)

**사전 요구사항:** JDK 21+, PostgreSQL 16+, Maven 3.8+

자세한 내용은 [backend/README.md](backend/README.md)를 참고하세요.

```bash
cd backend
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
# application-local.yml 을 본인 DB 설정 및 Finnhub API 키에 맞게 수정 후 실행
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

> **Finnhub API 키** — 주식 현재가 조회 기능에 필요합니다. [finnhub.io](https://finnhub.io)에서 무료로 발급받을 수 있습니다.  
> 키를 설정하지 않아도 나머지 기능은 모두 정상 동작합니다.

## 기여하기

1. 이 저장소를 Fork 합니다.
2. 새 브랜치를 생성합니다. (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다. (`git commit -m 'feat: 새기능 추가'`)
4. 브랜치에 Push 합니다. (`git push origin feature/새기능`)
5. Pull Request를 생성합니다.

## 라이선스

MIT License — 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
