# 개발 계획서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **프로젝트**: Graham's Margin of Safety Calculator (SafetyNet)
- **목표**: Phase 1 (2주), Phase 2 (4주)

---

## 1. 개발 로드맵 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 1: MVP (2 weeks)                    │
│  Goal: 단일 종목 분석 기능 (인증 없음, 로컬 상태 관리)     │
│  Deliverable: 웹사이트 배포 (safetynet-invest.vercel.app)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Phase 2: 고도화 (4 weeks)                  │
│  Goal: 포트폴리오 관리 + 자동 데이터 수집 + 히스토리       │
│  Deliverable: 프로덕션 준비 완료 (사용자 계정, DB 연동)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: MVP (Week 1-2)

### 2.1 목표

**핵심 기능**:
- [x] 티커 입력 (수동/자동 모드)
- [x] Graham 공식 계산 (V1)
- [x] 3가지 시나리오 (Conservative/Neutral/Optimistic)
- [x] AI 인사이트 생성
- [x] 반응형 결과 화면

**비기능 요구사항**:
- [x] Vercel 배포
- [x] Desktop 우선, Mobile 기본 지원
- [x] API 캐싱 (Vercel KV)
- [x] Rate Limiting

---

### 2.2 Week 1: Foundation & Core Logic

#### Day 1-2: 프로젝트 셋업 및 구조 설계

## ⚠️ CONFIGURATION CHECKPOINT #1

**🛑 STOP HERE - 개발 시작 전 필수 설정**

다음 설정을 완료한 후에 코드를 작성하세요:

1. **GitHub Repository 설정** - [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-1-github-repository-설정) 참조
2. **Vercel 계정 및 프로젝트 생성** - [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-1-vercel-계정-및-프로젝트-설정) 참조
3. **.env.local 파일 생성** - [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-1-로컬-환경-변수-설정) 참조

**예상 소요 시간**: 25분

**검증 방법**:
```bash
# Git remote 확인
git remote -v

# Vercel 프로젝트 확인
vercel ls

# 환경 변수 파일 확인
cat .env.local.example
ls .env.local
```

✅ **설정 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **프로젝트 초기화** (1시간)
   ```bash
   npx create-next-app@latest margin-safety-calculator --typescript --tailwind --app
   cd margin-safety-calculator
   npm install zustand zod react-hook-form @anthropic-ai/sdk recharts lucide-react
   npm install -D @types/node
   ```

2. **폴더 구조 생성** (30분)
   ```bash
   mkdir -p src/{app,components,lib,store,types}
   mkdir -p src/components/{calculator,results,charts,insights,layout,ui}
   mkdir -p src/lib/{graham,ai,data,utils}
   ```

3. **환경 변수 설정** (30분)
   - `.env.local.example` 생성
   - Vercel 프로젝트 생성 및 환경 변수 등록

4. **타입 정의** (2시간)
   - `src/types/api.ts` - API 요청/응답 타입
   - `src/types/calculator.ts` - Graham 계산 타입
   - Zod 스키마 작성

5. **기본 레이아웃** (2시간)
   - `src/app/layout.tsx` - Root Layout
   - `src/components/layout/Header.tsx`
   - `src/components/layout/Footer.tsx`
   - `src/components/layout/Disclaimer.tsx`

6. **UI 컴포넌트 (Atoms)** (3시간)
   - Button, Input, Card, Badge 구현
   - Tailwind config 설정 (color system)

**완료 기준**:
- [ ] Next.js 프로젝트 로컬 실행 성공 (`npm run dev`)
- [ ] Header, Footer 렌더링 확인
- [ ] Tailwind CSS 작동 확인
- [ ] Git 첫 커밋 (`feat: initial project setup`)

---

#### Day 3-4: Graham 계산 엔진 구현

**작업 목록**:

