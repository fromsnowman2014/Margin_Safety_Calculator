# SafetyNet 개발 문서

## 📚 문서 개요

이 폴더에는 **Graham's Margin of Safety Calculator (SafetyNet)** 프로젝트의 모든 개발 문서가 포함되어 있습니다.

총 **9개의 문서** (약 200KB)로 구성되어 있으며, 개발 시작부터 배포까지 모든 단계를 상세히 안내합니다.

---

## 🚀 빠른 시작 가이드

### 처음 시작하는 경우

**반드시 이 순서대로 읽으세요:**

1. **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** ⚠️ **가장 먼저 읽기!**
   - 모든 API 키 및 환경 변수 설정 방법
   - 개발 중 막히지 않도록 사전에 준비해야 할 것들

2. **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)**
   - Phase 1/2 일일 작업 계획
   - 각 단계별 체크리스트 및 완료 기준

3. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - 전체 시스템 아키텍처
   - 기술 스택 및 폴더 구조

그 후 필요에 따라 다른 문서를 참조하세요.

---

## 📖 전체 문서 목록

### 🔧 설정 및 계획 (필수)

#### 1. **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** (45KB)
**목적**: 모든 설정을 단계별로 안내

**언제 읽나요?**
- **Day 1**: GitHub, Vercel 셋업
- **Day 7**: Anthropic API 키
- **Day 10**: Financial Modeling Prep API 키
- **Day 11**: Vercel KV (캐싱)
- **Day 15** (Phase 2): Supabase 설정

**핵심 내용**:
- ⚠️ STOP 지점마다 설정 가이드
- 환경 변수 템플릿
- 검증 방법 및 트러블슈팅
- 예상 소요 시간 (총 1.5시간)

---

#### 2. **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** (26KB)
**목적**: 일일 작업 계획 및 마일스톤

**언제 읽나요?**
- 매일 아침 해당 Day 섹션 확인
- 작업 시작 전 체크리스트 검토

**핵심 내용**:
- **Phase 1** (Day 1-14): MVP 개발
- **Phase 2** (Day 15-42): 고도화
- 7개의 Configuration Checkpoint (⚠️ STOP 지점)
- 우선순위 매트릭스 (Must/Should/Nice to Have)
- 리스크 관리 전략

**특징**:
- 각 작업의 예상 소요 시간 표시
- 완료 기준 명확히 정의
- Configuration Checkpoint마다 CONFIGURATION_GUIDE.md 링크

---

#### 3. **[MOCK_DATA_REGISTRY.md](./MOCK_DATA_REGISTRY.md)** (25KB)
**목적**: Mock data 위치 추적 및 제거 가이드

**언제 읽나요?**
- **Day 10**: FMP API 연동 후 mock 제거
- **Day 14**: Phase 1 배포 전 mock 제거
- **Day 42**: Phase 2 배포 전 seed data 제거

**핵심 내용**:
- 모든 mock data의 파일 경로
- 각 mock의 사용 목적 및 제거 시점
- 제거 스크립트 (`detect-mocks.sh`)
- Test fixtures는 유지 (삭제 금지 목록)

**주요 섹션**:
- Phase 1 Mock Data: Claude/FMP API mocks
- Phase 2 Mock Data: Supabase mocks, Seed data
- 제거 체크리스트

---

### 🏗️ 아키텍처 및 설계 (참조용)

#### 4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (30KB)
**목적**: 시스템 전체 아키텍처

**언제 읽나요?**
- 프로젝트 시작 시 전체 구조 이해
- 새로운 기능 추가 시 참조

**핵심 내용**:
- 시스템 구성도 (Vercel + Supabase + Claude API)
- 폴더 구조 (어떤 파일이 어디에 있는지)
- 데이터 흐름 (신규 종목 분석 플로우)
- 성능 최적화 전략 (캐싱, Rate Limiting)
- 보안 아키텍처 (**환경 변수 관리** 강화됨)

**업데이트 사항**:
- ⚠️ 환경 변수 섹션에 CONFIGURATION_GUIDE.md 링크 추가
- 각 변수의 필요 시점 명시

---

#### 5. **[API_DESIGN.md](./API_DESIGN.md)** (22KB)
**목적**: RESTful API 명세

**언제 읽나요?**
- API Route 구현 시 (Day 7, Day 10)
- Frontend에서 API 호출 시

**핵심 내용**:
- **Phase 1 API**:
  - `POST /api/analyze` - 종목 분석
  - `GET /api/data` - 재무 데이터 조회
