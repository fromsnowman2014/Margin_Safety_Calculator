# Mock Data Registry

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **목적**: 모든 mock/test data의 위치 추적 및 제거 가이드

---

## ⚠️ 중요: Mock Data 제거 필수

Mock data는 **개발 및 테스트 용도로만** 사용됩니다.
**Production 배포 전에 반드시 제거**해야 합니다.

이 문서는 모든 mock data의 위치를 추적하여, refactor/optimize 시 정확히 찾아서 제거할 수 있도록 합니다.

---

## 📋 Mock Data 개요

| 카테고리 | 파일/위치 | 목적 | 제거 시점 | 상태 |
|---------|----------|------|----------|------|
| **API Mocks** | `__mocks__/api/` | 테스트용 API 응답 | Phase 1 완료 후 | ⏳ Pending |
| **Test Fixtures** | `__tests__/fixtures/` | 유닛/통합 테스트 데이터 | **유지 (테스트용)** | ✅ Keep |
| **Seed Data** | `supabase/seed.sql` | DB 개발/테스트 데이터 | Phase 2 완료 후 | ⏳ Pending |
| **Example Data** | `src/lib/data/examples.ts` | UI 개발용 예시 데이터 | Phase 1 완료 후 | ⏳ Pending |
| **Mock Services** | `src/lib/**/*.mock.ts` | 서비스 레이어 mock | Phase 별 완료 후 | ⏳ Pending |

---

## 🗂️ Phase 1: Mock Data 상세

### 1.1 API Response Mocks

**위치**: `src/lib/ai/__mocks__/claude.ts`

**목적**: Claude API 호출 없이 개발/테스트

**내용**:
```typescript
// src/lib/ai/__mocks__/claude.ts
export const mockClaudeResponse = {
  scenarios: [
    {
      type: 'conservative',
      growthRate: 5.0,
      rationale: 'Mock conservative scenario for testing',
    },
    {
      type: 'neutral',
      growthRate: 10.0,
      rationale: 'Mock neutral scenario for testing',
    },
    {
      type: 'optimistic',
      growthRate: 15.0,
      rationale: 'Mock optimistic scenario for testing',
    },
  ],
  insights: {
    summary: 'This is a mock AI insight for development purposes.',
    keyFactors: [
      'Mock factor 1',
      'Mock factor 2',
      'Mock factor 3',
    ],
    risks: ['Mock risk 1', 'Mock risk 2'],
    opportunities: ['Mock opportunity 1'],
    recommendation: {
      action: 'wait',
      reasoning: 'Mock reasoning for testing',
      targetPrice: 720.0,
    },
  },
};

export const claude = {
  sendMessage: jest.fn().mockResolvedValue(JSON.stringify(mockClaudeResponse)),
};
```

**사용 위치**:
- `__tests__/api/analyze.test.ts` (Jest mock)
- `src/app/api/analyze/route.ts` (개발 모드 시 fallback)

**제거 방법**:
```bash
# Phase 1 완료 후 실행
rm -rf src/lib/ai/__mocks__/

# 그리고 다음 파일에서 mock import 제거:
# src/app/api/analyze/route.ts
# - Line 3: import { claude } from '@/lib/ai/claude'; (mock 제거, 실제 import만 유지)
```

**제거 시점**: ✅ **Phase 1 Day 14 (배포 직전)**

**검증**:
```bash
# Mock 파일이 없는지 확인
find . -name "*.mock.ts" -o -name "__mocks__"
# 출력: (empty) ← 정상
```

---

### 1.2 Financial Data Mocks

**위치**: `src/lib/data/__mocks__/fmp.ts`

**목적**: FMP API 호출 없이 개발 (API 키 없을 때 사용)

**내용**:
```typescript
// src/lib/data/__mocks__/fmp.ts
export const mockStockData = {
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    currentPrice: 877.50,
    eps: 25.30,
    historicalGrowth: 22.8,
    analystConsensus: 12.5,
    earningsHighlights: 'Mock earnings data for development',
    industryTrends: 'Mock industry trends',
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 185.50,
    eps: 6.15,
    historicalGrowth: 10.5,
    analystConsensus: 8.0,
    earningsHighlights: 'Mock earnings data',
    industryTrends: 'Mock trends',
  },
  // ... 더 많은 종목
};

export const fmpClient = {
  getStockData: jest.fn((ticker: string) => {
    if (mockStockData[ticker]) {
      return Promise.resolve(mockStockData[ticker]);
    }
    return Promise.reject(new Error(`Mock data not found for ${ticker}`));
  }),
};
```

**사용 위치**:
- `src/app/api/analyze/route.ts` (개발 모드 fallback)
- `__tests__/api/analyze.test.ts`

