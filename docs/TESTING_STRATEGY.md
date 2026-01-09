# 테스팅 전략서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **Testing Framework**: Jest + React Testing Library
- **E2E Framework**: Playwright (Phase 2)

---

## 1. 테스팅 철학

### 1.1 테스트 피라미드

```
         ┌─────────────┐
         │  E2E Tests  │  (10% - Critical User Flows)
         └─────────────┘
       ┌─────────────────┐
       │ Integration     │  (30% - API, Component Integration)
       └─────────────────┘
     ┌───────────────────────┐
     │   Unit Tests          │  (60% - Business Logic, Utils)
     └───────────────────────┘
```

### 1.2 테스트 원칙

1. **Fast Feedback**: 유닛 테스트는 즉각 실행 (<1초)
2. **Isolated**: 각 테스트는 독립적으로 실행 가능
3. **Repeatable**: 동일한 입력 → 동일한 결과
4. **Self-Validating**: Pass/Fail 명확
5. **Timely**: 코드 작성과 동시에 테스트 작성

### 1.3 Phase별 테스팅 전략

| Phase | 테스트 범위 | 우선순위 |
|-------|-----------|---------|
| **Phase 1** | - 유닛 테스트 (Graham 계산)<br>- 기본 Integration 테스트<br>- E2E는 최소화 | Must have: Unit<br>Nice to have: E2E |
| **Phase 2** | - 전체 유닛 테스트<br>- API Integration 테스트<br>- E2E (핵심 플로우) | Must have: Unit + Integration<br>Should have: E2E |

---

## 2. 테스트 환경 설정

### 2.1 의존성 설치

```bash
# Unit & Integration Testing
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/jest ts-jest

# E2E Testing (Phase 2)
npm install -D @playwright/test

# Mocking
npm install -D msw  # Mock Service Worker for API mocking
```

### 2.2 Jest 설정

**파일**: `jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/**', // Exclude Next.js app directory (test via E2E)
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**파일**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.FMP_API_KEY = 'test-key';
```

### 2.3 Playwright 설정 (Phase 2)

**파일**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 3. Unit Tests

### 3.1 Graham Calculator Tests

**파일**: `__tests__/lib/graham/calculator.test.ts`

```typescript
import {
  calculateIntrinsicValue,
  calculateMarginOfSafety,
  getRecommendation,
} from '@/lib/graham/calculator';

describe('Graham Calculator', () => {
  describe('calculateIntrinsicValue', () => {
    it('should calculate intrinsic value correctly', () => {
      const eps = 25.30;
      const growthRate = 10.0;

      const result = calculateIntrinsicValue(eps, growthRate);

      expect(result).toBeCloseTo(717.35, 2); // EPS × (8.5 + 2×10) = 25.30 × 28.5 = 717.05
    });

    it('should handle zero growth rate', () => {
      const eps = 10.0;
      const growthRate = 0;

      const result = calculateIntrinsicValue(eps, growthRate);

      expect(result).toBe(85.0); // 10 × 8.5
    });

    it('should handle negative EPS', () => {
      const eps = -5.0;
      const growthRate = 10.0;

      const result = calculateIntrinsicValue(eps, growthRate);

      expect(result).toBeLessThan(0);
    });
  });

  describe('calculateMarginOfSafety', () => {
    it('should calculate positive margin correctly', () => {
      const intrinsicValue = 100;
      const currentPrice = 80;

      const margin = calculateMarginOfSafety(intrinsicValue, currentPrice);

      expect(margin).toBeCloseTo(25.0, 1); // (100-80)/80 * 100 = 25%
    });

    it('should calculate negative margin correctly', () => {
      const intrinsicValue = 620.50;
      const currentPrice = 877.50;

      const margin = calculateMarginOfSafety(intrinsicValue, currentPrice);

      expect(margin).toBeCloseTo(-29.3, 1);
    });

    it('should handle zero price gracefully', () => {
      const intrinsicValue = 100;
      const currentPrice = 0;

      expect(() => {
        calculateMarginOfSafety(intrinsicValue, currentPrice);
      }).toThrow('Current price cannot be zero');
    });
  });

  describe('getRecommendation', () => {
    it('should return undervalued for margin >= 30%', () => {
      expect(getRecommendation(35)).toBe('undervalued');
      expect(getRecommendation(30)).toBe('undervalued');
    });

    it('should return fairly_valued for margin 0-30%', () => {
      expect(getRecommendation(15)).toBe('fairly_valued');
      expect(getRecommendation(0)).toBe('fairly_valued');
    });

    it('should return overvalued for negative margin', () => {
      expect(getRecommendation(-10)).toBe('overvalued');
      expect(getRecommendation(-50)).toBe('overvalued');
    });
  });
});
```

