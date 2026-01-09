# AI 통합 전략서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **AI Provider**: Anthropic Claude
- **Model**: Claude 3.5 Sonnet
- **API Version**: 2023-06-01

---

## 1. AI 통합 개요

### 1.1 사용 목적

SafetyNet에서 Claude API는 다음 3가지 핵심 기능을 수행합니다:

1. **데이터 수집 보조** (Auto Mode)
   - 웹 검색으로 최신 주가, EPS, 재무 데이터 조회
   - Financial Modeling Prep API 실패 시 fallback

2. **시나리오 생성**
   - 보수적/중립/낙관적 성장률 제안
   - 각 시나리오의 가정과 근거 제시

3. **투자 인사이트 생성**
   - 밸류에이션 해석
   - 리스크 및 기회 요인 분석
   - 실행 가능한 투자 권장사항

### 1.2 Claude 3.5 Sonnet 선택 이유

| 특성 | Claude 3.5 Sonnet | 대안 (GPT-4) |
|------|------------------|-------------|
| **Context Window** | 200K tokens | 128K tokens |
| **Web Search** | Native tool support | Requires plugin |
| **Financial Knowledge** | Strong (2024 cutoff) | Strong |
| **Cost** | $3/MTok input, $15/MTok output | $10/MTok input, $30/MTok output |
| **Latency** | ~2-5s | ~3-7s |
| **Accuracy** | Excellent for analysis | Excellent |

**결론**: Claude는 네이티브 웹 검색과 비용 효율성에서 우위

---

## 2. API 구조 설계

### 2.1 Claude Client 구현

**위치**: `src/lib/ai/claude.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ClaudeRequest {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  temperature?: number;
  tools?: Anthropic.Tool[];
}

export class ClaudeClient {
  async sendMessage(request: ClaudeRequest): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        system: request.system,
        messages: request.messages,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature || 0.3,
        tools: request.tools,
      });

      // Extract text content
      const textContent = response.content.find(
        (block) => block.type === 'text'
      );

      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new ClaudeAPIError(error);
    }
  }

  async sendMessageWithToolUse(
    request: ClaudeRequest
  ): Promise<{ text: string; toolResults: any[] }> {
    // For web search functionality
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      system: request.system,
      messages: request.messages,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.3,
      tools: request.tools || [
        {
          name: 'web_search',
          description: 'Search the web for current information',
          input_schema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
      ],
    });

    // Handle tool use responses
    const toolResults: any[] = [];
    let finalText = '';

    for (const block of response.content) {
      if (block.type === 'text') {
        finalText += block.text;
      } else if (block.type === 'tool_use') {
        toolResults.push(block);
      }
    }

    return { text: finalText, toolResults };
  }
}

export const claude = new ClaudeClient();
```

---

## 3. 프롬프트 템플릿

### 3.1 System Prompt (공통)

```typescript
// src/lib/ai/prompts.ts

export const SYSTEM_PROMPT = `You are a financial analyst assistant specialized in value investing and Benjamin Graham's principles.

Your responsibilities:
1. Provide accurate, data-driven financial analysis
2. Use conservative assumptions when uncertain
3. Clearly distinguish facts from opinions
4. Cite sources when using web-searched data
5. Avoid speculation and maintain professional tone

Key principles:
- Be concise (max 150 words per section unless specified)
- Use numbers and percentages to support claims
- Acknowledge limitations and uncertainties
- Never guarantee investment outcomes
- Always include risk factors

Output format: JSON when requested, markdown for text explanations.`;
```

---

### 3.2 Prompt #1: Data Collection (Auto Mode)

**용도**: 웹에서 최신 재무 데이터 조회

```typescript
export const createDataCollectionPrompt = (ticker: string): string => {
  return `Find the most recent financial data for stock ticker ${ticker}.

