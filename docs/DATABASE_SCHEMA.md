# 데이터베이스 스키마 설계서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **Database**: Supabase (PostgreSQL 15)
- **ORM**: Supabase Client (JavaScript)
- **Migration Tool**: Supabase CLI

---

## 1. 데이터베이스 개요

### 1.1 설계 원칙

1. **Normalization**: 3NF (Third Normal Form) 준수, 중복 최소화
2. **Performance**: 인덱스를 통한 쿼리 최적화
3. **Security**: Row Level Security (RLS) 기본 활성화
4. **Scalability**: JSONB 활용으로 유연성 확보
5. **Audit Trail**: created_at, updated_at 모든 테이블에 포함

### 1.2 Phase 구분

- **Phase 1**: 데이터베이스 불필요 (로컬 상태 + 캐시만 사용)
- **Phase 2**: 사용자 인증 + 포트폴리오 관리 + 계산 히스토리

---

## 2. ERD (Entity Relationship Diagram)

```
┌─────────────────────┐
│       users         │  (Supabase Auth 자동 생성)
│─────────────────────│
│ id (uuid, PK)       │
│ email               │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│    portfolios       │
│─────────────────────│
│ id (uuid, PK)       │
│ user_id (FK)        │───┐
│ name                │   │
│ description         │   │
│ created_at          │   │
│ updated_at          │   │
└─────────────────────┘   │
                          │ 1:N
                          ▼
                    ┌─────────────────────┐
                    │      holdings       │
                    │─────────────────────│
                    │ id (uuid, PK)       │
                    │ portfolio_id (FK)   │───┐
                    │ ticker              │   │
                    │ shares              │   │
                    │ avg_cost            │   │
                    │ created_at          │   │
                    │ updated_at          │   │
                    └─────────────────────┘   │
                                              │ 1:N
                                              ▼
                                        ┌─────────────────────┐
                                        │    calculations     │
                                        │─────────────────────│
                                        │ id (uuid, PK)       │
                                        │ holding_id (FK)     │
                                        │ ticker              │
                                        │ price               │
                                        │ eps                 │
                                        │ scenarios (jsonb)   │
                                        │ results (jsonb)     │
                                        │ insights (jsonb)    │
                                        │ metadata (jsonb)    │
                                        │ created_at          │
                                        └─────────────────────┘

┌─────────────────────┐
│     watchlist       │
│─────────────────────│
│ id (uuid, PK)       │
│ user_id (FK)        │─────┐ (독립적 관계)
│ ticker              │     │
│ notes               │     │
│ price_alert         │     │
│ margin_alert        │     │
│ created_at          │     │
└─────────────────────┘     │
                            │
            ┌───────────────┘
            │
            ▼
    (users 테이블과 연결)
```

---

## 3. 테이블 상세 정의

### 3.1 users (Supabase Auth 자동 관리)

**설명**: Supabase Auth가 자동으로 생성 및 관리. 직접 수정하지 않음.

```sql
-- Supabase Auth 기본 테이블 (참고용, 직접 생성하지 않음)
-- auth.users
-- id (uuid, PK)
-- email (text, unique)
-- encrypted_password (text)
-- email_confirmed_at (timestamptz)
-- created_at (timestamptz)
-- updated_at (timestamptz)
```

**우리가 사용할 필드**:
- `id`: 사용자 고유 ID (다른 테이블의 FK로 사용)
- `email`: 사용자 이메일

---

### 3.2 portfolios

**설명**: 사용자의 포트폴리오 (여러 개 가능)

```sql
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);

-- RLS Policies
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**TypeScript Interface**:
```typescript
interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

---

### 3.3 holdings

**설명**: 포트폴리오 내 보유 종목