1. **Graham 공식 구현** (2시간)
   ```typescript
   // src/lib/graham/calculator.ts

   export function calculateIntrinsicValue(eps: number, growthRate: number): number {
     // V1: IV = EPS × (8.5 + 2g)
     return eps * (8.5 + 2 * growthRate);
   }

   export function calculateMarginOfSafety(
     intrinsicValue: number,
     currentPrice: number
   ): number {
     return ((intrinsicValue - currentPrice) / currentPrice) * 100;
   }

   export function getRecommendation(marginOfSafety: number): string {
     if (marginOfSafety >= 30) return 'undervalued';
     if (marginOfSafety >= 0) return 'fairly_valued';
     return 'overvalued';
   }
   ```

2. **시나리오 생성 로직** (2시간)
   ```typescript
   // src/lib/graham/scenarios.ts

   export function generateScenarios(data: {
     historicalGrowth: number;
     analystConsensus: number;
   }): ScenarioAssumptions[] {
     // Conservative: min(historical * 0.5, 5%)
     // Neutral: analyst consensus or historical average
     // Optimistic: max(historical, analyst high) capped at 25%
   }
   ```

3. **유닛 테스트 작성** (2시간)
   ```typescript
   // __tests__/lib/graham/calculator.test.ts

   describe('calculateIntrinsicValue', () => {
     it('should calculate correctly for NVDA example', () => {
       const eps = 25.30;
       const growthRate = 10.0;
       const result = calculateIntrinsicValue(eps, growthRate);
       expect(result).toBeCloseTo(717.35, 2);
     });
   });
   ```

4. **Integration Test** (1시간)
   - 실제 데이터로 end-to-end 계산 검증

**완료 기준**:
- [ ] 모든 유닛 테스트 통과
- [ ] NVDA 예시로 수동 검증 완료
- [ ] TypeScript 컴파일 에러 없음

---

#### Day 5-6: 기본 UI 구현

**작업 목록**:

1. **Calculator 컴포넌트** (3시간)
   - `TickerInput.tsx`
   - `ManualInputForm.tsx`
   - `CalculateButton.tsx`
   - `CalculatorContainer.tsx` (orchestrator)

2. **Results 컴포넌트 (기본)** (4시간)
   - `StockHeader.tsx` - 티커, 현재가 표시
   - `ScenarioCard.tsx` - 시나리오별 카드
   - `ScenarioTable.tsx` - 비교 테이블
   - `ResultsContainer.tsx` (orchestrator)

3. **상태 관리 (Zustand)** (2시간)
   ```typescript
   // src/store/calculatorStore.ts

   interface CalculatorState {
     currentAnalysis: AnalyzeResponse | null;
     loading: boolean;
     error: string | null;
     setAnalysis: (data: AnalyzeResponse) => void;
     setLoading: (loading: boolean) => void;
     setError: (error: string | null) => void;
     reset: () => void;
   }
   ```

4. **페이지 연결** (1시간)
   - `src/app/page.tsx` - Calculator + Results 통합

**완료 기준**:
- [ ] 티커 입력 폼 동작 확인
- [ ] 수동 입력 모드 전환 동작
- [ ] 로딩 상태 UI 확인
- [ ] 반응형 레이아웃 (Desktop) 확인

---

#### Day 7: Claude API 연동

## ⚠️ CONFIGURATION CHECKPOINT #2

**🛑 STOP HERE - Claude API 통합 전 필수 설정**

**Anthropic API 키 발급 및 설정**:
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-7-anthropic-api-키-설정) 참조
- **예상 소요 시간**: 10분

**검증 방법**:
```bash
node -e "console.log('API Key:', process.env.ANTHROPIC_API_KEY?.slice(0, 15) + '...')"
# 출력: API Key: sk-ant-api03-...
```

**⚠️ 주의**: API 키 없이 개발하려면 mock data 사용 (MOCK_DATA_REGISTRY.md 참조)

✅ **설정 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **Claude Client 구현** (2시간)
   ```typescript
   // src/lib/ai/claude.ts

   export class ClaudeClient {
     async sendMessage(request: ClaudeRequest): Promise<string>
     async sendMessageWithToolUse(request: ClaudeRequest): Promise<{...}>
   }
   ```