---

### 3.2 Scenario Generation Tests

**파일**: `__tests__/lib/graham/scenarios.test.ts`

```typescript
import { generateScenarios } from '@/lib/graham/scenarios';

describe('Scenario Generation', () => {
  it('should generate three scenarios', () => {
    const input = {
      historicalGrowth: 15.2,
      analystConsensus: 12.5,
      industryTrends: 'Strong AI demand',
    };

    const scenarios = generateScenarios(input);

    expect(scenarios).toHaveLength(3);
    expect(scenarios[0].type).toBe('conservative');
    expect(scenarios[1].type).toBe('neutral');
    expect(scenarios[2].type).toBe('optimistic');
  });

  it('conservative scenario should be lower than historical', () => {
    const input = {
      historicalGrowth: 20.0,
      analystConsensus: 15.0,
      industryTrends: 'Moderate growth',
    };

    const scenarios = generateScenarios(input);
    const conservative = scenarios[0];

    expect(conservative.growthRate).toBeLessThan(input.historicalGrowth);
    expect(conservative.growthRate).toBeLessThanOrEqual(10.0); // max(historical * 0.5, 5%)
  });

  it('should cap optimistic scenario at 25%', () => {
    const input = {
      historicalGrowth: 40.0,
      analystConsensus: 35.0,
      industryTrends: 'Explosive growth',
    };

    const scenarios = generateScenarios(input);
    const optimistic = scenarios[2];

    expect(optimistic.growthRate).toBeLessThanOrEqual(25.0);
  });
});
```

---

### 3.3 Utility Functions Tests

**파일**: `__tests__/lib/utils/format.test.ts`

```typescript
import { formatCurrency, formatPercent } from '@/lib/utils/format';

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500.25)).toBe('-$500.25');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercent', () => {
    it('should format percentages with sign', () => {
      expect(formatPercent(25.5)).toBe('+25.5%');
      expect(formatPercent(-15.2)).toBe('-15.2%');
      expect(formatPercent(0)).toBe('0.0%');
    });
  });
});
```

---

## 4. Integration Tests

### 4.1 API Route Tests

**파일**: `__tests__/api/analyze.test.ts`

```typescript
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

// Mock external dependencies
jest.mock('@/lib/ai/claude', () => ({
  claude: {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify({
      scenarios: [
        { type: 'conservative', growthRate: 5.0 },
        { type: 'neutral', growthRate: 10.0 },
        { type: 'optimistic', growthRate: 15.0 },
      ],
    })),
  },
}));

jest.mock('@/lib/data/fmp', () => ({
  fmpClient: {
    getStockData: jest.fn().mockResolvedValue({
      ticker: 'NVDA',
      currentPrice: 877.50,
      eps: 25.30,
      historicalGrowth: 15.2,
    }),
  },
}));

describe('POST /api/analyze', () => {
  it('should return analysis for valid ticker (auto mode)', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        ticker: 'NVDA',
        mode: 'auto',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('ticker', 'NVDA');
    expect(data).toHaveProperty('scenarios');
    expect(data.scenarios).toHaveLength(3);
    expect(data.scenarios[0]).toHaveProperty('intrinsicValue');
    expect(data.scenarios[0]).toHaveProperty('marginOfSafety');
  });

  it('should return analysis for manual input', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        ticker: 'AAPL',
        mode: 'manual',
        data: {
          currentPrice: 185.50,
          eps: 6.15,
          historicalGrowth: 10.0,
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticker).toBe('AAPL');
    expect(data.currentPrice).toBe(185.50);
  });

  it('should return 400 for invalid ticker format', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        ticker: 'invalid123',
        mode: 'auto',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Mock rate limiter
    jest.mock('@upstash/ratelimit', () => ({
      Ratelimit: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockResolvedValue({ success: false }),
      })),
    }));

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ ticker: 'NVDA', mode: 'auto' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
  });
});
```

