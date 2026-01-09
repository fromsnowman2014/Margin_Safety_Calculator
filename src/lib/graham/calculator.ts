/**
 * Graham Calculation Engine
 *
 * Implements Benjamin Graham's intrinsic value formula and margin of safety calculations.
 * Formula: Intrinsic Value = EPS × (8.5 + 2g)
 * Where:
 * - EPS = Earnings Per Share
 * - g = Expected annual growth rate (%)
 * - 8.5 = P/E ratio of a no-growth company
 */

import type { RecommendationType } from '@/types/calculator';

/**
 * Calculate intrinsic value using Graham's formula
 * @param eps - Earnings Per Share (trailing twelve months)
 * @param growthRate - Expected annual growth rate in percentage (e.g., 10 for 10%)
 * @returns Intrinsic value per share
 */
export function calculateIntrinsicValue(eps: number, growthRate: number): number {
  // V1: IV = EPS × (8.5 + 2g)
  // Graham's simplified formula
  return eps * (8.5 + 2 * growthRate);
}

/**
 * Calculate margin of safety percentage
 * @param intrinsicValue - Calculated intrinsic value per share
 * @param currentPrice - Current market price per share
 * @returns Margin of safety as percentage
 */
export function calculateMarginOfSafety(
  intrinsicValue: number,
  currentPrice: number
): number {
  if (currentPrice <= 0) {
    throw new Error('Current price must be greater than 0');
  }

  // MoS = ((IV - Price) / Price) × 100
  return ((intrinsicValue - currentPrice) / currentPrice) * 100;
}

/**
 * Get investment recommendation based on margin of safety
 * @param marginOfSafety - Calculated margin of safety percentage
 * @returns Recommendation type
 */
export function getRecommendation(marginOfSafety: number): RecommendationType {
  // Graham recommended 30%+ margin for stocks
  if (marginOfSafety >= 30) return 'undervalued';

  // Between 0-30%: fairly valued (proceed with caution)
  if (marginOfSafety >= 0) return 'fairly_valued';

  // Negative margin: overvalued
  return 'overvalued';
}

/**
 * Validate input parameters for calculations
 * @param eps - Earnings Per Share
 * @param growthRate - Growth rate percentage
 * @param currentPrice - Current stock price
 * @throws Error if any parameter is invalid
 */
export function validateCalculationInputs(
  eps: number,
  growthRate: number,
  currentPrice: number
): void {
  if (eps <= 0) {
    throw new Error('EPS must be greater than 0');
  }

  if (growthRate < 0) {
    throw new Error('Growth rate cannot be negative');
  }

  if (growthRate > 100) {
    throw new Error('Growth rate cannot exceed 100%');
  }

  if (currentPrice <= 0) {
    throw new Error('Current price must be greater than 0');
  }
}
