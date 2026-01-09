import { Scenario } from './calculator';

// API Request Types

export interface AnalyzeRequest {
  ticker: string;
  mode: 'auto' | 'manual';
  data?: {
    currentPrice?: number;
    eps?: number;
    historicalGrowth?: number;
  };
}

// API Response Types

export interface AIInsights {
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

export interface ResponseMetadata {
  calculationMethod: 'graham_v1' | 'graham_v2';
  dataSource: 'fmp_api' | 'manual' | 'cache';
  cacheHit: boolean;
  processingTime: number;
}

export interface AnalyzeResponse {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  lastUpdated: string;
  scenarios: Scenario[];
  insights?: AIInsights;
  metadata: ResponseMetadata;
}

// API Error Types

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    retryAfter?: number;
  };
}
