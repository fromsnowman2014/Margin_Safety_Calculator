# 시스템 아키텍처 설계서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **대상 제품**: Graham's Margin of Safety Calculator (SafetyNet)
- **배포 환경**: Vercel (Serverless)
- **데이터베이스**: Supabase (PostgreSQL)

---

## 1. 아키텍처 개요

### 1.1 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js 14 App (React 18 + TypeScript)               │ │
│  │  - App Router                                          │ │
│  │  - Tailwind CSS + Recharts                            │ │
│  │  - Zustand (State Management)                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js API Routes (Serverless Functions)            │ │
│  │  - /api/analyze (POST)   - Graham calculation         │ │
│  │  - /api/data (GET)       - Fetch financial data       │ │
│  │  - /api/insights (POST)  - AI analysis                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Vercel KV (Redis) - Response Caching                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Upstash Rate Limit - API Protection                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Supabase   │    │  Claude API  │    │  FMP API     │
│  PostgreSQL  │    │  (Anthropic) │    │ (Financial)  │
│              │    │              │    │              │
│ - Users      │    │ - Web Search │    │ - Stock Data │
│ - Portfolios │    │ - Insights   │    │ - EPS/Price  │
│ - Holdings   │    │ - Scenarios  │    │ - Financials │
│ - Calcs      │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 1.2 아키텍처 원칙

1. **Serverless-First**: Vercel의 Edge Functions 활용, 자동 스케일링
2. **API-Driven**: Frontend와 Backend 명확히 분리
3. **Cache-Heavy**: 외부 API 호출 최소화 (비용 절감)
4. **Progressive Enhancement**: Phase 1 → Phase 2로 점진적 확장
5. **Security by Default**: API 키 환경변수 관리, Rate Limiting

---

## 2. 기술 스택 상세

### 2.1 Frontend Stack

| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|-----------|
| **Framework** | Next.js | 14.x (App Router) | - Vercel 최적화<br>- React Server Components<br>- Built-in API Routes |
| **Language** | TypeScript | 5.x | - 타입 안정성<br>- IDE 지원 우수 |
| **Styling** | Tailwind CSS | 3.x | - Utility-first<br>- Vercel과 완벽 호환 |
| **Charts** | Recharts | 2.x | - React 친화적<br>- TypeScript 지원<br>- Responsive |
| **State** | Zustand | 4.x | - 간단한 API<br>- DevTools 지원<br>- SSR 호환 |
| **Forms** | React Hook Form | 7.x | - 성능 최적화<br>- Zod 통합 |
| **Validation** | Zod | 3.x | - TypeScript 네이티브<br>- 런타임 검증 |
| **Icons** | Lucide React | latest | - Tree-shakable<br>- 경량 |

### 2.2 Backend & Infrastructure

| 카테고리 | 기술 | 선택 이유 |
|---------|------|-----------|
| **Hosting** | Vercel | - Serverless 자동 배포<br>- Edge Network (CDN)<br>- Zero config |
| **Database** | Supabase | - PostgreSQL (ACID)<br>- Real-time subscriptions<br>- Row Level Security |
| **Auth** | Supabase Auth | - OAuth providers<br>- JWT 기반<br>- Email verification |
| **Caching** | Vercel KV (Redis) | - Edge 캐싱<br>- 낮은 latency<br>- Vercel 통합 |
| **Rate Limiting** | Upstash Rate Limit | - Serverless 친화적<br>- IP/User 기반<br>- Vercel Middleware 지원 |

### 2.3 External APIs

| API | 용도 | 무료 티어 | Fallback |
|-----|------|-----------|----------|
| **Claude API** (Anthropic) | - AI 인사이트<br>- 데이터 수집<br>- 시나리오 제안 | Pay-as-you-go | Manual input |
| **FMP API** (Financial Modeling Prep) | - 주가 데이터<br>- EPS<br>- 재무제표 | 250 req/day | Alpha Vantage |
| **FRED API** (Federal Reserve) | - AAA 회사채 수익률 (Phase 2) | 무제한 | Manual input |

---

## 3. 폴더 구조

