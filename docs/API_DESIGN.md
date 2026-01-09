# API 설계서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **Base URL**: `https://safetynet-invest.app/api` (Production)
- **API Style**: RESTful
- **Response Format**: JSON

---

## 1. API 개요

### 1.1 설계 원칙

1. **RESTful Conventions**: HTTP 메서드 의미론적 사용 (GET, POST, PATCH, DELETE)
2. **Consistent Response Format**: 성공/실패 모두 예측 가능한 구조
3. **Versioning**: URL에 버전 포함 (`/api/v1/...`) - 추후 확장 시
4. **Error Handling**: RFC 7807 (Problem Details) 스타일
5. **Caching**: HTTP Cache-Control 헤더 활용

### 1.2 인증 (Phase 2)

```http
Authorization: Bearer <JWT_TOKEN>
```

- Phase 1: 인증 없음 (Public API)
- Phase 2: Supabase JWT 토큰 사용

### 1.3 Rate Limiting

**헤더**:
```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1641024000
```

**초과 시 응답**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 53 minutes.",
    "retryAfter": 3180
  }
}
```

---

## 2. Phase 1 API Endpoints

### 2.1 POST /api/analyze

**용도**: 종목 분석 (자동/수동 모드)

#### Request

**Headers**:
```http
Content-Type: application/json
```

**Body (Auto Mode)**:
```json
{
  "ticker": "NVDA",
  "mode": "auto"
}
```

**Body (Manual Mode)**:
```json
{
  "ticker": "NVDA",
  "mode": "manual",
  "data": {
    "currentPrice": 877.50,
    "eps": 25.30,
    "historicalGrowth": 15.2
  }
}
```

**TypeScript Interface**:
```typescript
interface AnalyzeRequest {
  ticker: string;                    // 1-10 uppercase letters
  mode: 'auto' | 'manual';
  data?: {
    currentPrice?: number;           // Required if mode=manual
    eps?: number;                    // Required if mode=manual
    historicalGrowth?: number;       // Optional (default: 0)
  };
}
```

#### Response (200 OK)

```json
{
  "ticker": "NVDA",
  "companyName": "NVIDIA Corporation",
  "currentPrice": 877.50,
  "eps": 25.30,
  "lastUpdated": "2026-01-09T10:30:00Z",

  "scenarios": [
    {
      "type": "conservative",
      "assumptions": {
        "growthRate": 5.0,
        "rationale": "Assumes economic downturn and increased competition in AI chip market"
      },
      "intrinsicValue": 620.50,
      "marginOfSafety": -29.3,
      "recommendation": "overvalued"
    },
    {
      "type": "neutral",
      "assumptions": {
        "growthRate": 10.0,
        "rationale": "Based on analyst consensus and current market trends"
      },
      "intrinsicValue": 741.00,
      "marginOfSafety": -15.6,
      "recommendation": "overvalued"
    },
    {
      "type": "optimistic",
      "assumptions": {
        "growthRate": 18.0,
        "rationale": "Continued AI adoption and datacenter expansion"
      },
      "intrinsicValue": 895.80,
      "marginOfSafety": 2.1,
      "recommendation": "fairly_valued"
    }
  ],

  "insights": {
    "summary": "NVIDIA is currently trading at a 15-29% premium to its intrinsic value under conservative and neutral scenarios. While the AI chip demand remains strong, the current valuation reflects significant growth expectations already priced in.",
    "keyFactors": [
      "Q3 2025 earnings beat expectations with 206% YoY revenue growth",
      "Data center segment revenue reached $30.8B",
      "Strong demand for H100 and upcoming B100 chips"
    ],
    "risks": [
      "High valuation multiples (PE ratio of 35x)",
      "Potential competition from AMD and custom chips",
      "Geopolitical risks affecting China sales"
    ],
    "opportunities": [
      "Expanding TAM in AI inference market",
      "Software ecosystem (CUDA) providing moat",
      "Automotive and robotics segments gaining traction"
    ],
    "recommendation": {
      "action": "wait",
      "reasoning": "Consider waiting for a 15-20% pullback to enter at more attractive valuation",
      "targetPrice": 700.00
    }
  },

  "metadata": {
    "calculationMethod": "graham_v1",
    "dataSource": "fmp_api",
    "cacheHit": false,
    "processingTime": 2847
  }
}
```

**TypeScript Interface**:
```typescript
interface AnalyzeResponse {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  lastUpdated: string;              // ISO 8601