2. **프롬프트 템플릿** (2시간)
   - `src/lib/ai/prompts.ts`
   - 데이터 수집, 시나리오 생성, 인사이트 프롬프트

3. **API Route 구현 (기본)** (3시간)
   ```typescript
   // src/app/api/analyze/route.ts

   export async function POST(request: Request) {
     // 1. Parse request
     // 2. Call Claude (or FMP)
     // 3. Calculate Graham values
     // 4. Return response
   }
   ```

4. **에러 핸들링** (1시간)
   - ClaudeAPIError 클래스
   - Fallback 로직

**완료 기준**:
- [ ] `/api/analyze` 엔드포인트 동작 확인
- [ ] Claude API 응답 파싱 성공
- [ ] 에러 시 적절한 fallback

---

### 2.3 Week 2: 완성 및 배포

#### Day 8-9: 고급 UI 컴포넌트

**작업 목록**:

1. **MarginGauge 차트** (3시간)
   - Recharts로 반원형 게이지 구현
   - 색상 그라데이션 (green/yellow/red)

2. **SensitivityHeatmap** (3시간)
   - 성장률별 안전마진 테이블
   - 색상 코딩

3. **CalculationDetails (Collapsible)** (2시간)
   - Accordion 컴포넌트
   - 계산 과정 마크다운 렌더링

4. **AIInsightPanel** (3시간)
   - Summary, Key Factors, Risks, Opportunities
   - RecommendationCard

**완료 기준**:
- [ ] 모든 차트 렌더링 확인
- [ ] 데이터 바인딩 정상 작동
- [ ] 반응형 디자인 (Mobile 기본 지원)

---

#### Day 10: API 통합 완료

## ⚠️ CONFIGURATION CHECKPOINT #3

**🛑 STOP HERE - 자동 데이터 수집 전 필수 설정**

**Financial Modeling Prep API 키 발급 및 설정**:
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-10-financial-modeling-prep-api-설정) 참조
- **예상 소요 시간**: 15분

**검증 방법**:
```bash
curl "https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${FMP_API_KEY}"
# 성공 시: JSON 데이터 반환
```

**Mock Data 제거 (API 키 설정 완료 후)**:
- [MOCK_DATA_REGISTRY.md](./MOCK_DATA_REGISTRY.md#12-financial-data-mocks) 참조
- `src/lib/data/__mocks__/fmp.ts` 제거

✅ **설정 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **Financial Modeling Prep API 연동** (2시간)
   ```typescript
   // src/lib/data/fmp.ts

   export class FMPClient {
     async getStockData(ticker: string): Promise<StockData>
     async getQuote(ticker: string): Promise<Quote>
   }
   ```

2. **Fallback 체인 구현** (2시간)
   - FMP → Claude web search → Manual input
   - 각 단계별 에러 핸들링

3. **AI 인사이트 생성** (3시간)
   - 프롬프트 최적화
   - JSON 파싱 및 검증

**완료 기준**:
- [ ] Auto 모드로 실제 종목 데이터 조회 성공
- [ ] AI 인사이트 생성 및 표시 확인
- [ ] 모든 fallback 시나리오 테스트

---

#### Day 11: 캐싱 및 Rate Limiting

## ⚠️ CONFIGURATION CHECKPOINT #4

**🛑 STOP HERE - 캐싱 구현 전 필수 설정**

**Vercel KV 및 Upstash Rate Limit 설정**:
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-11-vercel-kv-및-rate-limiting-설정) 참조
- **예상 소요 시간**: 20분

**검증 방법**:
```typescript
// 테스트 코드 실행
import { kv } from '@vercel/kv';
await kv.set('test', 'hello');
console.log(await kv.get('test')); // 'hello'
```

✅ **설정 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **Vercel KV 셋업** (1시간)
   ```bash
   npm install @vercel/kv
   # Vercel Dashboard에서 KV 스토어 생성
   ```

2. **캐시 레이어 구현** (2시간)
   ```typescript
   // src/lib/data/cache.ts

   export async function getCachedData<T>(
     key: string,
     fetcher: () => Promise<T>,
     ttl: number
   ): Promise<T>
   ```

