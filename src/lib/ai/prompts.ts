/**
 * Prompt Templates for Claude AI
 *
 * Contains all system prompts and user prompts for different analysis tasks.
 */

/**
 * System prompt used across all Claude interactions
 */
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

/**
 * Create a prompt for collecting stock data (Auto Mode)
 * @param ticker - Stock ticker symbol
 * @returns Formatted prompt for data collection
 */
export const createDataCollectionPrompt = (ticker: string): string => {
  const today = new Date().toISOString().split('T')[0];

  return `Find the most recent financial data for stock ticker ${ticker}.

Required information:
1. Company full name
2. Current stock price (as of today, ${today})
3. Latest EPS (Earnings Per Share) - Trailing Twelve Months (TTM)
4. Historical EPS growth rate (average of past 3-5 years, as percentage)
5. Analyst consensus growth forecast for next 3-5 years (as percentage, if available)

Search the web for the most accurate and up-to-date information.
Use sources like Yahoo Finance, Seeking Alpha, company investor relations, or financial news sites.

Return the data in this exact JSON format:
{
  "ticker": "${ticker}",
  "companyName": "Full company name",
  "currentPrice": number,
  "eps": number,
  "historicalGrowth": number (percentage, e.g., 12.5 for 12.5%),
  "analystConsensus": number or null (percentage),
  "dataDate": "${today}",
  "sources": ["url1", "url2"]
}

If you cannot find reliable data for any field, set it to null and explain why in the response.
Be precise with numbers - use actual values, not estimates.`;
};

/**
 * Create a prompt for generating investment scenarios
 * @param data - Stock data for scenario generation
 * @returns Formatted prompt for scenario generation
 */
export const createScenarioPrompt = (data: {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  historicalGrowth: number;
  analystConsensus: number | null;
}): string => {
  return `Based on the following data for ${data.ticker} (${data.companyName}), suggest growth rate assumptions for THREE scenarios to use in Graham's intrinsic value calculation.

Company Data:
- Current Price: $${data.currentPrice.toFixed(2)}
- EPS (TTM): $${data.eps.toFixed(2)}
- Historical Growth (3-5yr avg): ${data.historicalGrowth.toFixed(1)}%
${data.analystConsensus !== null ? `- Analyst Consensus: ${data.analystConsensus.toFixed(1)}%` : '- Analyst Consensus: Not available'}

Generate three scenarios with REALISTIC growth rate assumptions:

1. **Conservative Scenario**
   - Assumes: Economic downturn, increased competition, market headwinds
   - Growth rate: Use 50% of historical growth, but cap at maximum 5%
   - Provide rationale (max 80 words)

2. **Neutral Scenario**
   - Assumes: Current trends continue, no major disruptions
   - Growth rate: Use analyst consensus if available, otherwise use historical growth
   - Provide rationale (max 80 words)

3. **Optimistic Scenario**
   - Assumes: Market expansion, increased market share, favorable trends
   - Growth rate: Use higher of historical growth or analyst consensus
   - Cap at maximum 25% unless there's exceptional justification
   - Provide rationale (max 80 words)

Return in this exact JSON format:
{
  "scenarios": [
    {
      "type": "conservative",
      "growthRate": number (percentage, e.g., 5.0 for 5%),
      "rationale": "string"
    },
    {
      "type": "neutral",
      "growthRate": number,
      "rationale": "string"
    },
    {
      "type": "optimistic",
      "growthRate": number,
      "rationale": "string"
    }
  ]
}

Important: Be realistic and avoid extremes. All growth rates should be reasonable given the company's size and industry.`;
};

/**
 * Create a prompt for generating investment insights
 * @param data - Complete analysis data for insights generation
 * @returns Formatted prompt for insights generation
 */
export const createInsightsPrompt = (data: {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  scenarios: Array<{
    type: string;
    growthRate: number;
    intrinsicValue: number;
    marginOfSafety: number;
    recommendation: string;
  }>;
}): string => {
  const scenariosSummary = data.scenarios
    .map(
      (s) =>
        `- ${s.type}: IV=$${s.intrinsicValue.toFixed(2)}, MoS=${s.marginOfSafety.toFixed(1)}%, ${s.recommendation}`
    )
    .join('\n');

  return `Based on Graham's margin of safety analysis for ${data.ticker} (${data.companyName}), provide investment insights.

Analysis Results:
- Current Price: $${data.currentPrice.toFixed(2)}
- EPS: $${data.eps.toFixed(2)}

Scenarios:
${scenariosSummary}

Provide a comprehensive yet concise investment analysis in the following JSON format:

{
  "summary": "string (max 150 words - overall investment thesis and valuation summary)",
  "keyFactors": [
    "string (factor 1)",
    "string (factor 2)",
    "string (factor 3)"
  ],
  "risks": [
    "string (risk 1)",
    "string (risk 2)",
    "string (risk 3)"
  ],
  "opportunities": [
    "string (opportunity 1)",
    "string (opportunity 2)"
  ],
  "recommendation": "string (max 100 words - actionable guidance based on Graham's principles)"
}

Guidelines:
- Be balanced and objective
- Focus on Graham's value investing principles
- Acknowledge both upside and downside
- Do not make specific buy/sell recommendations
- Include disclaimer that this is educational analysis only`;
};

/**
 * Create a fallback prompt when data collection fails
 * Used when auto mode cannot fetch data
 */
export const FALLBACK_DATA_PROMPT = `I was unable to fetch reliable financial data for this stock ticker.

This could be due to:
1. Invalid or delisted ticker symbol
2. Temporary issues with financial data sources
3. The stock is not publicly traded in major exchanges

Please try:
- Verifying the ticker symbol is correct
- Using Manual Mode to enter data yourself
- Trying again in a few moments

Would you like to switch to Manual Mode to enter the data yourself?`;