```
margin-safety-calculator/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions (optional)
│
├── docs/                             # 개발 문서 (현재 위치)
│   ├── ARCHITECTURE.md
│   ├── API_DESIGN.md
│   ├── COMPONENT_DESIGN.md
│   ├── AI_INTEGRATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEVELOPMENT_PLAN.md
│   └── TESTING_STRATEGY.md
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (calculator)
│   │   ├── globals.css               # Tailwind imports
│   │   │
│   │   ├── api/                      # API Routes (Serverless)
│   │   │   ├── analyze/
│   │   │   │   └── route.ts          # POST - Full analysis
│   │   │   ├── data/
│   │   │   │   └── route.ts          # GET - Fetch financial data
│   │   │   ├── insights/
│   │   │   │   └── route.ts          # POST - AI insights
│   │   │   └── portfolio/            # Phase 2
│   │   │       ├── route.ts          # GET/POST - Portfolio CRUD
│   │   │       └── [id]/
│   │   │           └── route.ts      # PATCH/DELETE
│   │   │
│   │   ├── portfolio/                # Phase 2
│   │   │   ├── page.tsx              # Portfolio dashboard
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Portfolio detail
│   │   │
│   │   └── auth/                     # Phase 2
│   │       ├── login/
│   │       │   └── page.tsx
│   │       └── signup/
│   │           └── page.tsx
│   │
│   ├── components/                   # React Components
│   │   ├── calculator/
│   │   │   ├── TickerInput.tsx       # 티커 입력 폼
│   │   │   ├── ManualInputForm.tsx   # 수동 데이터 입력
│   │   │   └── CalculateButton.tsx
│   │   │
│   │   ├── results/
│   │   │   ├── MarginGauge.tsx       # 안전마진 게이지
│   │   │   ├── ScenarioCard.tsx      # 시나리오 카드
│   │   │   ├── ScenarioTable.tsx     # 시나리오 비교 테이블
│   │   │   ├── SensitivityHeatmap.tsx # 민감도 분석
│   │   │   └── CalculationDetails.tsx # 계산 과정
│   │   │
│   │   ├── insights/
│   │   │   ├── AIInsightPanel.tsx    # AI 인사이트
│   │   │   └── LoadingInsight.tsx    # 로딩 상태
│   │   │
│   │   ├── charts/
│   │   │   ├── GaugeChart.tsx        # Recharts wrapper
│   │   │   ├── BarChart.tsx
│   │   │   └── HeatmapTable.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Disclaimer.tsx
│   │   │
│   │   └── ui/                       # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Tooltip.tsx
│   │
│   ├── lib/                          # Core business logic
│   │   ├── graham/
│   │   │   ├── calculator.ts         # Graham formula engine
│   │   │   ├── scenarios.ts          # Scenario generation
│   │   │   └── types.ts              # TypeScript interfaces
│   │   │
│   │   ├── ai/
│   │   │   ├── claude.ts             # Claude API client
│   │   │   ├── prompts.ts            # Prompt templates
│   │   │   └── parsers.ts            # Response parsers
│   │   │
│   │   ├── data/
│   │   │   ├── fmp.ts                # FMP API client
│   │   │   ├── cache.ts              # Vercel KV cache wrapper
│   │   │   └── validators.ts         # Data validation
│   │   │
│   │   ├── supabase/                 # Phase 2
│   │   │   ├── client.ts             # Supabase client
│   │   │   ├── queries.ts            # DB queries
│   │   │   └── types.ts              # Generated types
│   │   │
│   │   └── utils/
│   │       ├── format.ts             # Number formatting
│   │       ├── colors.ts             # Color logic
│   │       └── errors.ts             # Error handling
│   │
│   ├── store/                        # Zustand stores
│   │   ├── calculatorStore.ts        # Calculator state
│   │   └── portfolioStore.ts         # Phase 2
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── api.ts                    # API request/response
│   │   ├── calculator.ts             # Calculator types
│   │   └── database.ts               # DB types (Phase 2)
│   │
│   └── middleware.ts                 # Vercel Middleware (Rate limiting)
│
├── supabase/                         # Supabase config (Phase 2)
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── config.toml
│
├── .env.local.example                # Environment variables template
├── .env.local                        # Actual env vars (gitignored)
├── .gitignore
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json
└── README.md
```

---

## 4. 데이터 흐름 (Phase 1)

### 4.1 신규 종목 분석 플로우

```
┌─────────┐
│  User   │
│ Inputs  │
│ Ticker  │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Frontend (TickerInput.tsx)             │
│  - Validates ticker format              │
│  - Shows loading state                  │
└────┬────────────────────────────────────┘
     │
     │ POST /api/analyze
     │ { ticker: "NVDA", mode: "auto" }
     ▼
┌─────────────────────────────────────────┐
│  API Route (/api/analyze/route.ts)     │
│  1. Check rate limit (Upstash)         │
│  2. Check cache (Vercel KV)            │
│  3. If miss → Fetch data                │
└────┬────────────────────────────────────┘
     │
     ├─────────────────────┬──────────────────┐
     ▼                     ▼                  ▼
┌──────────┐      ┌──────────────┐    ┌──────────┐
│ FMP API  │      │  Claude API  │    │ Graham   │
│          │      │              │    │  Engine  │
│ Get:     │      │ Get:         │    │          │
│ - Price  │      │ - Growth est │    │ Compute: │
│ - EPS    │      │ - Scenarios  │    │ - V1     │
│ - Hist   │      │ - Context    │    │ - Margin │
└────┬─────┘      └──────┬───────┘    └────┬─────┘
     │                   │                  │
     └───────────────────┴──────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Combine Results       │
            │  - Scenarios           │
            │  - Calculations        │
            │  - AI Insights         │
            └────┬───────────────────┘
                 │
                 │ Cache result (TTL: 1 hour)
                 ▼
            ┌────────────────────────┐
            │  Response JSON         │
            │  {                     │
            │    ticker,             │
            │    price,              │
            │    eps,                │
            │    scenarios: [...],   │
            │    insights: {...}     │
            │  }                     │
            └────┬───────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Frontend (Results Components)         │
│  - MarginGauge                          │
│  - ScenarioTable                        │
│  - AIInsightPanel                       │
└─────────────────────────────────────────┘
```