```sql
CREATE TABLE holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  shares NUMERIC(18, 6) NOT NULL CHECK (shares > 0),
  avg_cost NUMERIC(18, 2) NOT NULL CHECK (avg_cost >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Prevent duplicate tickers in same portfolio
  UNIQUE(portfolio_id, ticker)
);

-- Indexes
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_ticker ON holdings(ticker);

-- RLS Policies (inherit from portfolio)
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view holdings in their portfolios"
  ON holdings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
        AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create holdings in their portfolios"
  ON holdings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
        AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update holdings in their portfolios"
  ON holdings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
        AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete holdings in their portfolios"
  ON holdings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
        AND portfolios.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**TypeScript Interface**:
```typescript
interface Holding {
  id: string;
  portfolio_id: string;
  ticker: string;
  shares: number;
  avg_cost: number;
  created_at: string;
  updated_at: string;
}
```

---

### 3.4 calculations

**설명**: 계산 히스토리 (JSONB 활용)

```sql
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  holding_id UUID REFERENCES holdings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  price NUMERIC(18, 2) NOT NULL,
  eps NUMERIC(18, 2) NOT NULL,

  -- Scenarios (JSONB for flexibility)
  scenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {
  --     "type": "conservative",
  --     "growthRate": 5.0,
  --     "intrinsicValue": 620.50,
  --     "marginOfSafety": -29.3,
  --     "rationale": "..."
  --   },
  --   ...
  -- ]

  -- Results (JSONB)
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "conservative": { "margin": -29.3, "recommendation": "overvalued" },
  --   "neutral": { "margin": -15.6, "recommendation": "overvalued" },
  --   "optimistic": { "margin": 2.1, "recommendation": "fairly_valued" }
  -- }

  -- AI Insights (JSONB)
  insights JSONB DEFAULT NULL,
  -- Example:
  -- {
  --   "summary": "...",
  --   "keyFactors": [...],
  --   "risks": [...],
  --   "recommendation": { "action": "wait", ... }
  -- }

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "calculationMethod": "graham_v1",
  --   "dataSource": "fmp_api",
  --   "processingTime": 2847
  -- }

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Either holding_id OR user_id must be set (for guest calculations)
  CONSTRAINT check_holding_or_user CHECK (
    holding_id IS NOT NULL OR user_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_calculations_holding_id ON calculations(holding_id);
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_ticker ON calculations(ticker);
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);

-- JSONB indexes for queries
CREATE INDEX idx_calculations_scenarios ON calculations USING GIN (scenarios);
CREATE INDEX idx_calculations_insights ON calculations USING GIN (insights);

-- RLS Policies
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calculations"
  ON calculations FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM holdings h
      JOIN portfolios p ON p.id = h.portfolio_id
      WHERE h.id = calculations.holding_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create calculations"
  ON calculations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM holdings h
      JOIN portfolios p ON p.id = h.portfolio_id
      WHERE h.id = calculations.holding_id
        AND p.user_id = auth.uid()
    )
  );

-- Delete policy (allow users to delete their calculation history)
CREATE POLICY "Users can delete their own calculations"
  ON calculations FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM holdings h
      JOIN portfolios p ON p.id = h.portfolio_id
      WHERE h.id = calculations.holding_id
        AND p.user_id = auth.uid()
    )
  );
```

**TypeScript Interface**:
```typescript
interface Calculation {
  id: string;
  holding_id?: string;
  user_id?: string;
  ticker: string;
  price: number;
  eps: number;
  scenarios: Scenario[];
  results: {
    conservative: { margin: number; recommendation: string };
    neutral: { margin: number; recommendation: string };
    optimistic: { margin: number; recommendation: string };
  };
  insights?: AIInsights;
  metadata: {
    calculationMethod: 'graham_v1' | 'graham_v2';
    dataSource: 'fmp_api' | 'manual' | 'cache';
    processingTime: number;
  };
  created_at: string;
}
```

---

### 3.5 watchlist

**설명**: 관심 종목 (포트폴리오와 독립적)

```sql
CREATE TABLE watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  notes TEXT,
  price_alert NUMERIC(18, 2),        -- Alert when price reaches this
  margin_alert NUMERIC(5, 2),        -- Alert when margin of safety reaches this
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Prevent duplicate tickers per user
  UNIQUE(user_id, ticker)
);

-- Indexes
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_watchlist_ticker ON watchlist(ticker);

-- RLS Policies
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create watchlist items"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watchlist"
  ON watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their watchlist items"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);
```

**TypeScript Interface**:
```typescript
interface WatchlistItem {
  id: string;
  user_id: string;
  ticker: string;
  notes?: string;
  price_alert?: number;
  margin_alert?: number;
  created_at: string;
}
```

---

## 4. 주요 쿼리 예시

### 4.1 포트폴리오 전체 조회 (with holdings)

```typescript
// src/lib/supabase/queries.ts