  scenarios: Scenario[];
  insights: AIInsights;
  metadata: ResponseMetadata;
}

interface Scenario {
  type: 'conservative' | 'neutral' | 'optimistic';
  assumptions: {
    growthRate: number;
    rationale: string;
  };
  intrinsicValue: number;
  marginOfSafety: number;           // Percentage
  recommendation: 'undervalued' | 'fairly_valued' | 'overvalued';
}

interface AIInsights {
  summary: string;
  keyFactors: string[];
  risks: string[];
  opportunities: string[];
  recommendation: {
    action: 'buy' | 'hold' | 'wait' | 'sell';
    reasoning: string;
    targetPrice?: number;
  };
}

interface ResponseMetadata {
  calculationMethod: 'graham_v1' | 'graham_v2';
  dataSource: 'fmp_api' | 'manual' | 'cache';
  cacheHit: boolean;
  processingTime: number;           // Milliseconds
}
```

#### Error Responses

**400 Bad Request** (Invalid Input):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid ticker format. Must be 1-10 uppercase letters.",
    "field": "ticker",
    "details": {
      "received": "nvda123",
      "expected": "^[A-Z]{1,10}$"
    }
  }
}
```

**404 Not Found** (Ticker Not Found):
```json
{
  "error": {
    "code": "TICKER_NOT_FOUND",
    "message": "Unable to find financial data for ticker 'XYZ'. Please verify the symbol or use manual input mode.",
    "suggestion": "Try searching on finance.yahoo.com to verify the correct ticker symbol."
  }
}
```

**429 Too Many Requests**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the rate limit of 20 requests per hour.",
    "retryAfter": 3180
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "requestId": "req_abc123"
  }
}
```

**503 Service Unavailable** (External API Failure):
```json
{
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "Unable to fetch financial data from provider. Please try manual input mode.",
    "fallback": "manual",
    "retryAfter": 60
  }
}
```

---

### 2.2 GET /api/data

**용도**: 특정 티커의 최신 재무 데이터만 조회 (계산 없이)

#### Request

**Query Parameters**:
```
GET /api/data?ticker=NVDA
```

**TypeScript Interface**:
```typescript
interface DataRequest {
  ticker: string;
}
```

#### Response (200 OK)

```json
{
  "ticker": "NVDA",
  "companyName": "NVIDIA Corporation",
  "exchange": "NASDAQ",
  "currency": "USD",

  "price": {
    "current": 877.50,
    "open": 875.20,
    "high": 882.30,
    "low": 870.10,
    "volume": 45238900,
    "marketCap": 2165000000000,
    "timestamp": "2026-01-09T16:00:00Z"
  },

  "fundamentals": {
    "eps": 25.30,
    "epsGrowth": {
      "1year": 15.2,
      "3year": 22.8,
      "5year": 18.5
    },
    "pe": 34.7,
    "forwardPE": 28.3,
    "revenue": 79774000000,
    "revenueGrowth": 125.9
  },

  "analystEstimates": {
    "consensusGrowth": 12.5,
    "lowEstimate": 8.0,
    "highEstimate": 20.0,
    "numberOfAnalysts": 42,
    "rating": {
      "buy": 35,
      "hold": 6,
      "sell": 1
    }
  },

  "metadata": {
    "lastUpdated": "2026-01-09T10:30:00Z",
    "source": "fmp_api",
    "cacheHit": true,
    "cacheTTL": 900
  }
}
```

**TypeScript Interface**:
```typescript
interface DataResponse {
  ticker: string;
  companyName: string;
  exchange: string;
  currency: string;