### 4.2 수동 입력 모드 플로우

```
User inputs manually
     │
     ▼
POST /api/analyze
{
  ticker: "NVDA",
  mode: "manual",
  data: { price: 877.5, eps: 25.3, historicalGrowth: 15 }
}
     │
     ▼
Skip FMP API → Go directly to Claude (scenarios)
     │
     ▼
Graham calculation
     │
     ▼
Return results
```

---

## 5. 성능 최적화 전략

### 5.1 캐싱 전략

#### Vercel KV (Redis) 캐싱 레이어

| 데이터 타입 | 캐시 키 | TTL | 이유 |
|------------|---------|-----|------|
| 주가 데이터 | `stock:${ticker}:price` | 15분 | 시장 개장 중 자주 변경 |
| EPS/재무 | `stock:${ticker}:financials` | 24시간 | 분기별 업데이트 |
| AI 인사이트 | `insights:${ticker}:${hash}` | 7일 | 컨텍스트 변경 느림 |
| 계산 결과 | `calc:${ticker}:${params}` | 1시간 | 입력값 동일 시 재사용 |

**캐시 무효화 규칙**:
- 사용자가 "Refresh" 버튼 클릭 시
- 시장 개장/폐장 시간대
- API 에러 발생 시 (stale data 사용)

### 5.2 API Rate Limiting

```typescript
// src/middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 requests per hour
  analytics: true,
});

// Per-user limits (Phase 2):
// - Free: 20/hour, 100/day
// - Pro: 200/hour, 2000/day
```

### 5.3 Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### 5.4 Image & Font Optimization

- **Next.js Image**: `next/image` 컴포넌트 사용 (자동 WebP 변환)
- **Font**: `next/font/google`로 Inter 로드 (FOUT 방지)

---

## 6. 보안 아키텍처

### 6.1 환경 변수 관리

```bash
# .env.local.example

# API Keys (NEVER commit actual values)
ANTHROPIC_API_KEY=sk-ant-xxx
FMP_API_KEY=xxx
FRED_API_KEY=xxx

# Supabase (Phase 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Vercel KV
KV_REST_API_URL=xxx
KV_REST_API_TOKEN=xxx

# App Config
NEXT_PUBLIC_APP_URL=https://safetynet-invest.app
NODE_ENV=production
```

**Vercel 배포 시**:
- Vercel Dashboard → Project Settings → Environment Variables에 등록
- Preview/Production 환경 분리

### 6.2 API 보안

#### 6.2.1 Rate Limiting (이미 언급)
- IP 기반 (Phase 1)
- User ID 기반 (Phase 2)

#### 6.2.2 Input Validation

```typescript
// src/lib/data/validators.ts
import { z } from 'zod';

export const AnalyzeRequestSchema = z.object({
  ticker: z.string()
    .min(1).max(10)
    .regex(/^[A-Z]{1,5}$/), // AAPL, NVDA, etc.
  mode: z.enum(['auto', 'manual']),
  data: z.object({
    price: z.number().positive().optional(),
    eps: z.number().optional(),
    historicalGrowth: z.number().min(-100).max(1000).optional(),
  }).optional(),
});
```

#### 6.2.3 CORS & CSP

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

### 6.3 Database Security (Phase 2)

#### Row Level Security (RLS) 정책

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only modify their own data
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 7. 에러 처리 전략

### 7.1 에러 계층

```
┌─────────────────────────────────────┐
│  Client-Side Errors                 │
│  - Form validation                  │
│  - Network timeouts                 │
│  → Show user-friendly messages      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  API Route Errors                   │
│  - Rate limit exceeded              │
│  - Invalid input                    │
│  → Return structured JSON errors    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  External API Errors                │
│  - FMP/Claude timeout               │
│  - API quota exceeded               │
│  → Use cached data or fallback      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Logging & Monitoring               │
│  - Vercel Analytics                 │
│  - Sentry (optional)                │
└─────────────────────────────────────┘
```

