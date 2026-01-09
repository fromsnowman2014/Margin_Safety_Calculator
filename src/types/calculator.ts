// Graham's Formula Types

export type ScenarioType = 'conservative' | 'neutral' | 'optimistic';

export type RecommendationType = 'undervalued' | 'fairly_valued' | 'overvalued';

export interface ScenarioAssumptions {
  growthRate: number;
  rationale: string;
}

export interface Scenario {
  type: ScenarioType;
  assumptions: ScenarioAssumptions;
  intrinsicValue: number;
  marginOfSafety: number;
  recommendation: RecommendationType;
}

export interface StockData {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  historicalGrowth?: number;
  analystConsensus?: number;
}

export interface CalculationResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  scenarios: Scenario[];
  lastUpdated: string;
}