---

### 4.2 Component Integration Tests

**파일**: `__tests__/components/calculator/CalculatorContainer.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorContainer } from '@/components/calculator/CalculatorContainer';

describe('CalculatorContainer', () => {
  const mockOnAnalyze = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ticker input and button', () => {
    render(
      <CalculatorContainer
        onAnalyze={mockOnAnalyze}
        loading={false}
      />
    );

    expect(screen.getByLabelText(/stock ticker/i)).toBeInTheDocument();
    expect(screen.getByText(/analyze stock/i)).toBeInTheDocument();
  });

  it('should call onAnalyze with ticker when submitted', async () => {
    const user = userEvent.setup();

    render(
      <CalculatorContainer
        onAnalyze={mockOnAnalyze}
        loading={false}
      />
    );

    const input = screen.getByLabelText(/stock ticker/i);
    const button = screen.getByText(/analyze stock/i);

    await user.type(input, 'NVDA');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnAnalyze).toHaveBeenCalledWith({
        ticker: 'NVDA',
        mode: 'auto',
      });
    });
  });

  it('should convert ticker to uppercase', async () => {
    const user = userEvent.setup();

    render(
      <CalculatorContainer
        onAnalyze={mockOnAnalyze}
        loading={false}
      />
    );

    const input = screen.getByLabelText(/stock ticker/i);

    await user.type(input, 'nvda');

    expect(input).toHaveValue('NVDA');
  });

  it('should disable button when loading', () => {
    render(
      <CalculatorContainer
        onAnalyze={mockOnAnalyze}
        loading={true}
      />
    );

    const button = screen.getByText(/analyzing/i);
    expect(button).toBeDisabled();
  });

  it('should switch to manual mode and show input fields', async () => {
    const user = userEvent.setup();

    render(
      <CalculatorContainer
        onAnalyze={mockOnAnalyze}
        loading={false}
      />
    );

    const manualButton = screen.getByText(/manual input/i);
    await user.click(manualButton);

    expect(screen.getByLabelText(/current price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/eps/i)).toBeInTheDocument();
  });
});
```

---

## 5. E2E Tests (Phase 2)

### 5.1 Critical User Flows