### 7.2 에러 응답 형식

```typescript
// src/types/api.ts
export interface APIError {
  error: {
    code: string;          // "RATE_LIMIT_EXCEEDED"
    message: string;       // User-friendly message
    details?: any;         // Debug info (dev only)
    retryAfter?: number;   // Seconds
  };
}

// Example usage
return NextResponse.json(
  {
    error: {
      code: 'EXTERNAL_API_ERROR',
      message: 'Unable to fetch stock data. Please try manual input.',
      retryAfter: 60,
    },
  },
  { status: 503 }
);
```

### 7.3 Fallback 전략

| 시나리오 | Fallback |
|---------|----------|
| FMP API 실패 | → Claude web search → Manual input |
| Claude API 실패 | → Skip AI insights, show calculation only |
| Vercel KV 실패 | → Direct API call (no cache) |
| Supabase 실패 | → Local storage (Phase 2) |

---

## 8. 모니터링 & 로깅

### 8.1 Vercel Analytics

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**추적 메트릭**:
- Page views
- API response times
- Error rates
- User engagement (button clicks)

### 8.2 Custom Logging

```typescript
// src/lib/utils/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta);
    // Send to external service in production
  },
  error: (message: string, error: Error, meta?: any) => {
    console.error(`[ERROR] ${message}`, error, meta);
    // Send to Sentry/Vercel
  },
};

// Usage in API routes
logger.info('Analysis requested', { ticker, mode });
```

---

## 9. Phase 2 확장 고려사항

### 9.1 Authentication Flow

```
User signs up
     │
     ▼
Supabase Auth (Email/Password or OAuth)
     │
     ▼
JWT token stored in cookie
     │
     ▼
Middleware validates token on protected routes
     │
     ▼
API routes access user_id from token
```

### 9.2 Real-time Updates

```typescript
// Supabase Realtime subscription
const subscription = supabase
  .channel('portfolio_changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'holdings',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Update UI automatically
    }
  )
  .subscribe();
```

### 9.3 Background Jobs (Scheduled Updates)

```typescript
// Vercel Cron Jobs (vercel.json)
{
  "crons": [
    {
      "path": "/api/cron/update-portfolios",
      "schedule": "0 9 * * 1-5" // Every weekday at 9 AM
    }
  ]
}
```

---

## 10. 배포 전략

### 10.1 Git Workflow

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/calculator-ui
  │     ├── feature/ai-integration
  │     └── feature/portfolio-mgmt
  │
  └── hotfix/... (emergency fixes)
```

### 10.2 Vercel 환경

| Branch | Vercel Environment | Domain |
|--------|-------------------|---------|
| `main` | Production | safetynet-invest.app |
| `develop` | Preview | safetynet-git-develop-xxx.vercel.app |
| `feature/*` | Preview | safetynet-git-feature-xxx.vercel.app |

### 10.3 배포 체크리스트

- [ ] 환경 변수 설정 확인
- [ ] Database migrations 실행 (Phase 2)
- [ ] API 키 quota 확인
- [ ] Rate limit 설정 테스트
- [ ] Error boundary 작동 확인
- [ ] 모바일 반응형 테스트
- [ ] Lighthouse 점수 확인 (>90)
- [ ] 면책 조항(Disclaimer) 포함 여부

---

## 11. 확장성 고려사항

### 11.1 Horizontal Scaling

- **Serverless Functions**: Vercel이 자동으로 확장 (최대 100 concurrent executions)
- **Database**: Supabase는 connection pooling 지원 (PgBouncer)
- **Cache**: Vercel KV는 자동 확장

### 11.2 비용 추정 (MVP)

| 서비스 | 무료 티어 | 예상 비용/월 (100 users) |
|--------|-----------|------------------------|
| Vercel | 100GB bandwidth | $0 |
| Supabase | 500MB DB, 2GB bandwidth | $0 |
| Vercel KV | 256MB storage | $0 |
| Claude API | Pay-per-use | ~$20 (2,000 requests) |
| FMP API | 250 req/day | $0 |
| **Total** | | **~$20/월** |

### 11.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Byte (TTFB)** | < 200ms | Vercel Analytics |
| **API Response Time** | < 3s (with cache) | Custom logging |
| **AI Insight Generation** | < 10s | Custom logging |
| **Lighthouse Performance** | > 90 | Chrome DevTools |
| **First Contentful Paint** | < 1.5s | Web Vitals |

---

## 12. 레퍼런스

### 12.1 공식 문서
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Supabase Guides](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)

### 12.2 Best Practices
- [Next.js App Router Patterns](https://nextjs.org/docs/app/building-your-application)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**문서 상태**: ✅ Ready for Development
**다음 단계**: API_DESIGN.md 참조