Required information:
1. Current stock price (as of today, ${new Date().toISOString().split('T')[0]})
2. Latest EPS (Earnings Per Share) - Trailing Twelve Months (TTM)
3. Historical EPS growth rate (average of past 3-5 years)
4. Analyst consensus growth forecast (next 3-5 years)
5. Most recent earnings report highlights (last quarter)
6. Key industry trends affecting this company

Search the web for the most accurate and up-to-date information.
Use sources like:
- Yahoo Finance
- Seeking Alpha
- Company investor relations
- Financial news sites

Return the data in this JSON format:
{
  "ticker": "${ticker}",
  "companyName": "Full company name",
  "currentPrice": number,
  "eps": number,
  "historicalGrowth": number (percentage),
  "analystConsensus": number (percentage),
  "earningsHighlights": "Brief summary (max 100 words)",
  "industryTrends": "Brief summary (max 100 words)",
  "sources": ["url1", "url2"],
  "dataDate": "YYYY-MM-DD"
}

If you cannot find reliable data for any field, set it to null and explain in a "notes" field.`;
};
```

**예상 응답**:
```json
{
  "ticker": "NVDA",
  "companyName": "NVIDIA Corporation",
  "currentPrice": 877.50,
  "eps": 25.30,
  "historicalGrowth": 22.8,
  "analystConsensus": 12.5,
  "earningsHighlights": "Q3 2025 revenue of $35.1B, up 94% YoY. Data center revenue reached $30.8B. Guidance for Q4: $37.5B revenue.",
  "industryTrends": "AI chip demand remains strong. Competition from AMD and custom chips increasing. Export restrictions to China create headwinds.",
  "sources": [
    "https://investor.nvidia.com",
    "https://finance.yahoo.com/quote/NVDA"
  ],
  "dataDate": "2026-01-09"
}
```

---

### 3.3 Prompt #2: Scenario Generation

**용도**: 보수적/중립/낙관적 성장률 제안

```typescript
export const createScenarioPrompt = (data: {
  ticker: string;
  currentPrice: number;
  eps: number;
  historicalGrowth: number;
  analystConsensus: number;
  industryTrends: string;
}): string => {
  return `Based on the following data for ${data.ticker}, suggest THREE growth rate scenarios for Graham's intrinsic value calculation.

Company Data:
- Current Price: $${data.currentPrice}
- EPS (TTM): $${data.eps}
- Historical Growth (3-5yr avg): ${data.historicalGrowth}%
- Analyst Consensus: ${data.analystConsensus}%
- Industry Context: ${data.industryTrends}

Generate three scenarios:

1. **Conservative Scenario**
   - Assumes: Economic downturn, increased competition, market headwinds
   - Growth rate: Use the LOWER of (historical growth × 0.5) or 5%
   - Rationale: What specific risks justify this conservative estimate?

2. **Neutral Scenario**
   - Assumes: Current trends continue, no major disruptions
   - Growth rate: Use analyst consensus OR historical average (whichever is more reasonable)
   - Rationale: Why is this the "base case"?

3. **Optimistic Scenario**
   - Assumes: Market expansion, increased market share, favorable trends
   - Growth rate: Use the HIGHER of (historical max) or (analyst high estimate)
   - But cap at 25% unless there's exceptional justification
   - Rationale: What tailwinds could drive this growth?

Return in JSON format:
{
  "scenarios": [
    {
      "type": "conservative",
      "growthRate": number,
      "rationale": "string (max 80 words)"
    },
    {
      "type": "neutral",
      "growthRate": number,
      "rationale": "string (max 80 words)"
    },
    {
      "type": "optimistic",
      "growthRate": number,
      "rationale": "string (max 80 words)"
    }
  ]
}

Important: Be realistic. Avoid overly optimistic or pessimistic extremes.`;
};
```