**제거 방법**:
```bash
# Phase 1 Day 10 이후 (FMP API 키 설정 완료 후)
rm -rf src/lib/data/__mocks__/

# src/app/api/analyze/route.ts에서 다음 코드 제거:
# if (process.env.NODE_ENV === 'development' && !process.env.FMP_API_KEY) {
#   const { mockStockData } = await import('@/lib/data/__mocks__/fmp');
#   return mockStockData[ticker];
# }
```

**제거 시점**: ✅ **Phase 1 Day 10 (FMP API 연동 완료 후)**

**주의**: `__tests__/fixtures/stocks.ts`는 유지 (테스트 전용)

---

### 1.3 Example Data (UI Development)

**위치**: `src/lib/data/examples.ts`

**목적**: UI 컴포넌트 개발 시 샘플 데이터 표시

**내용**:
```typescript
// src/lib/data/examples.ts
export const EXAMPLE_ANALYSIS_RESULT = {
  ticker: 'NVDA',
  companyName: 'NVIDIA Corporation',
  currentPrice: 877.50,
  eps: 25.30,
  scenarios: [
    // ... 예시 시나리오
  ],
  insights: {
    // ... 예시 인사이트
  },
};

// ⚠️ 이 데이터는 UI 개발 시에만 사용
// Production에서는 절대 사용 금지
```

**사용 위치**:
- `src/components/results/ResultsContainer.tsx` (개발 모드)
- Storybook stories (있는 경우)

**제거 방법**:
```bash
# Phase 1 Day 14 (배포 직전)
rm src/lib/data/examples.ts

# 그리고 다음 파일들에서 import 제거:
grep -r "from '@/lib/data/examples'" src/
# 각 파일에서:
# - import 문 제거
# - EXAMPLE_ANALYSIS_RESULT 사용 코드 제거
```

**제거 시점**: ✅ **Phase 1 Day 14 (Production 배포 전)**

---

## 🗂️ Phase 2: Mock Data 상세

### 2.1 Database Seed Data

**위치**: `supabase/seed.sql`

**목적**: 개발/테스트용 데이터베이스 초기 데이터

**내용**:
```sql
-- supabase/seed.sql
-- ⚠️ DEVELOPMENT/TEST ONLY - DO NOT USE IN PRODUCTION

-- Test user (manually create via Supabase Auth)
-- user_id: '00000000-0000-0000-0000-000000000001'

-- Sample portfolio
INSERT INTO portfolios (id, user_id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Test Portfolio', 'FOR TESTING ONLY');

-- Sample holdings
INSERT INTO holdings (portfolio_id, ticker, shares, avg_cost) VALUES
  ('11111111-1111-1111-1111-111111111111', 'NVDA', 100, 450.00),
  ('11111111-1111-1111-1111-111111111111', 'AAPL', 200, 150.00);

-- ... 더 많은 seed data
```

**사용 시점**:
- 로컬 개발 환경
- Staging/Preview 환경

**제거 방법**:
```bash
# Phase 2 완료 후
# 1. Production DB에서 seed data 제거
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# 2. 또는 SQL로 수동 삭제
# Supabase Dashboard → SQL Editor에서 실행:
# DELETE FROM calculations WHERE holding_id IN (
#   SELECT id FROM holdings WHERE portfolio_id = '11111111-1111-1111-1111-111111111111'
# );
# DELETE FROM holdings WHERE portfolio_id = '11111111-1111-1111-1111-111111111111';
# DELETE FROM portfolios WHERE id = '11111111-1111-1111-1111-111111111111';

# 3. seed.sql 파일은 유지하되, 주석 추가
echo "-- ⚠️ ARCHIVED - Not for production use" >> supabase/seed.sql
```

**제거 시점**: ✅ **Phase 2 Day 42 (Production 배포 전)**

**주의**: 로컬/Staging 환경에서는 seed data 유지 가능

---

### 2.2 Mock Portfolio Data

**위치**: `src/lib/supabase/__mocks__/queries.ts`

**목적**: Supabase 연결 없이 포트폴리오 UI 개발

**내용**:
```typescript
// src/lib/supabase/__mocks__/queries.ts
export const mockPortfolios = [
  {
    id: 'mock-portfolio-1',
    user_id: 'mock-user-1',
    name: 'Tech Growth',
    description: 'Mock portfolio for UI development',
    holdings: [
      {
        id: 'mock-holding-1',
        ticker: 'NVDA',
        shares: 100,
        avg_cost: 450.00,
      },
      // ...
    ],
  },
];

export const getPortfoliosWithHoldings = jest.fn().mockResolvedValue(mockPortfolios);
```

**사용 위치**:
- `__tests__/app/portfolio/page.test.tsx`
- `src/app/portfolio/page.tsx` (개발 모드 fallback)

**제거 방법**:
```bash
# Phase 2 Day 21 (포트폴리오 CRUD 완료 후)
rm -rf src/lib/supabase/__mocks__/

# src/app/portfolio/page.tsx에서 mock import 제거
```

**제거 시점**: ✅ **Phase 2 Day 21 (포트폴리오 기능 완료 후)**