3. **Rate Limiting (Upstash)** (2시간)
   ```typescript
   // src/middleware.ts

   import { Ratelimit } from '@upstash/ratelimit';

   const ratelimit = new Ratelimit({
     redis: kv,
     limiter: Ratelimit.slidingWindow(20, '1 h'),
   });
   ```

4. **테스트** (2시간)
   - 캐시 hit/miss 확인
   - Rate limit 초과 시 응답 확인

**완료 기준**:
- [ ] 동일 요청 2회 호출 시 캐시에서 반환
- [ ] 20회 초과 시 429 에러
- [ ] 캐시 TTL 동작 확인

---

#### Day 12: 테스트 및 버그 수정

**작업 목록**:

1. **유닛 테스트 추가** (3시간)
   - Calculator logic
   - API utils
   - 컴포넌트 렌더링

2. **Integration Test** (2시간)
   - E2E 시나리오 (티커 입력 → 결과 표시)

3. **버그 수정** (3시간)
   - Known issues 해결
   - Edge case 처리

**완료 기준**:
- [ ] 모든 테스트 통과
- [ ] Critical bugs 없음
- [ ] TypeScript 에러 없음

---

#### Day 13-14: Vercel 배포 및 문서화

## ⚠️ CONFIGURATION CHECKPOINT #5

**🛑 STOP HERE - Production 배포 전 필수 작업**