  price: {
    current: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    marketCap: number;
    timestamp: string;
  };

  fundamentals: {
    eps: number;
    epsGrowth: {
      '1year': number;
      '3year': number;
      '5year': number;
    };
    pe: number;
    forwardPE: number;
    revenue: number;
    revenueGrowth: number;
  };

  analystEstimates: {
    consensusGrowth: number;
    lowEstimate: number;
    highEstimate: number;
    numberOfAnalysts: number;
    rating: {
      buy: number;
      hold: number;
      sell: number;
    };
  };

  metadata: {
    lastUpdated: string;
    source: string;
    cacheHit: boolean;
    cacheTTL: number;
  };
}
```

---

### 2.3 GET /api/health

**용도**: API 상태 확인 (모니터링용)

#### Response (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2026-01-09T10:30:00Z",
  "services": {
    "database": "up",
    "cache": "up",
    "fmpAPI": "up",
    "claudeAPI": "up"
  },
  "version": "1.0.0"
}
```

---

## 3. Phase 2 API Endpoints

### 3.1 Authentication Endpoints

#### POST /api/auth/signup

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201 Created)**:
```json
{
  "user": {
    "id": "uuid-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-09T10:30:00Z"
  },
  "session": {
    "accessToken": "jwt-token-xxx",
    "refreshToken": "jwt-refresh-xxx",
    "expiresIn": 3600
  }
}
```

#### POST /api/auth/login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**: Same as signup

#### POST /api/auth/logout

**Request**: No body (token in header)

**Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

### 3.2 Portfolio Endpoints

#### GET /api/portfolio

**용도**: 사용자의 모든 포트폴리오 조회

**Headers**:
```http
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "portfolios": [
    {
      "id": "portfolio-1",
      "name": "Long-Term Growth",
      "description": "Tech stocks for 10+ years",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-09T10:30:00Z",
      "holdings": [
        {
          "id": "holding-1",
          "ticker": "NVDA",
          "shares": 100,
          "avgCost": 450.00,
          "currentPrice": 877.50,
          "totalValue": 87750.00,
          "gainLoss": 42750.00,
          "gainLossPercent": 95.0,
          "latestMarginOfSafety": -15.6,
          "lastAnalyzed": "2026-01-09T09:00:00Z"
        },
        {
          "id": "holding-2",
          "ticker": "AAPL",
          "shares": 200,
          "avgCost": 150.00,
          "currentPrice": 185.50,
          "totalValue": 37100.00,
          "gainLoss": 7100.00,
          "gainLossPercent": 23.7,
          "latestMarginOfSafety": 12.3,
          "lastAnalyzed": "2026-01-08T14:30:00Z"
        }
      ],
      "summary": {
        "totalValue": 124850.00,
        "totalCost": 75000.00,
        "totalGainLoss": 49850.00,
        "totalGainLossPercent": 66.5,
        "avgMarginOfSafety": -1.65
      }
    }
  ]
}
```

**TypeScript Interface**:
```typescript
interface Portfolio {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  holdings: Holding[];
  summary: PortfolioSummary;
}

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  latestMarginOfSafety: number;
  lastAnalyzed: string;
}

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  avgMarginOfSafety: number;
}
```

---

#### POST /api/portfolio

**용도**: 새 포트폴리오 생성

**Request**:
```json
{
  "name": "Value Stocks",
  "description": "Undervalued companies"
}
```

**Response (201 Created)**:
```json
{
  "portfolio": {
    "id": "portfolio-2",
    "name": "Value Stocks",
    "description": "Undervalued companies",
    "createdAt": "2026-01-09T10:30:00Z",
    "updatedAt": "2026-01-09T10:30:00Z",
    "holdings": [],
    "summary": {
      "totalValue": 0,
      "totalCost": 0,
      "totalGainLoss": 0,
      "totalGainLossPercent": 0,
      "avgMarginOfSafety": 0
    }
  }
}
```

---

#### PATCH /api/portfolio/[id]

**용도**: 포트폴리오 수정