---

## 🧪 Test Fixtures (유지)

**위치**: `__tests__/fixtures/`

**⚠️ 이 데이터는 삭제하지 마세요 - 테스트 전용**

### 파일 목록

#### `__tests__/fixtures/stocks.ts`
```typescript
export const MOCK_STOCKS = {
  NVDA: { /* ... */ },
  AAPL: { /* ... */ },
  TSLA: { /* ... */ },
};
```
**용도**: 유닛 테스트, 통합 테스트

#### `__tests__/fixtures/scenarios.ts`
```typescript
export const MOCK_SCENARIOS = {
  conservative: { /* ... */ },
  neutral: { /* ... */ },
  optimistic: { /* ... */ },
};
```
**용도**: 계산 로직 테스트

#### `__tests__/fixtures/api-responses.ts`
```typescript
export const MOCK_API_RESPONSES = {
  analyze: { /* ... */ },
  data: { /* ... */ },
};
```
**용도**: API 통합 테스트

**✅ 유지 이유**: CI/CD 파이프라인에서 지속적으로 테스트 실행

---

## 🚀 Mock Data 제거 체크리스트

### Phase 1 배포 전 (Day 14)

```bash
# 1. Mock API 제거
[ ] rm -rf src/lib/ai/__mocks__/
[ ] rm -rf src/lib/data/__mocks__/
[ ] rm src/lib/data/examples.ts

# 2. Mock import 제거 확인
[ ] grep -r "__mocks__" src/app/
[ ] grep -r "examples.ts" src/

# 3. 환경 변수 확인
[ ] ANTHROPIC_API_KEY 설정됨
[ ] FMP_API_KEY 설정됨
[ ] KV_REST_API_URL 설정됨

# 4. Production 빌드 테스트
[ ] npm run build
[ ] npm run start
[ ] 실제 종목으로 테스트 (NVDA, AAPL 등)

# 5. 검증
[ ] 모든 기능이 실제 API로 동작
[ ] Mock data 사용 흔적 없음
```

### Phase 2 배포 전 (Day 42)

```bash
# 1. Mock Supabase 제거
[ ] rm -rf src/lib/supabase/__mocks__/

# 2. Seed data 정리
[ ] Production DB에서 테스트 데이터 삭제
[ ] seed.sql에 ARCHIVED 주석 추가

# 3. 환경 변수 확인
[ ] NEXT_PUBLIC_SUPABASE_URL 설정됨
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 설정됨
[ ] SUPABASE_SERVICE_ROLE_KEY 설정됨 (Production only)

# 4. Production 빌드 테스트
[ ] npm run build
[ ] 회원가입 → 로그인 → 포트폴리오 생성 테스트

# 5. 검증
[ ] 실제 사용자 데이터만 존재
[ ] 테스트 계정 제거
```

---

## 🔍 Mock Data 탐지 스크립트

Production 배포 전에 이 스크립트를 실행하여 남아있는 mock data를 찾으세요.

**파일**: `scripts/detect-mocks.sh`

```bash
#!/bin/bash

echo "🔍 Detecting mock data in codebase..."
echo ""

# 1. Mock 파일 검색
echo "📁 Checking for mock files..."
find src -name "*.mock.ts" -o -name "__mocks__" | while read file; do
  echo "  ❌ Found: $file"
done

# 2. Mock import 검색
echo ""
echo "📦 Checking for mock imports..."
grep -r "from.*__mocks__" src/ --exclude-dir=node_modules | while read line; do
  echo "  ❌ $line"
done

# 3. Example data 검색
echo ""
echo "📋 Checking for example data..."
grep -r "EXAMPLE_\|MOCK_\|TEST_" src/ --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=__tests__ | while read line; do
  echo "  ⚠️  $line"
done

# 4. Development-only code 검색
echo ""
echo "🚧 Checking for dev-only code..."
grep -r "NODE_ENV.*development" src/app/ --include="*.ts" --include="*.tsx" | while read line; do
  echo "  ⚠️  $line"
done

echo ""
echo "✅ Detection complete. Review warnings above."
```

**실행**:
```bash
chmod +x scripts/detect-mocks.sh
./scripts/detect-mocks.sh
```

---

## 📊 Mock Data 사용량 추적

| Week | Mock Files | Mock Imports | Status |
|------|------------|--------------|--------|
| Week 1 | 5 | 12 | 🟡 Development |
| Week 2 | 3 | 8 | 🟡 Development |
| Week 3 | 2 | 5 | 🟢 Reducing |
| Week 4 | 0 | 0 | ✅ Production Ready |

---

## 🔗 관련 문서

- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - 제거 시점 참조
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Test fixtures 관리
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) - API 키 설정

---

**문서 상태**: ✅ Ready for Use
**마지막 업데이트**: 2026-01-09
**다음 리뷰**: Phase 1 Day 14, Phase 2 Day 42