**예상 응답**:
```json
{
  "scenarios": [
    {
      "type": "conservative",
      "growthRate": 5.0,
      "rationale": "Economic uncertainty and potential AI chip market saturation could slow growth. Competition from AMD and custom hyperscaler chips poses risk. China export restrictions limit TAM."
    },
    {
      "type": "neutral",
      "growthRate": 12.5,
      "rationale": "Based on analyst consensus. Assumes continued datacenter AI adoption and strong demand for H100/B100 chips. CUDA ecosystem provides competitive moat."
    },
    {
      "type": "optimistic",
      "growthRate": 18.0,
      "rationale": "Accelerated AI adoption across industries, expansion into automotive/robotics, and successful launch of next-gen Blackwell architecture could drive exceptional growth."
    }
  ]
}
```

---

### 3.4 Prompt #3: Investment Insights

**용도**: 밸류에이션 해석 및 투자 권장

```typescript
export const createInsightsPrompt = (data: {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  scenarios: Scenario[];
  earningsHighlights: string;
  industryTrends: string;
}): string => {
  return `You are analyzing ${data.companyName} (${data.ticker}) as an investment opportunity using Benjamin Graham's margin of safety principle.

Current Valuation:
- Stock Price: $${data.currentPrice}
- EPS (TTM): $${data.eps}
- P/E Ratio: ${(data.currentPrice / data.eps).toFixed(1)}x

Graham Intrinsic Value Calculations:
${data.scenarios.map(s =>
  `- ${s.type}: $${s.intrinsicValue.toFixed(2)} (Margin of Safety: ${s.marginOfSafety >= 0 ? '+' : ''}${s.marginOfSafety.toFixed(1)}%)`
).join('\n')}

Recent Context:
- Earnings: ${data.earningsHighlights}
- Industry: ${data.industryTrends}

Provide a comprehensive investment analysis in the following JSON format:
{
  "summary": "string (100-150 words) - Overall valuation assessment",
  "keyFactors": [
    "string (max 50 words each)"
  ], // 3-5 bullish factors
  "risks": [
    "string (max 50 words each)"
  ], // 3-5 risk factors
  "opportunities": [
    "string (max 50 words each)"
  ], // 2-4 growth opportunities
  "recommendation": {
    "action": "buy" | "hold" | "wait" | "sell",
    "reasoning": "string (80-120 words)",
    "targetPrice": number | null (if action is "buy" or "wait")
  }
}

Guidelines for recommendation:
- "buy": Margin of safety > 20% in neutral scenario
- "wait": Margin of safety < 0% but company fundamentals strong
- "hold": Currently own, margin of safety 0-20%
- "sell": Margin of safety < -30% in conservative scenario

Be balanced and objective. Acknowledge both bull and bear cases.`;
};
```

**예상 응답**:
```json
{
  "summary": "NVIDIA is currently trading at a significant premium to its Graham intrinsic value across conservative and neutral scenarios, suggesting overvaluation. While the company demonstrates exceptional growth in AI-driven datacenter revenue and maintains strong competitive positioning through its CUDA ecosystem, the current 35x P/E ratio reflects high growth expectations already priced in. Value investors seeking a margin of safety should wait for a more attractive entry point.",
  "keyFactors": [
    "Q3 2025 revenue growth of 94% YoY demonstrates exceptional demand for AI chips",
    "Data center segment revenue of $30.8B shows strong enterprise AI adoption",
    "CUDA software ecosystem creates significant switching costs and competitive moat",
    "Strong gross margins above 70% indicate pricing power and technological leadership"
  ],
  "risks": [
    "Valuation multiples at historic highs (P/E 35x vs. 5-year average of 25x)",
    "Growing competition from AMD and custom hyperscaler chips threatens market share",
    "China export restrictions limit addressable market and future growth potential",
    "Potential AI investment slowdown if ROI expectations not met by customers"
  ],
  "opportunities": [
    "Expanding TAM in AI inference market as models move to production",
    "Automotive and robotics segments showing early traction with long-term potential",
    "Next-generation Blackwell architecture could extend technology lead"
  ],
  "recommendation": {
    "action": "wait",
    "reasoning": "Despite strong fundamentals and market leadership, NVIDIA trades 15-29% above intrinsic value in our conservative and neutral scenarios. Value-oriented investors should wait for a 15-20% pullback to enter at a more attractive risk/reward ratio. Consider establishing a watchlist alert for prices approaching $700-$740 range where neutral scenario margin of safety becomes positive.",
    "targetPrice": 720.00
  }
}
```