export async function getPortfoliosWithHoldings(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      id,
      name,
      description,
      created_at,
      updated_at,
      holdings (
        id,
        ticker,
        shares,
        avg_cost,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

### 4.2 특정 종목의 계산 히스토리

```typescript
export async function getCalculationHistory(
  ticker: string,
  userId: string,
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('ticker', ticker)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

---

### 4.3 포트폴리오 요약 (집계)

```typescript
export async function getPortfolioSummary(portfolioId: string) {
  const { data, error } = await supabase
    .rpc('get_portfolio_summary', { portfolio_id: portfolioId });

  if (error) throw error;
  return data;
}

// SQL Function (create in Supabase)
/*
CREATE OR REPLACE FUNCTION get_portfolio_summary(portfolio_id UUID)
RETURNS TABLE (
  total_value NUMERIC,
  total_cost NUMERIC,
  total_gain_loss NUMERIC,
  total_gain_loss_percent NUMERIC,
  avg_margin_of_safety NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(h.shares * COALESCE(latest_price.price, h.avg_cost)) AS total_value,
    SUM(h.shares * h.avg_cost) AS total_cost,
    SUM(h.shares * (COALESCE(latest_price.price, h.avg_cost) - h.avg_cost)) AS total_gain_loss,
    (SUM(h.shares * (COALESCE(latest_price.price, h.avg_cost) - h.avg_cost)) /
     SUM(h.shares * h.avg_cost) * 100) AS total_gain_loss_percent,
    AVG(latest_calc.margin) AS avg_margin_of_safety
  FROM holdings h
  LEFT JOIN LATERAL (
    SELECT price FROM calculations
    WHERE ticker = h.ticker
    ORDER BY created_at DESC
    LIMIT 1
  ) latest_price ON TRUE
  LEFT JOIN LATERAL (
    SELECT (results->'neutral'->>'margin')::numeric AS margin
    FROM calculations
    WHERE ticker = h.ticker
    ORDER BY created_at DESC
    LIMIT 1
  ) latest_calc ON TRUE
  WHERE h.portfolio_id = portfolio_id;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 5. Migration 전략

### 5.1 초기 마이그레이션

**파일**: `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in order (respecting foreign keys)
-- 1. portfolios
-- 2. holdings
-- 3. calculations
-- 4. watchlist

-- (위의 CREATE TABLE 문들을 순서대로 포함)

-- Create indexes
-- Create RLS policies
-- Create triggers
-- Create functions
```

### 5.2 마이그레이션 실행

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 초기화
supabase init

# 마이그레이션 생성
supabase migration new initial_schema

# 마이그레이션 적용 (로컬)
supabase db push

# Production 적용
supabase db push --db-url postgresql://...
```

### 5.3 롤백 전략

```sql
-- rollback/001_rollback_initial_schema.sql
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS calculations CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS get_portfolio_summary CASCADE;
```

---

## 6. 성능 최적화

### 6.1 인덱스 전략

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| portfolios | `idx_portfolios_user_id` | 사용자별 포트폴리오 조회 |
| holdings | `idx_holdings_portfolio_id` | 포트폴리오별 종목 조회 |
| holdings | `idx_holdings_ticker` | 티커 검색 |
| calculations | `idx_calculations_ticker` | 종목별 히스토리 |
| calculations | `idx_calculations_created_at` | 최신 계산 조회 |
| calculations | GIN on `scenarios` | JSONB 검색 |

### 6.2 쿼리 최적화

```sql
-- EXPLAIN ANALYZE로 쿼리 성능 확인
EXPLAIN ANALYZE
SELECT * FROM calculations
WHERE ticker = 'NVDA'
  AND created_at > NOW() - INTERVAL '3 months'
ORDER BY created_at DESC
LIMIT 50;

-- 필요 시 partial index 추가
CREATE INDEX idx_calculations_recent
  ON calculations(ticker, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '1 year';
```

### 6.3 Connection Pooling

```typescript
// src/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Server-side client with service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose to client
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

---

## 7. 백업 및 복구

### 7.1 자동 백업 (Supabase 기본 제공)

- **Point-in-Time Recovery (PITR)**: 최대 7일 (Pro 플랜)
- **Daily Backups**: 자동으로 매일 백업

### 7.2 수동 백업

```bash
# PostgreSQL dump
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# 복구
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## 8. 보안 체크리스트

- [x] **RLS 활성화**: 모든 테이블에 RLS 정책 적용
- [x] **User Isolation**: 사용자는 자신의 데이터만 접근 가능
- [x] **Cascade Delete**: 사용자 삭제 시 관련 데이터 자동 삭제
- [x] **Input Validation**: CHECK constraints로 데이터 무결성 보장
- [x] **API Key Protection**: Service role key는 서버사이드만 사용
- [x] **SQL Injection Prevention**: Supabase client는 자동 파라미터화

---

## 9. 모니터링

### 9.1 Supabase Dashboard 메트릭

- **Database Size**: 저장 공간 사용량
- **Active Connections**: 동시 연결 수
- **Query Performance**: 느린 쿼리 식별
- **Table Growth**: 테이블별 레코드 증가율

### 9.2 알림 설정

- Database size > 80% of limit
- Active connections > 90% of pool
- Query execution time > 5 seconds

---

## 10. Type Generation (TypeScript)

### 10.1 Supabase Type 생성

```bash
# Supabase CLI로 자동 타입 생성
supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

**생성된 타입 예시**:
```typescript
// src/types/database.ts (auto-generated)

export type Database = {
  public: {
    Tables: {
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other tables
    };
  };
};

// Usage with Supabase client
import { Database } from '@/types/database';

const supabase = createClient<Database>(url, key);

// Now you get full type safety
const { data } = await supabase
  .from('portfolios')
  .select('*')
  .eq('user_id', userId);
// data is typed as Database['public']['Tables']['portfolios']['Row'][]
```

---

## 11. 데이터 시드 (개발/테스트용)

```sql
-- supabase/seed.sql

-- Test user (manually create via Supabase Auth UI or API)
-- user_id: '00000000-0000-0000-0000-000000000001'

-- Sample portfolio
INSERT INTO portfolios (id, user_id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Tech Growth', 'Long-term tech holdings');

-- Sample holdings
INSERT INTO holdings (portfolio_id, ticker, shares, avg_cost) VALUES
  ('11111111-1111-1111-1111-111111111111', 'NVDA', 100, 450.00),
  ('11111111-1111-1111-1111-111111111111', 'AAPL', 200, 150.00),
  ('11111111-1111-1111-1111-111111111111', 'MSFT', 150, 300.00);

-- Sample calculations
INSERT INTO calculations (holding_id, ticker, price, eps, scenarios, results, created_at) VALUES
  (
    (SELECT id FROM holdings WHERE ticker = 'NVDA' LIMIT 1),
    'NVDA',
    877.50,
    25.30,
    '[
      {"type": "conservative", "growthRate": 5.0, "intrinsicValue": 620.50, "marginOfSafety": -29.3},
      {"type": "neutral", "growthRate": 12.5, "intrinsicValue": 741.00, "marginOfSafety": -15.6},
      {"type": "optimistic", "growthRate": 18.0, "intrinsicValue": 895.80, "marginOfSafety": 2.1}
    ]'::jsonb,
    '{
      "conservative": {"margin": -29.3, "recommendation": "overvalued"},
      "neutral": {"margin": -15.6, "recommendation": "overvalued"},
      "optimistic": {"margin": 2.1, "recommendation": "fairly_valued"}
    }'::jsonb,
    NOW() - INTERVAL '1 day'
  );
```

```bash
# 시드 실행
supabase db seed
```

---

## 12. Checklist

### Phase 2 데이터베이스 구현 완료 기준

- [ ] Supabase 프로젝트 생성
- [ ] 마이그레이션 파일 작성
- [ ] 모든 테이블 생성
- [ ] RLS 정책 적용 및 테스트
- [ ] 인덱스 생성
- [ ] Functions & Triggers 구현
- [ ] TypeScript 타입 생성
- [ ] 쿼리 함수 작성 (src/lib/supabase/queries.ts)
- [ ] 시드 데이터 생성
- [ ] 백업 전략 수립

---

**문서 상태**: ✅ Ready for Development (Phase 2)
**다음 단계**: DEVELOPMENT_PLAN.md 참조