- **Phase 2 API**:
  - `/api/portfolio` - 포트폴리오 CRUD
  - `/api/auth` - 인증
- 요청/응답 스키마 (TypeScript interfaces)
- 에러 코드 레퍼런스
- cURL 예시

---

#### 6. **[COMPONENT_DESIGN.md](./COMPONENT_DESIGN.md)** (35KB)
**목적**: React 컴포넌트 설계

**언제 읽나요?**
- UI 컴포넌트 구현 시 (Day 5-9)
- props 인터페이스 확인 필요 시

**핵심 내용**:
- Atomic Design 계층 구조
- **Atoms**: Button, Input, Card, Badge
- **Molecules**: TickerInput, MarginGauge, ScenarioCard
- **Organisms**: CalculatorContainer, ResultsContainer, AIInsightPanel
- 모든 컴포넌트의 TypeScript props 정의
- Zustand 상태 관리 설계
- 반응형 디자인 및 접근성 (a11y)

**특징**:
- 각 컴포넌트의 실제 코드 예시 제공
- 사용 예시 포함

---

#### 7. **[AI_INTEGRATION.md](./AI_INTEGRATION.md)** (26KB)
**목적**: Claude API 통합 전략

**언제 읽나요?**
- Day 7: Claude API 연동 시
- AI 프롬프트 작성/수정 시

**핵심 내용**:
- **3가지 프롬프트 템플릿** (복사 가능):
  1. 데이터 수집 (웹 검색)
  2. 시나리오 생성 (보수적/중립/낙관적)
  3. 투자 인사이트
- API 호출 플로우 (Sequential/Parallel)
- 에러 핸들링 및 Fallback
- 비용 추정 (~$0.06/analysis, ~$60/월)
- 캐싱 전략

---

#### 8. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** (25KB)
**목적**: Supabase PostgreSQL 스키마

**언제 읽나요?**
- **Day 15-16**: Supabase 마이그레이션 실행 시
- DB 쿼리 작성 시

**핵심 내용**:
- ERD (Entity Relationship Diagram)
- 4개 테이블: `portfolios`, `holdings`, `calculations`, `watchlist`
- Row Level Security (RLS) 정책 (사용자 데이터 격리)
- Migration SQL 스크립트
- TypeScript 타입 생성 가이드
- 쿼리 함수 예시

---

#### 9. **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)** (27KB)
**목적**: 테스트 전략 및 방법

**언제 읽나요?**
- Day 3-4: Graham 계산 유닛 테스트 작성 시
- Day 12: 통합 테스트 작성 시
- Phase 2: E2E 테스트 작성 시

**핵심 내용**:
- 테스트 피라미드 (Unit 60%, Integration 30%, E2E 10%)
- Jest + React Testing Library 설정
- **유닛 테스트 예시**:
  - Graham 계산 로직
  - 시나리오 생성
- **Integration 테스트 예시**:
  - API Route 테스트
  - Component 통합 테스트
- **E2E 테스트 예시** (Playwright):
  - 종목 분석 플로우
  - 포트폴리오 관리
- CI/CD 워크플로우 (GitHub Actions)

---

## 🗺️ 문서 활용 로드맵

### Phase 1 (Week 1-2)

```
Day 1
├─ 📖 CONFIGURATION_GUIDE.md (Checkpoint #1)
│  └─ GitHub, Vercel, .env.local 설정
├─ 📖 DEVELOPMENT_PLAN.md (Day 1-2 섹션)
└─ 📖 ARCHITECTURE.md (폴더 구조 참조)

Day 3-4
├─ 📖 DEVELOPMENT_PLAN.md (Day 3-4)
└─ 📖 TESTING_STRATEGY.md (유닛 테스트 작성)

Day 5-6
├─ 📖 DEVELOPMENT_PLAN.md (Day 5-6)
└─ 📖 COMPONENT_DESIGN.md (UI 컴포넌트 구현)

Day 7
├─ ⚠️ CONFIGURATION_GUIDE.md (Checkpoint #2 - Claude API)
├─ 📖 AI_INTEGRATION.md (프롬프트 템플릿)
└─ 📖 MOCK_DATA_REGISTRY.md (mock 확인)

Day 10
├─ ⚠️ CONFIGURATION_GUIDE.md (Checkpoint #3 - FMP API)
├─ 📖 API_DESIGN.md (API 스펙)
└─ 📖 MOCK_DATA_REGISTRY.md (FMP mock 제거)

Day 11
├─ ⚠️ CONFIGURATION_GUIDE.md (Checkpoint #4 - Vercel KV)
└─ 📖 ARCHITECTURE.md (캐싱 전략)

Day 14
├─ ⚠️ CONFIGURATION_GUIDE.md (Checkpoint #5 - 배포 전)
└─ 📖 MOCK_DATA_REGISTRY.md (모든 mock 제거)
```