---

## 4. API 호출 플로우

### 4.1 Sequential Flow (현재 구현)

```typescript
// src/app/api/analyze/route.ts

export async function POST(request: Request) {
  const { ticker, mode, data } = await request.json();

  let stockData;

  if (mode === 'auto') {
    // Step 1: Try FMP API first
    try {
      stockData = await fmpClient.getStockData(ticker);
    } catch (error) {
      // Step 2: Fallback to Claude web search
      const prompt = createDataCollectionPrompt(ticker);
      const claudeResponse = await claude.sendMessageWithToolUse({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      });
      stockData = JSON.parse(claudeResponse.text);
    }
  } else {
    stockData = { ...data, ticker };
  }

  // Step 3: Generate scenarios
  const scenarioPrompt = createScenarioPrompt(stockData);
  const scenarioResponse = await claude.sendMessage({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: scenarioPrompt }],
    temperature: 0.3, // Lower temp for consistent financial analysis
  });
  const scenarios = JSON.parse(scenarioResponse);

  // Step 4: Calculate intrinsic values
  const calculatedScenarios = scenarios.scenarios.map((scenario: any) => {
    const intrinsicValue = calculateGrahamValue(
      stockData.eps,
      scenario.growthRate
    );
    const marginOfSafety =
      ((intrinsicValue - stockData.currentPrice) / stockData.currentPrice) * 100;

    return {
      ...scenario,
      intrinsicValue,
      marginOfSafety,
      recommendation: getRecommendation(marginOfSafety),
    };
  });

  // Step 5: Generate insights
  const insightsPrompt = createInsightsPrompt({
    ...stockData,
    scenarios: calculatedScenarios,
  });
  const insightsResponse = await claude.sendMessage({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: insightsPrompt }],
    temperature: 0.5, // Slightly higher for creative analysis
  });
  const insights = JSON.parse(insightsResponse);

  // Step 6: Cache and return
  await cache.set(cacheKey, result, { ttl: 3600 });

  return NextResponse.json({
    ticker: stockData.ticker,
    companyName: stockData.companyName,
    currentPrice: stockData.currentPrice,
    eps: stockData.eps,
    scenarios: calculatedScenarios,
    insights,
    metadata: {
      calculationMethod: 'graham_v1',
      dataSource: mode === 'auto' ? 'fmp_api' : 'manual',
      cacheHit: false,
      processingTime: Date.now() - startTime,
    },
  });
}
```

---

### 4.2 Parallel Flow (최적화 - Phase 2)

```typescript
// Optimize by running scenarios and insights generation in parallel

const [scenariosResult, earningsContext] = await Promise.all([
  claude.sendMessage({ /* scenario prompt */ }),
  claude.sendMessage({ /* earnings analysis prompt */ }),
]);

// Then combine for final insights
const insights = await claude.sendMessage({
  system: SYSTEM_PROMPT,
  messages: [
    { role: 'user', content: createInsightsPrompt({ ...data, scenarios }) },
  ],
});
```

---

## 5. 에러 처리

### 5.1 Claude API 에러 타입

```typescript
// src/lib/ai/errors.ts

export class ClaudeAPIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }

  static fromAnthropicError(error: any): ClaudeAPIError {
    if (error.status === 429) {
      return new ClaudeAPIError(
        'RATE_LIMIT_EXCEEDED',
        'Claude API rate limit exceeded. Please try again later.',
        error
      );
    }
    if (error.status === 401) {
      return new ClaudeAPIError(
        'INVALID_API_KEY',
        'Invalid Anthropic API key.',
        error
      );
    }
    if (error.status >= 500) {
      return new ClaudeAPIError(
        'ANTHROPIC_SERVER_ERROR',
        'Anthropic service is temporarily unavailable.',
        error
      );
    }
    return new ClaudeAPIError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred with Claude API.',
      error
    );
  }
}
```