**파일**: `e2e/calculate-margin.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Margin of Safety Calculation', () => {
  test('should calculate margin of safety for NVDA in auto mode', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Enter ticker
    await page.fill('input[name="ticker"]', 'NVDA');

    // Click analyze button
    await page.click('button:has-text("Analyze Stock")');

    // Wait for results
    await page.waitForSelector('text=Margin of Safety', { timeout: 10000 });

    // Verify results are displayed
    await expect(page.locator('text=NVIDIA Corporation')).toBeVisible();
    await expect(page.locator('text=Conservative')).toBeVisible();
    await expect(page.locator('text=Neutral')).toBeVisible();
    await expect(page.locator('text=Optimistic')).toBeVisible();

    // Verify AI insights
    await expect(page.locator('text=AI Investment Analysis')).toBeVisible();
  });

  test('should calculate with manual input', async ({ page }) => {
    await page.goto('/');

    // Switch to manual mode
    await page.click('button:has-text("Manual Input")');

    // Fill in data
    await page.fill('input[name="ticker"]', 'AAPL');
    await page.fill('input[name="currentPrice"]', '185.50');
    await page.fill('input[name="eps"]', '6.15');
    await page.fill('input[name="historicalGrowth"]', '10');

    // Submit
    await page.click('button:has-text("Analyze Stock")');

    // Wait for results
    await page.waitForSelector('text=Margin of Safety');

    // Verify calculation
    const marginText = await page.textContent('[data-testid="margin-neutral"]');
    expect(marginText).toContain('%');
  });

  test('should display error for invalid ticker', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[name="ticker"]', 'INVALID123');
    await page.click('button:has-text("Analyze Stock")');

    // Wait for error message
    await expect(page.locator('text=Invalid ticker format')).toBeVisible();
  });

  test('should toggle calculation details', async ({ page }) => {
    await page.goto('/');

    // Perform calculation
    await page.fill('input[name="ticker"]', 'NVDA');
    await page.click('button:has-text("Analyze Stock")');
    await page.waitForSelector('text=Margin of Safety');

    // Toggle details
    await page.click('button:has-text("Calculation Details")');

    // Verify details are shown
    await expect(page.locator('text=EPS (TTM)')).toBeVisible();
    await expect(page.locator('text=Growth Rate')).toBeVisible();
  });
});
```

---

### 5.2 Portfolio Management (Phase 2)

**파일**: `e2e/portfolio.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/portfolio');
  });

  test('should create new portfolio', async ({ page }) => {
    await page.click('button:has-text("New Portfolio")');

    await page.fill('input[name="name"]', 'Tech Growth');
    await page.fill('input[name="description"]', 'Long-term tech holdings');
    await page.click('button:has-text("Create")');

    await expect(page.locator('text=Tech Growth')).toBeVisible();
  });

  test('should add holding to portfolio', async ({ page }) => {
    // Assume portfolio exists
    await page.click('button:has-text("Add Holding")');

    await page.fill('input[name="ticker"]', 'NVDA');
    await page.fill('input[name="shares"]', '100');
    await page.fill('input[name="avgCost"]', '450.00');
    await page.click('button:has-text("Add")');

    await expect(page.locator('text=NVDA')).toBeVisible();
    await expect(page.locator('text=100 shares')).toBeVisible();
  });

  test('should display portfolio summary', async ({ page }) => {
    // Verify summary widgets
    await expect(page.locator('text=Total Value')).toBeVisible();
    await expect(page.locator('text=Total Gain/Loss')).toBeVisible();
    await expect(page.locator('text=Avg Margin of Safety')).toBeVisible();
  });
});
```

---

## 6. 테스트 커버리지 목표

### 6.1 커버리지 임계값