**Request**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200 OK)**: Updated portfolio object

---

#### DELETE /api/portfolio/[id]

**용도**: 포트폴리오 삭제

**Response (204 No Content)**

---

### 3.3 Holdings Endpoints

#### POST /api/portfolio/[portfolioId]/holdings

**용도**: 포트폴리오에 종목 추가

**Request**:
```json
{
  "ticker": "NVDA",
  "shares": 100,
  "avgCost": 450.00
}
```

**Response (201 Created)**:
```json
{
  "holding": {
    "id": "holding-3",
    "ticker": "NVDA",
    "shares": 100,
    "avgCost": 450.00,
    "currentPrice": 877.50,
    "totalValue": 87750.00,
    "gainLoss": 42750.00,
    "gainLossPercent": 95.0,
    "createdAt": "2026-01-09T10:30:00Z"
  }
}
```

---

#### PATCH /api/portfolio/[portfolioId]/holdings/[holdingId]

**용도**: 보유 종목 수정 (추가 매수/매도)

**Request**:
```json
{
  "action": "buy",
  "shares": 50,
  "price": 880.00
}
```

**Response (200 OK)**: Updated holding with new avgCost

---

#### DELETE /api/portfolio/[portfolioId]/holdings/[holdingId]

**용도**: 보유 종목 삭제

**Response (204 No Content)**

---

### 3.4 Analysis History Endpoints

#### GET /api/analysis/[ticker]/history

**용도**: 특정 종목의 계산 히스토리 조회

**Query Parameters**:
```
GET /api/analysis/NVDA/history?period=3m&limit=50
```

**Response (200 OK)**:
```json
{
  "ticker": "NVDA",
  "history": [
    {
      "id": "calc-1",
      "timestamp": "2026-01-09T10:30:00Z",
      "price": 877.50,
      "eps": 25.30,
      "marginOfSafety": {
        "conservative": -29.3,
        "neutral": -15.6,
        "optimistic": 2.1
      }
    },
    {
      "id": "calc-2",
      "timestamp": "2026-01-02T10:30:00Z",
      "price": 850.00,
      "eps": 25.30,
      "marginOfSafety": {
        "conservative": -26.9,
        "neutral": -12.8,
        "optimistic": 5.4
      }
    }
  ],
  "metadata": {
    "period": "3m",
    "totalRecords": 2,
    "limit": 50
  }
}
```

---

### 3.5 Watchlist Endpoints

#### GET /api/watchlist

**용도**: 관심 종목 조회

**Response (200 OK)**:
```json
{
  "watchlist": [
    {
      "id": "watch-1",
      "ticker": "TSLA",
      "addedAt": "2026-01-05T00:00:00Z",
      "notes": "Wait for margin of safety > 20%",
      "latestPrice": 245.50,
      "latestMarginOfSafety": -8.5,
      "alerts": {
        "priceTarget": 220.00,
        "marginTarget": 20.0
      }
    }
  ]
}
```

---

#### POST /api/watchlist

**용도**: 관심 종목 추가

**Request**:
```json
{
  "ticker": "TSLA",
  "notes": "Wait for margin of safety > 20%",
  "alerts": {
    "priceTarget": 220.00,
    "marginTarget": 20.0
  }
}
```

**Response (201 Created)**: Watchlist item object

---

## 4. Error Code Reference

| Error Code | HTTP Status | 설명 | 해결 방법 |
|------------|-------------|------|-----------|
| `VALIDATION_ERROR` | 400 | 입력값 형식 오류 | 요청 데이터 확인 |
| `TICKER_NOT_FOUND` | 404 | 티커 심볼 미존재 | 티커 심볼 재확인 또는 수동 입력 |
| `UNAUTHORIZED` | 401 | 인증 실패 | 로그인 필요 |
| `FORBIDDEN` | 403 | 권한 없음 | 해당 리소스 접근 권한 확인 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 한도 초과 | `retryAfter` 시간 후 재시도 |
| `EXTERNAL_API_ERROR` | 503 | 외부 API 오류 | 수동 입력 모드 사용 또는 재시도 |
| `CACHE_ERROR` | 500 | 캐시 서비스 오류 | 자동으로 직접 API 호출 |
| `DATABASE_ERROR` | 500 | DB 연결 오류 | 재시도 또는 고객 지원 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 | 개발팀에 `requestId` 제공 |