### 5.2 Fallback 전략

```typescript
async function getStockDataWithFallback(ticker: string) {
  // Try 1: FMP API
  try {
    return await fmpClient.getStockData(ticker);
  } catch (error) {
    logger.warn('FMP API failed, trying Claude web search', { ticker });
  }

  // Try 2: Claude web search
  try {
    const response = await claude.sendMessageWithToolUse({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: createDataCollectionPrompt(ticker) }],
    });
    return JSON.parse(response.text);
  } catch (error) {
    logger.error('Claude web search failed', { ticker, error });
  }

  // Try 3: Return partial data, prompt user for manual input
  return {
    ticker,
    error: 'UNABLE_TO_FETCH_DATA',
    message: 'Please use manual input mode to provide financial data.',
  };
}
```

---

## 6. 프롬프트 최적화 전략

### 6.1 Few-Shot Examples (필요 시)

```typescript
const EXAMPLE_ANALYSIS = `Example of good analysis:

Company: Apple Inc. (AAPL)
Current Price: $185.50
EPS: $6.15
Margin of Safety (Neutral): +12.3%

Summary: Apple trades slightly below its intrinsic value, offering a modest margin of safety. The company's strong ecosystem, services growth, and capital return program support valuation, but slowing iPhone sales and China headwinds present risks...

(Include in system prompt if Claude's outputs are inconsistent)`;
```

### 6.2 Temperature Settings

| Task | Temperature | Reasoning |
|------|------------|-----------|
| Data Extraction | 0.1 | Needs to be factual, no creativity |
| Scenario Generation | 0.3 | Some judgment, but conservative |
| Insights Writing | 0.5 | Balance between creativity and rigor |

### 6.3 Token Budget

| Prompt Type | Max Input Tokens | Max Output Tokens | Estimated Cost |
|-------------|-----------------|-------------------|----------------|
| Data Collection | 500 | 1,000 | $0.018 |
| Scenario Generation | 800 | 800 | $0.014 |
| Insights | 1,500 | 1,500 | $0.027 |
| **Total per analysis** | **2,800** | **3,300** | **~$0.06** |

**월간 비용 추정** (100 users, 각 10 analyses):
- 1,000 analyses × $0.06 = **$60/month**

---

## 7. 캐싱 전략

### 7.1 Claude 응답 캐싱

```typescript
// Cache Claude responses to avoid redundant API calls

const cacheKey = `claude:insights:${ticker}:${hash(scenarios)}`;

// Check cache first
const cached = await kv.get(cacheKey);
if (cached) {
  return cached;
}

// Call Claude
const insights = await claude.sendMessage({ /* ... */ });

// Cache for 7 days (insights don't change frequently)
await kv.set(cacheKey, insights, { ex: 7 * 24 * 60 * 60 });

return insights;
```

### 7.2 캐시 무효화

- 사용자가 "Refresh" 버튼 클릭
- 새로운 실적 발표 (earnings release)
- 주가 10% 이상 변동

---

## 8. 모니터링 & 로깅

### 8.1 로깅할 메트릭

```typescript
// src/lib/ai/logger.ts

export function logClaudeRequest(data: {
  ticker: string;
  promptType: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  success: boolean;
  error?: string;
}) {
  console.log('[Claude API]', {
    ...data,
    timestamp: new Date().toISOString(),
    cost: calculateCost(data.inputTokens, data.outputTokens),
  });

  // Send to analytics service (Vercel Analytics, Sentry, etc.)
}
```

### 8.2 추적할 KPIs

- **Success Rate**: API 호출 성공률 (목표: >95%)
- **Latency**: 평균 응답 시간 (목표: <5s)
- **Token Usage**: 일일 토큰 사용량
- **Cost**: 일일/월간 API 비용
- **Cache Hit Rate**: 캐시 적중률 (목표: >60%)

---

## 9. 테스트 전략

### 9.1 Unit Tests

```typescript
// __tests__/lib/ai/claude.test.ts

describe('ClaudeClient', () => {
  it('should extract stock data from response', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ticker: 'NVDA',
            currentPrice: 877.50,
            eps: 25.30,
          }),
        },
      ],
    };

    // Mock anthropic.messages.create
    jest.spyOn(anthropic.messages, 'create').mockResolvedValue(mockResponse);

    const result = await claude.sendMessage({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(JSON.parse(result)).toHaveProperty('ticker', 'NVDA');
  });
});
```

### 9.2 Integration Tests

```typescript
// __tests__/api/analyze.test.ts