**Mock Data 제거**:
- [MOCK_DATA_REGISTRY.md](./MOCK_DATA_REGISTRY.md#-mock-data-제거-체크리스트) 참조
- **예상 소요 시간**: 30분

**제거 대상**:
1. `src/lib/ai/__mocks__/` - Claude API mocks
2. `src/lib/data/__mocks__/` - FMP API mocks
3. `src/lib/data/examples.ts` - Example data

**검증 스크립트 실행**:
```bash
./scripts/detect-mocks.sh
# 출력: "✅ Detection complete. Review warnings above."
# ❌가 없어야 함!
```

**최종 환경 변수 확인**:
```bash
vercel env ls
# 모든 API 키가 설정되어 있는지 확인
```

✅ **Mock data 제거 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **Vercel 배포** (2시간)
   ```bash
   # GitHub 연동
   git remote add origin https://github.com/username/margin-safety-calculator.git
   git push -u origin main

   # Vercel Dashboard에서 Import
   # 환경 변수 설정
   # 도메인 연결 (optional)
   ```

2. **성능 최적화** (3시간)
   - Lighthouse 점수 확인 (목표: >90)
   - Bundle size 최적화
   - Image optimization

3. **README.md 작성** (2시간)
   - 프로젝트 설명
   - 사용 방법
   - 스크린샷
   - API 키 설정 가이드

4. **최종 QA** (3시간)
   - Production 환경 테스트
   - 다양한 종목으로 테스트 (NVDA, AAPL, TSLA, etc.)
   - 모바일 기기 테스트

**완료 기준**:
- [ ] Production URL 접근 가능
- [ ] 모든 기능 정상 작동
- [ ] Lighthouse Performance > 90
- [ ] README.md 완성

---

### 2.4 Phase 1 Deliverables

- [x] **웹사이트**: https://safetynet-invest.vercel.app
- [x] **기능**:
  - 티커 입력 (Auto/Manual 모드)
  - Graham 계산 (3 시나리오)
  - AI 인사이트
  - 민감도 분석
- [x] **성능**:
  - API 응답 < 3초
  - Lighthouse > 90
- [x] **문서**:
  - README.md
  - API 사용법

---

## 3. Phase 2: 고도화 (Week 3-6)

### 3.1 목표

**핵심 기능**:
- [x] 사용자 인증 (Supabase Auth)
- [x] 포트폴리오 관리 (CRUD)
- [x] 자동 데이터 수집
- [x] 계산 히스토리
- [x] Watchlist 기능
- [x] Graham V2 공식
- [x] 포트폴리오 대시보드

---

### 3.2 Week 3: 인증 및 데이터베이스

#### Day 15-16: Supabase 셋업

## ⚠️ CONFIGURATION CHECKPOINT #6 (Phase 2 Start)

**🛑 STOP HERE - Phase 2 시작 전 필수 설정**

**Supabase 프로젝트 생성 및 설정**:
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md#day-15-supabase-프로젝트-설정) 참조
- **예상 소요 시간**: 30분

**설정 항목**:
1. Supabase 프로젝트 생성
2. API 키 복사 및 환경 변수 설정
3. Supabase CLI 설치 및 연결
4. Auth Provider 설정

**검증 방법**:
```bash
# CLI 연결 확인
supabase status

# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
```

✅ **설정 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **Supabase 프로젝트 생성** (1시간)
   - supabase.com에서 프로젝트 생성
   - 환경 변수 등록

2. **데이터베이스 마이그레이션** (4시간)
   - `supabase/migrations/001_initial_schema.sql` 작성
   - 테이블 생성 (portfolios, holdings, calculations, watchlist)
   - RLS 정책 적용

3. **TypeScript 타입 생성** (1시간)
   ```bash
   supabase gen types typescript --project-id <id> > src/types/database.ts
   ```

4. **Supabase Client 설정** (2시간)
   ```typescript
   // src/lib/supabase/client.ts
   // src/lib/supabase/queries.ts
   ```

**완료 기준**:
- [ ] 모든 테이블 생성 확인
- [ ] RLS 정책 테스트 통과
- [ ] TypeScript 타입 생성 완료

---

#### Day 17-18: 인증 UI 구현

**작업 목록**:

1. **Auth 페이지** (4시간)
   - `src/app/auth/login/page.tsx`
   - `src/app/auth/signup/page.tsx`
   - `src/components/auth/AuthForm.tsx`

2. **Auth 로직** (3시간)
   - 회원가입, 로그인, 로그아웃
   - 세션 관리
   - Protected routes (middleware)

3. **Header 업데이트** (2시간)
   - 로그인 상태 표시
   - User menu (Profile, Logout)

**완료 기준**:
- [ ] 회원가입 → 로그인 플로우 동작
- [ ] 세션 유지 확인
- [ ] Protected routes 차단 확인

---

#### Day 19-21: 포트폴리오 CRUD

**작업 목록**:

1. **Portfolio API Routes** (4시간)
   - `GET /api/portfolio`
   - `POST /api/portfolio`
   - `PATCH /api/portfolio/[id]`
   - `DELETE /api/portfolio/[id]`

2. **Holdings API Routes** (4시간)
   - `POST /api/portfolio/[id]/holdings`
   - `PATCH /api/portfolio/[id]/holdings/[holdingId]`
   - `DELETE /api/portfolio/[id]/holdings/[holdingId]`

3. **Portfolio UI** (6시간)
   - `src/app/portfolio/page.tsx` - Dashboard
   - `PortfolioSummary.tsx`
   - `HoldingsTable.tsx`
   - `AddHoldingModal.tsx`

**완료 기준**:
- [ ] 포트폴리오 생성/수정/삭제 동작
- [ ] 종목 추가/수정/삭제 동작
- [ ] 실시간 업데이트 확인

---

### 3.3 Week 4: 자동 데이터 수집 및 Graham V2

#### Day 22-23: FMP API 완전 통합

**작업 목록**:

1. **FMP Client 확장** (3시간)
   - `getFinancials()` - 재무제표
   - `getGrowthMetrics()` - 성장률 계산
   - `getAnalystEstimates()` - 애널리스트 전망

2. **자동 데이터 업데이트** (3시간)
   - 티커 입력 시 자동으로 최신 데이터 가져오기
   - EPS, 성장률 자동 계산

3. **데이터 검증** (2시간)
   - 이상치 감지
   - 데이터 품질 체크

**완료 기준**:
- [ ] Auto 모드 데이터 정확도 검증
- [ ] 10개 이상 종목 테스트

---

#### Day 24-25: Graham V2 공식 구현

**작업 목록**:

1. **FRED API 연동** (2시간)
   ```typescript
   // src/lib/data/fred.ts

   export async function getAAACorporateBondYield(): Promise<number> {
     // FRED API: BAMLC0A4CBBBEY
   }
   ```

2. **Graham V2 계산** (3시간)
   ```typescript
   // V2: IV = [EPS × (8.5 + 2g) × 4.4] / Current AAA Bond Yield

   export function calculateIntrinsicValueV2(
     eps: number,
     growthRate: number,
     bondYield: number
   ): number {
     return (eps * (8.5 + 2 * growthRate) * 4.4) / bondYield;
   }
   ```

3. **UI 토글** (2시간)
   - V1/V2 선택 스위치
   - 결과 비교 표시

**완료 기준**:
- [ ] V2 계산 정확성 검증
- [ ] V1/V2 비교 UI 동작

---

#### Day 26-28: 히스토리 및 Watchlist

**작업 목록**:

1. **계산 히스토리 저장** (3시간)
   - API 수정: 계산 결과를 DB에 저장
   - `calculations` 테이블 활용

2. **히스토리 차트** (4시간)
   - `HistoryChart.tsx` - 시간별 안전마진 변화
   - Recharts Line Chart

3. **Watchlist 기능** (4시간)
   - `src/app/watchlist/page.tsx`
   - 종목 추가/삭제
   - 알림 설정 (가격, 안전마진)

4. **알림 로직** (3시간)
   - 조건 충족 시 이메일 발송 (Supabase Functions)

**완료 기준**:
- [ ] 히스토리 차트 렌더링 확인
- [ ] Watchlist CRUD 동작
- [ ] 알림 트리거 테스트

---

### 3.4 Week 5: 다중 밸류에이션 및 포트폴리오 대시보드

#### Day 29-30: DCF 간편 계산기

**작업 목록**:

1. **DCF 로직** (4시간)
   ```typescript
   // src/lib/valuation/dcf.ts

   export function calculateDCF(params: {
     fcf: number;
     growthRate: number;
     terminalGrowth: number;
     discountRate: number;
     years: number;
   }): number
   ```

2. **DCF UI** (3시간)
   - `DCFCalculator.tsx`
   - 입력 폼 (FCF, 할인율 등)

3. **PER Band 차트** (4시간)
   - 과거 PER 데이터 조회
   - Band 차트 렌더링

**완료 기준**:
- [ ] DCF 계산 정확성 검증
- [ ] PER Band 차트 표시

---

#### Day 31-32: 포트폴리오 대시보드 고도화

**작업 목록**:

1. **포트폴리오 요약 통계** (3시간)
   - Total Value, Gain/Loss
   - Avg Margin of Safety
   - Best/Worst performers

2. **포트폴리오 차트** (3시간)
   - Pie chart (종목별 비중)
   - Performance chart (시간별)

3. **스캔 기능** (3시간)
   - "Scan Portfolio" 버튼
   - 모든 종목의 안전마진 자동 업데이트

**완료 기준**:
- [ ] 대시보드 모든 위젯 표시
- [ ] 스캔 기능 동작 확인

---

#### Day 33-35: 백그라운드 작업 및 알림

**작업 목록**:

1. **Vercel Cron Jobs** (3시간)
   ```typescript
   // src/app/api/cron/update-portfolios/route.ts

   export async function GET() {
     // 모든 사용자의 포트폴리오 업데이트
     // 알림 조건 체크
   }
   ```

2. **이메일 알림** (4시간)
   - Resend API 또는 Supabase Email 사용
   - 템플릿 작성

3. **알림 설정 UI** (3시간)
   - User preferences 페이지
   - 알림 ON/OFF 토글

**완료 기준**:
- [ ] Cron job 실행 확인
- [ ] 이메일 발송 테스트 성공

---

### 3.5 Week 6: 최적화 및 베타 테스트

#### Day 36-37: 성능 최적화

**작업 목록**:

1. **쿼리 최적화** (3시간)
   - Slow query 식별 (EXPLAIN ANALYZE)
   - 인덱스 추가
   - N+1 쿼리 해결

2. **번들 최적화** (3시간)
   - Code splitting
   - Lazy loading
   - Tree shaking

3. **이미지 최적화** (2시간)
   - Next.js Image 컴포넌트 사용
   - WebP 변환

**완료 기준**:
- [ ] Lighthouse Performance > 90
- [ ] Bundle size < 200KB (initial load)

---

#### Day 38-39: 베타 테스트 및 버그 수정

**작업 목록**:

1. **베타 테스터 모집** (1시간)
   - 친구, 동료에게 배포
   - Feedback 폼 생성

2. **버그 수정** (6시간)
   - Critical bugs 우선 해결
   - Minor bugs backlog

3. **UX 개선** (4시간)
   - 테스터 피드백 반영
   - UI polish

**완료 기준**:
- [ ] Critical bugs 없음
- [ ] 베타 테스터 10명 이상 사용

---

#### Day 40-42: 문서화 및 출시

## ⚠️ CONFIGURATION CHECKPOINT #7 (Phase 2 Complete)

**🛑 STOP HERE - Phase 2 Production 배포 전 필수 작업**

**Mock Data 및 Seed Data 제거**:
- [MOCK_DATA_REGISTRY.md](./MOCK_DATA_REGISTRY.md#phase-2-배포-전-day-42) 참조
- **예상 소요 시간**: 45분

**제거 대상**:
1. `src/lib/supabase/__mocks__/` - Supabase mocks
2. Production DB의 seed data (테스트 사용자 및 포트폴리오)
3. `supabase/seed.sql`에 ARCHIVED 주석 추가

**Seed Data 정리**:
```bash
# Production DB 접속 후 테스트 데이터 삭제
# Supabase Dashboard → SQL Editor에서 실행
DELETE FROM calculations WHERE holding_id IN (
  SELECT id FROM holdings WHERE portfolio_id IN (
    SELECT id FROM portfolios WHERE user_id = '00000000-0000-0000-0000-000000000001'
  )
);
DELETE FROM holdings WHERE portfolio_id IN (
  SELECT id FROM portfolios WHERE user_id = '00000000-0000-0000-0000-000000000001'
);
DELETE FROM portfolios WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

**검증 스크립트 실행**:
```bash
./scripts/detect-mocks.sh
# 출력: "✅ Detection complete. Review warnings above."
```

**최종 DB 확인**:
```bash
# Supabase Dashboard → Table Editor
# 실제 사용자 데이터만 존재하는지 확인
```

✅ **Mock data 제거 완료 후 아래 작업 진행**

---

**작업 목록**:

1. **사용자 가이드** (3시간)
   - Onboarding tutorial
   - Help 페이지

2. **API 문서** (2시간)
   - Public API (추후 확장용)

3. **블로그 포스트** (3시간)
   - 출시 발표
   - How it works 설명

4. **최종 배포** (2시간)
   - Production 환경 점검
   - 모니터링 설정

**완료 기준**:
- [ ] 모든 문서 완성
- [ ] Production 배포 완료
- [ ] 모니터링 대시보드 설정

---

## 4. 우선순위 매트릭스

### 4.1 Must Have (P0)

| Feature | Phase | 이유 |
|---------|-------|------|
| Graham 계산 (V1) | 1 | 핵심 기능 |
| 3 시나리오 | 1 | 핵심 가치 제안 |
| AI 인사이트 | 1 | 차별화 요소 |
| 티커 입력 | 1 | 기본 UX |
| 사용자 인증 | 2 | 포트폴리오 관리 전제 |
| 포트폴리오 CRUD | 2 | Phase 2 핵심 |

### 4.2 Should Have (P1)

| Feature | Phase | 이유 |
|---------|-------|------|
| 민감도 분석 | 1 | 사용자 가치 증가 |
| 캐싱 | 1 | 성능 및 비용 |
| Graham V2 | 2 | 고급 기능 |
| 히스토리 추적 | 2 | 데이터 활용도 |
| Watchlist | 2 | 편의성 |

### 4.3 Nice to Have (P2)

| Feature | Phase | 이유 |
|---------|-------|------|
| DCF 계산기 | 2 | 추가 밸류에이션 |
| PER Band | 2 | 시각화 강화 |
| 이메일 알림 | 2 | 자동화 |
| 다국어 (한글) | 3 (미래) | 시장 확대 |

---

## 5. 리스크 관리

### 5.1 기술적 리스크

| 리스크 | 발생 가능성 | 영향도 | 완화 전략 |
|-------|-----------|--------|----------|
| Claude API 비용 초과 | 중 | 중 | 캐싱, Usage limit |
| FMP API Rate Limit | 중 | 중 | Fallback to manual |
| Supabase 성능 이슈 | 낮 | 중 | 인덱싱, 쿼리 최적화 |
| Vercel 배포 실패 | 낮 | 높 | Staging 환경 테스트 |

### 5.2 스케줄 리스크

| 리스크 | 발생 가능성 | 영향도 | 완화 전략 |
|-------|-----------|--------|----------|
| Phase 1 지연 | 중 | 높 | P2 기능 제거 (민감도 분석) |
| AI 통합 복잡도 | 중 | 중 | 프롬프트 단순화 |
| 디자인 변경 요구 | 중 | 낮 | MVP 디자인 고수 |

---

## 6. Success Metrics

### 6.1 Phase 1 완료 기준

- [ ] 배포 URL 접근 가능
- [ ] 10개 종목 테스트 성공
- [ ] API 응답 시간 < 3초
- [ ] Lighthouse > 90
- [ ] Critical bugs = 0

### 6.2 Phase 2 완료 기준

- [ ] 사용자 등록 및 로그인 성공
- [ ] 포트폴리오 CRUD 동작
- [ ] 히스토리 차트 표시
- [ ] 자동 데이터 수집 성공률 > 90%
- [ ] 베타 테스터 10명 이상

---

## 7. Checklist Summary

### Phase 1 Checklist (Week 1-2)

**Week 1**:
- [ ] Day 1-2: 프로젝트 셋업 완료
- [ ] Day 3-4: Graham 엔진 구현 및 테스트
- [ ] Day 5-6: 기본 UI 구현
- [ ] Day 7: Claude API 연동

**Week 2**:
- [ ] Day 8-9: 고급 UI (차트, 인사이트)
- [ ] Day 10: API 통합 완료
- [ ] Day 11: 캐싱 및 Rate Limiting
- [ ] Day 12: 테스트 및 버그 수정
- [ ] Day 13-14: Vercel 배포 및 문서화

### Phase 2 Checklist (Week 3-6)

**Week 3**:
- [ ] Day 15-16: Supabase 셋업
- [ ] Day 17-18: 인증 UI
- [ ] Day 19-21: 포트폴리오 CRUD

**Week 4**:
- [ ] Day 22-23: FMP API 완전 통합
- [ ] Day 24-25: Graham V2
- [ ] Day 26-28: 히스토리 및 Watchlist

**Week 5**:
- [ ] Day 29-30: DCF 계산기
- [ ] Day 31-32: 포트폴리오 대시보드
- [ ] Day 33-35: 백그라운드 작업

**Week 6**:
- [ ] Day 36-37: 성능 최적화
- [ ] Day 38-39: 베타 테스트
- [ ] Day 40-42: 문서화 및 출시

---

## 8. 다음 단계 (Phase 3 - 미래)

### 잠재적 확장 기능

1. **모바일 앱** (React Native)
   - iOS/Android 네이티브 앱
   - 푸시 알림

2. **소셜 기능**
   - 포트폴리오 공유 (익명화)
   - 커뮤니티 인사이트

3. **백테스팅**
   - 과거 시점으로 계산
   - 전략 검증

4. **Pro 버전**
   - 무제한 포트폴리오
   - 고급 밸류에이션 (DCF 상세)
   - API 액세스

5. **AI 어드바이저 채팅**
   - 대화형 분석
   - Follow-up 질문

---

**문서 상태**: ✅ Ready for Development
**다음 단계**: 개발 시작! TESTING_STRATEGY.md 참조
