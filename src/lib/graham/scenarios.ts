/**
 * Scenario Generation Logic
 *
 * Generates Conservative, Neutral, and Optimistic scenarios for Graham calculations
 * based on historical data and analyst consensus.
 */

import type { ScenarioType, ScenarioAssumptions, Scenario } from '@/types/calculator';
import {
  calculateIntrinsicValue,
  calculateMarginOfSafety,
  getRecommendation,
} from './calculator';

interface ScenarioInput {
  eps: number;
  currentPrice: number;
  historicalGrowth: number;
  analystConsensus?: number;
  analystHigh?: number;
  analystLow?: number;
}

/**
 * Generate Conservative scenario growth rate
 * Conservative: Uses 50% of historical growth, capped at 5%
 */
function getConservativeGrowth(historicalGrowth: number): number {
  const conservative = historicalGrowth * 0.5;
  return Math.min(conservative, 5.0);
}

/**
 * Generate Neutral scenario growth rate
 * Neutral: Uses analyst consensus if available, otherwise historical average
 */
function getNeutralGrowth(
  historicalGrowth: number,
  analystConsensus?: number
): number {
  return analystConsensus ?? historicalGrowth;
}

/**
 * Generate Optimistic scenario growth rate
 * Optimistic: Uses max of historical or analyst high, capped at 25%
 */
function getOptimisticGrowth(
  historicalGrowth: number,
  analystHigh?: number
): number {
  const optimistic = Math.max(historicalGrowth, analystHigh ?? historicalGrowth);
  return Math.min(optimistic, 25.0);
}

/**
 * Create a single scenario with calculations
 */
function createScenario(
  type: ScenarioType,
  growthRate: number,
  eps: number,
  currentPrice: number
): Scenario {
  const intrinsicValue = calculateIntrinsicValue(eps, growthRate);
  const marginOfSafety = calculateMarginOfSafety(intrinsicValue, currentPrice);
  const recommendation = getRecommendation(marginOfSafety);

  const assumptions: ScenarioAssumptions = {
    growthRate,
    eps,
    peRatio: 8.5 + 2 * growthRate,
  };

  return {
    type,
    assumptions,
    intrinsicValue,
    marginOfSafety,
    recommendation,
  };
}

/**
 * Generate all three scenarios (Conservative, Neutral, Optimistic)
 * @param input - Stock data including EPS, price, and growth estimates
 * @returns Array of three scenarios
 */
export function generateScenarios(input: ScenarioInput): Scenario[] {
  const { eps, currentPrice, historicalGrowth, analystConsensus, analystHigh } = input;

  // Generate growth rates for each scenario
  const conservativeGrowth = getConservativeGrowth(historicalGrowth);
  const neutralGrowth = getNeutralGrowth(historicalGrowth, analystConsensus);
  const optimisticGrowth = getOptimisticGrowth(historicalGrowth, analystHigh);

  // Create scenarios
  const scenarios: Scenario[] = [
    createScenario('conservative', conservativeGrowth, eps, currentPrice),
    createScenario('neutral', neutralGrowth, eps, currentPrice),
    createScenario('optimistic', optimisticGrowth, eps, currentPrice),
  ];

  return scenarios;
}

/**
 * Get scenario assumptions only (without calculations)
 * Useful for displaying assumptions before calculation
 */
export function getScenarioAssumptions(input: ScenarioInput): {
  conservative: ScenarioAssumptions;
  neutral: ScenarioAssumptions;
  optimistic: ScenarioAssumptions;
} {
  const { eps, historicalGrowth, analystConsensus, analystHigh } = input;

  const conservativeGrowth = getConservativeGrowth(historicalGrowth);
  const neutralGrowth = getNeutralGrowth(historicalGrowth, analystConsensus);
  const optimisticGrowth = getOptimisticGrowth(historicalGrowth, analystHigh);

  return {
    conservative: {
      growthRate: conservativeGrowth,
      eps,
      peRatio: 8.5 + 2 * conservativeGrowth,
    },
    neutral: {
      growthRate: neutralGrowth,
      eps,
      peRatio: 8.5 + 2 * neutralGrowth,
    },
    optimistic: {
      growthRate: optimisticGrowth,
      eps,
      peRatio: 8.5 + 2 * optimisticGrowth,
    },
  };
}