### Phase 2 (Week 3-6)

```
Day 15
├─ ⚠️ CONFIGURATION_GUIDE.md (Checkpoint #6 - Supabase)
└─ 📖 DATABASE_SCHEMA.md (마이그레이션)

Day 19-21
├─ 📖 API_DESIGN.md (Portfolio API)
└─ 📖 COMPONENT_DESIGN.md (Portfolio UI)

Day 42
├─ ⚠️ CONFIGURATION_GUIDE.md (Checkpoint #7 - Phase 2 배포)
└─ 📖 MOCK_DATA_REGISTRY.md (Seed data 제거)
```

---

## ⚠️ 중요 체크포인트 (STOP 지점)

개발 중 다음 7개 지점에서 **반드시 멈추고** CONFIGURATION_GUIDE.md를 따르세요:

1. **Day 1**: GitHub, Vercel, .env.local 설정
2. **Day 7**: Anthropic API 키 설정
3. **Day 10**: FMP API 키 설정 + FMP mock 제거
4. **Day 11**: Vercel KV 설정
5. **Day 14**: Phase 1 배포 전 mock 제거
6. **Day 15** (Phase 2): Supabase 설정
7. **Day 42** (Phase 2): Phase 2 배포 전 seed data 제거

---

## 🔍 검색 가이드

특정 주제를 찾을 때:

| 찾고 있는 것 | 문서 |
|------------|------|
| API 키 설정 방법 | CONFIGURATION_GUIDE.md |
| 오늘 할 일 | DEVELOPMENT_PLAN.md |
| Mock data 위치 | MOCK_DATA_REGISTRY.md |
| API 엔드포인트 스펙 | API_DESIGN.md |
| 컴포넌트 props 인터페이스 | COMPONENT_DESIGN.md |
| Claude 프롬프트 템플릿 | AI_INTEGRATION.md |
| DB 테이블 스키마 | DATABASE_SCHEMA.md |
| 테스트 작성 방법 | TESTING_STRATEGY.md |
| 폴더 구조 | ARCHITECTURE.md |
| 환경 변수 목록 | ARCHITECTURE.md (섹션 6.1) |

---

## 📝 문서 유지보수

### 문서 업데이트 규칙

- **누가**: 해당 기능을 구현한 개발자
- **언제**: 코드 변경 시 즉시 업데이트
- **어떻게**:
  1. 변경 사항을 문서에 반영
  2. Git commit에 `docs:` prefix 사용
  3. PR에 문서 변경 사항 명시

### 버전 관리

각 문서 상단에 버전 정보가 있습니다:
```
- **버전**: 1.0
- **작성일**: 2026-01-09
```

Major 변경 시 버전 업데이트 필수.

---

## 🔗 외부 참고 자료

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Supabase Guides](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Financial Modeling Prep API](https://site.financialmodelingprep.com/developer/docs/)

---

## 🆘 도움이 필요할 때

1. **설정 관련**: CONFIGURATION_GUIDE.md의 트러블슈팅 섹션
2. **개발 진행**: DEVELOPMENT_PLAN.md의 완료 기준 확인
3. **Mock data**: MOCK_DATA_REGISTRY.md에서 위치 확인
4. **API 오류**: API_DESIGN.md의 에러 코드 레퍼런스
5. **그 외**: 해당 문서의 "참고 링크" 섹션

---

## ✅ 개발 시작 전 최종 체크리스트

- [ ] 모든 문서를 `docs/` 폴더에서 확인
- [ ] CONFIGURATION_GUIDE.md를 끝까지 읽음
- [ ] .env.local.example을 .env.local로 복사
- [ ] GitHub repository 생성 완료
- [ ] Vercel 계정 생성 완료
- [ ] DEVELOPMENT_PLAN.md의 Day 1 체크리스트 확인

**준비되셨나요? DEVELOPMENT_PLAN.md의 Day 1부터 시작하세요! 🚀**

---

**문서 상태**: ✅ Ready for Development
**마지막 업데이트**: 2026-01-09
**총 문서 수**: 9개 (약 200KB)