```javascript
// jest.config.js
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
  // Critical paths require higher coverage
  './src/lib/graham/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

### 6.2 커버리지 확인

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## 7. 테스트 자동화 (CI/CD)

### 7.1 GitHub Actions Workflow

**파일**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 7.2 NPM Scripts

**package.json**:

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 8. 성능 테스트 (Phase 2)

### 8.1 Load Testing (k6)

**파일**: `load-tests/analyze-api.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    ticker: 'NVDA',
    mode: 'auto',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('https://safetynet-invest.vercel.app/api/analyze', payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(1);
}
```

**실행**:
```bash
k6 run load-tests/analyze-api.js
```

---

## 9. Manual Testing Checklist

### 9.1 Phase 1 Manual Tests

**기능 테스트**:
- [ ] 티커 입력 (대소문자 변환 확인)
- [ ] Auto 모드 - 실제 데이터 조회
- [ ] Manual 모드 - 모든 필드 입력
- [ ] 계산 결과 정확성 (수동 검증)
- [ ] 3가지 시나리오 모두 표시
- [ ] AI 인사이트 렌더링
- [ ] 민감도 분석 테이블
- [ ] Calculation Details 토글
- [ ] "Calculate Again" 버튼 동작

**UI/UX 테스트**:
- [ ] Desktop (Chrome, Safari, Firefox)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet (iPad)
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시
- [ ] 반응형 레이아웃

**성능 테스트**:
- [ ] 첫 로드 시간 < 2초
- [ ] API 응답 시간 < 3초 (캐시 미스)
- [ ] API 응답 시간 < 500ms (캐시 히트)
- [ ] Lighthouse Performance > 90

**보안 테스트**:
- [ ] Rate limiting 동작 (20회 초과 시 429)
- [ ] API 키 노출 여부 (브라우저 DevTools)
- [ ] XSS 방지 (입력값 sanitization)

---

### 9.2 Phase 2 Manual Tests

**인증 테스트**:
- [ ] 회원가입 플로우
- [ ] 이메일 인증
- [ ] 로그인/로그아웃
- [ ] 비밀번호 재설정
- [ ] Protected routes 차단

**포트폴리오 테스트**:
- [ ] 포트폴리오 생성/수정/삭제
- [ ] 종목 추가/수정/삭제
- [ ] 포트폴리오 요약 통계 정확성
- [ ] 다중 포트폴리오 관리

**데이터 테스트**:
- [ ] 자동 데이터 수집 정확성
- [ ] 히스토리 차트 렌더링
- [ ] Watchlist 알림 트리거

---

## 10. 테스트 데이터

### 10.1 Mock 종목 데이터

```typescript
// __tests__/fixtures/stocks.ts

export const MOCK_STOCKS = {
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    currentPrice: 877.50,
    eps: 25.30,
    historicalGrowth: 22.8,
    analystConsensus: 12.5,
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 185.50,
    eps: 6.15,
    historicalGrowth: 10.5,
    analystConsensus: 8.0,
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    currentPrice: 245.50,
    eps: 3.62,
    historicalGrowth: 45.0,
    analystConsensus: 25.0,
  },
};

export const MOCK_SCENARIOS = {
  conservative: { growthRate: 5.0, rationale: 'Conservative estimate' },
  neutral: { growthRate: 10.0, rationale: 'Neutral estimate' },
  optimistic: { growthRate: 15.0, rationale: 'Optimistic estimate' },
};
```

---

## 11. Bug Tracking

### 11.1 Bug 분류

| Severity | 정의 | 예시 |
|----------|------|------|
| **Critical** | 핵심 기능 동작 불가 | 계산 결과 오류, API 완전 실패 |
| **High** | 주요 기능 저하 | AI 인사이트 미표시, 캐싱 실패 |
| **Medium** | 부분 기능 오류 | 차트 렌더링 오류, 느린 응답 |
| **Low** | UI/UX 개선 사항 | 버튼 정렬, 텍스트 오타 |

### 11.2 Bug 템플릿

```markdown
## Bug Report

**Title**: [Clear, concise description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. Observe...

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- Browser: Chrome 120
- OS: macOS 14
- Device: Desktop

**Screenshots**:
[Attach if applicable]

**Additional Context**:
[Any other relevant information]
```

---

## 12. Checklist

### Phase 1 Testing Checklist

- [ ] Jest 및 Testing Library 설정 완료
- [ ] Graham 계산 유닛 테스트 (90% 커버리지)
- [ ] API Route Integration 테스트
- [ ] 컴포넌트 렌더링 테스트
- [ ] Manual 테스트 체크리스트 완료
- [ ] 10개 종목으로 실제 테스트
- [ ] Lighthouse 점수 > 90

### Phase 2 Testing Checklist

- [ ] Playwright 설정 완료
- [ ] E2E 핵심 플로우 테스트 (3개 이상)
- [ ] 포트폴리오 기능 E2E 테스트
- [ ] Load 테스트 (k6)
- [ ] 보안 테스트 (RLS, API 키)
- [ ] 베타 테스터 피드백 수집
- [ ] 모든 Critical/High bugs 해결

---

**문서 상태**: ✅ Ready for Development
**다음 단계**: 개발 시작! DEVELOPMENT_PLAN.md의 Day 1부터 시작