describe('POST /api/analyze', () => {
  it('should generate insights using Claude', async () => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        ticker: 'AAPL',
        mode: 'auto',
      }),
    });

    const data = await response.json();
    expect(data.insights).toHaveProperty('summary');
    expect(data.insights.recommendation.action).toMatch(/buy|hold|wait|sell/);
  });
});
```

---

## 10. 보안 고려사항

### 10.1 API 키 관리

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Vercel에서는 환경 변수로 등록
# Production과 Preview 환경 분리
```

### 10.2 Rate Limiting

```typescript
// Prevent abuse
const rateLimitKey = `ratelimit:claude:${userId || ip}`;
const { success } = await ratelimit.limit(rateLimitKey);

if (!success) {
  return NextResponse.json(
    { error: 'Too many AI requests' },
    { status: 429 }
  );
}
```

### 10.3 Input Sanitization

```typescript
// Prevent prompt injection
function sanitizeInput(input: string): string {
  // Remove potential prompt injection patterns
  return input
    .replace(/```/g, '')           // Remove code blocks
    .replace(/<\|.*?\|>/g, '')     // Remove special tokens
    .slice(0, 1000);               // Limit length
}
```

---

## 11. Phase 2 고급 기능

### 11.1 대화형 분석 (Conversational Follow-ups)

```typescript
// Allow users to ask follow-up questions

const conversationHistory = [
  { role: 'user', content: 'Analyze NVDA' },
  { role: 'assistant', content: previousInsights },
  { role: 'user', content: 'What if growth rate drops to 5%?' },
];

const followUpResponse = await claude.sendMessage({
  system: SYSTEM_PROMPT,
  messages: conversationHistory,
});
```

### 11.2 포트폴리오 전체 분석

```typescript
// Analyze entire portfolio at once

const portfolioPrompt = `Analyze this portfolio of stocks:
${holdings.map(h => `${h.ticker}: ${h.shares} shares at $${h.avgCost}`).join('\n')}

Provide:
1. Overall portfolio risk assessment
2. Diversification analysis
3. Overvalued/undervalued positions
4. Rebalancing suggestions`;
```

---

## 12. Checklist

### Phase 1 구현 완료 기준

- [ ] ClaudeClient 클래스 구현
- [ ] 3가지 프롬프트 템플릿 작성
- [ ] 데이터 수집 fallback 로직
- [ ] 시나리오 생성 자동화
- [ ] 인사이트 JSON 파싱
- [ ] 에러 핸들링 및 로깅
- [ ] 응답 캐싱 (Vercel KV)
- [ ] 비용 모니터링 대시보드

### Phase 2 확장

- [ ] 대화형 follow-up 질문
- [ ] 포트폴리오 전체 분석
- [ ] 히스토리 기반 인사이트 개선
- [ ] 다국어 지원 (한글)

---

**문서 상태**: ✅ Ready for Development
**다음 단계**: DATABASE_SCHEMA.md 참조