---

## 5. API 사용 예시 (cURL)

### 5.1 자동 모드로 분석

```bash
curl -X POST https://safetynet-invest.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "NVDA",
    "mode": "auto"
  }'
```

### 5.2 수동 입력 모드

```bash
curl -X POST https://safetynet-invest.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "NVDA",
    "mode": "manual",
    "data": {
      "currentPrice": 877.50,
      "eps": 25.30,
      "historicalGrowth": 15.2
    }
  }'
```

### 5.3 포트폴리오 조회 (Phase 2)

```bash
curl -X GET https://safetynet-invest.app/api/portfolio \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 6. TypeScript Client Example

```typescript
// src/lib/api/client.ts

class SafetyNetAPI {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await fetch(`${this.baseURL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error);
    }

    return response.json();
  }

  async getData(ticker: string): Promise<DataResponse> {
    const response = await fetch(`${this.baseURL}/data?ticker=${ticker}`);

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error);
    }

    return response.json();
  }

  // Phase 2: Portfolio methods
  async getPortfolios(token: string): Promise<Portfolio[]> {
    const response = await fetch(`${this.baseURL}/portfolio`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error);
    }

    const data = await response.json();
    return data.portfolios;
  }
}

class APIError extends Error {
  constructor(public errorResponse: APIErrorResponse) {
    super(errorResponse.error.message);
    this.name = 'APIError';
  }
}

export const api = new SafetyNetAPI();
```

**사용 예시**:
```typescript
// In a React component
try {
  const result = await api.analyze({
    ticker: 'NVDA',
    mode: 'auto',
  });
  console.log(result.scenarios);
} catch (error) {
  if (error instanceof APIError) {
    console.error(error.errorResponse.error.code);
  }
}
```

---

## 7. API Versioning 전략 (향후)

### 7.1 URL Versioning

```
/api/v1/analyze  (Current)
/api/v2/analyze  (Future - with DCF support)
```

### 7.2 Breaking Changes 정책

- **Minor Changes** (비호환성 없음): 새 필드 추가, 선택적 파라미터 추가
- **Major Changes** (비호환성): 필수 필드 변경, 필드 제거, 타입 변경
  - 새 버전으로 분리 (`/api/v2/...`)
  - 구버전 최소 6개월 유지

---

## 8. Performance Considerations

### 8.1 Response Time Targets

| Endpoint | Target | Cache Hit | Cache Miss |
|----------|--------|-----------|------------|
| `/api/analyze` (auto) | < 3s | < 500ms | < 5s |
| `/api/analyze` (manual) | < 1s | N/A | < 1s |
| `/api/data` | < 1s | < 200ms | < 2s |
| `/api/portfolio` | < 500ms | < 200ms | < 800ms |

### 8.2 Caching Strategy

| Endpoint | Cache Key | TTL | Invalidation |
|----------|-----------|-----|--------------|
| `/api/analyze` | `analyze:${ticker}:${mode}:${hash(data)}` | 1h | Manual refresh |
| `/api/data` | `data:${ticker}` | 15m | Market close |
| `/api/portfolio` | `portfolio:${userId}` | 5m | On update |

---

## 9. Security Checklist

- [x] Input validation (Zod schema)
- [x] Rate limiting (Upstash)
- [x] CORS configuration
- [x] API key rotation strategy
- [x] SQL injection prevention (Supabase RLS)
- [x] XSS prevention (sanitize user inputs)
- [x] HTTPS only (Vercel default)
- [x] Secure headers (CSP, X-Frame-Options)

---

**문서 상태**: ✅ Ready for Development
**다음 단계**: COMPONENT_DESIGN.md 참조
