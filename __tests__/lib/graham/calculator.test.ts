/**
 * Unit Tests for Graham Calculator
 *
 * Tests the core Graham calculation functions including:
 * - Intrinsic value calculation
 * - Margin of safety calculation
 * - Investment recommendation logic
 */

import {
  calculateIntrinsicValue,
  calculateMarginOfSafety,
  getRecommendation,
  validateCalculationInputs,
} from '@/lib/graham/calculator';

describe('calculateIntrinsicValue', () => {
  it('should calculate correctly for NVDA example', () => {
    // Real-world example: NVIDIA
    const eps = 25.30;
    const growthRate = 10.0;
    const result = calculateIntrinsicValue(eps, growthRate);

    // IV = 25.30 × (8.5 + 2 × 10) = 25.30 × 28.5 = 721.05
    expect(result).toBeCloseTo(721.05, 2);
  });

  it('should calculate correctly for zero growth', () => {
    const eps = 5.0;
    const growthRate = 0;
    const result = calculateIntrinsicValue(eps, growthRate);

    // IV = 5.0 × (8.5 + 0) = 42.5
    expect(result).toBe(42.5);
  });

  it('should calculate correctly for high growth', () => {
    const eps = 10.0;
    const growthRate = 20.0;
    const result = calculateIntrinsicValue(eps, growthRate);

    // IV = 10.0 × (8.5 + 2 × 20) = 10.0 × 48.5 = 485.0
    expect(result).toBe(485.0);
  });

  it('should handle decimal growth rates', () => {
    const eps = 3.5;
    const growthRate = 7.5;
    const result = calculateIntrinsicValue(eps, growthRate);

    // IV = 3.5 × (8.5 + 2 × 7.5) = 3.5 × 23.5 = 82.25
    expect(result).toBeCloseTo(82.25, 2);
  });
});

describe('calculateMarginOfSafety', () => {
  it('should calculate positive margin (undervalued)', () => {
    const intrinsicValue = 100;
    const currentPrice = 70;
    const result = calculateMarginOfSafety(intrinsicValue, currentPrice);

    // MoS = ((100 - 70) / 70) × 100 = 42.857%
    expect(result).toBeCloseTo(42.857, 2);
  });

  it('should calculate negative margin (overvalued)', () => {
    const intrinsicValue = 70;
    const currentPrice = 100;
    const result = calculateMarginOfSafety(intrinsicValue, currentPrice);

    // MoS = ((70 - 100) / 100) × 100 = -30%
    expect(result).toBeCloseTo(-30, 2);
  });

  it('should calculate zero margin (fairly valued)', () => {
    const intrinsicValue = 100;
    const currentPrice = 100;
    const result = calculateMarginOfSafety(intrinsicValue, currentPrice);

    // MoS = ((100 - 100) / 100) × 100 = 0%
    expect(result).toBe(0);
  });

  it('should throw error for zero current price', () => {
    const intrinsicValue = 100;
    const currentPrice = 0;

    expect(() => {
      calculateMarginOfSafety(intrinsicValue, currentPrice);
    }).toThrow('Current price must be greater than 0');
  });

  it('should throw error for negative current price', () => {
    const intrinsicValue = 100;
    const currentPrice = -50;

    expect(() => {
      calculateMarginOfSafety(intrinsicValue, currentPrice);
    }).toThrow('Current price must be greater than 0');
  });

  it('should calculate correctly for NVDA example', () => {
    // Using NVDA example from development plan
    const intrinsicValue = 721.05;
    const currentPrice = 500;
    const result = calculateMarginOfSafety(intrinsicValue, currentPrice);

    // MoS = ((721.05 - 500) / 500) × 100 = 44.21%
    expect(result).toBeCloseTo(44.21, 2);
  });
});

describe('getRecommendation', () => {
  it('should return undervalued for 30%+ margin', () => {
    expect(getRecommendation(30)).toBe('undervalued');
    expect(getRecommendation(40)).toBe('undervalued');
    expect(getRecommendation(100)).toBe('undervalued');
  });

  it('should return fairly_valued for 0-30% margin', () => {
    expect(getRecommendation(0)).toBe('fairly_valued');
    expect(getRecommendation(15)).toBe('fairly_valued');
    expect(getRecommendation(29.9)).toBe('fairly_valued');
  });

  it('should return overvalued for negative margin', () => {
    expect(getRecommendation(-0.1)).toBe('overvalued');
    expect(getRecommendation(-10)).toBe('overvalued');
    expect(getRecommendation(-50)).toBe('overvalued');
  });

  it('should handle edge cases at boundaries', () => {
    expect(getRecommendation(30.0)).toBe('undervalued');
    expect(getRecommendation(29.99)).toBe('fairly_valued');
    expect(getRecommendation(0.0)).toBe('fairly_valued');
    expect(getRecommendation(-0.01)).toBe('overvalued');
  });
});

describe('validateCalculationInputs', () => {
  it('should pass for valid inputs', () => {
    expect(() => {
      validateCalculationInputs(25.30, 10.0, 500);
    }).not.toThrow();
  });

  it('should throw for zero EPS', () => {
    expect(() => {
      validateCalculationInputs(0, 10.0, 500);
    }).toThrow('EPS must be greater than 0');
  });

  it('should throw for negative EPS', () => {
    expect(() => {
      validateCalculationInputs(-5, 10.0, 500);
    }).toThrow('EPS must be greater than 0');
  });

  it('should throw for negative growth rate', () => {
    expect(() => {
      validateCalculationInputs(25.30, -5, 500);
    }).toThrow('Growth rate cannot be negative');
  });

  it('should throw for growth rate over 100%', () => {
    expect(() => {
      validateCalculationInputs(25.30, 150, 500);
    }).toThrow('Growth rate cannot exceed 100%');
  });

  it('should throw for zero current price', () => {
    expect(() => {
      validateCalculationInputs(25.30, 10.0, 0);
    }).toThrow('Current price must be greater than 0');
  });

  it('should throw for negative current price', () => {
    expect(() => {
      validateCalculationInputs(25.30, 10.0, -100);
    }).toThrow('Current price must be greater than 0');
  });

  it('should accept 100% growth rate', () => {
    expect(() => {
      validateCalculationInputs(25.30, 100, 500);
    }).not.toThrow();
  });

  it('should accept 0% growth rate', () => {
    expect(() => {
      validateCalculationInputs(25.30, 0, 500);
    }).not.toThrow();
  });
});

describe('Integration: Full calculation flow', () => {
  it('should calculate complete NVDA analysis', () => {
    // NVDA example data
    const eps = 25.30;
    const growthRate = 10.0;
    const currentPrice = 500;

    // Validate inputs
    expect(() => {
      validateCalculationInputs(eps, growthRate, currentPrice);
    }).not.toThrow();

    // Calculate intrinsic value
    const intrinsicValue = calculateIntrinsicValue(eps, growthRate);
    expect(intrinsicValue).toBeCloseTo(721.05, 2);

    // Calculate margin of safety
    const marginOfSafety = calculateMarginOfSafety(intrinsicValue, currentPrice);
    expect(marginOfSafety).toBeCloseTo(44.21, 2);

    // Get recommendation
    const recommendation = getRecommendation(marginOfSafety);
    expect(recommendation).toBe('undervalued');
  });

  it('should calculate overvalued scenario', () => {
    const eps = 5.0;
    const growthRate = 2.0;
    const currentPrice = 100;

    const intrinsicValue = calculateIntrinsicValue(eps, growthRate);
    // IV = 5.0 × (8.5 + 2 × 2) = 5.0 × 12.5 = 62.5
    expect(intrinsicValue).toBeCloseTo(62.5, 2);

    const marginOfSafety = calculateMarginOfSafety(intrinsicValue, currentPrice);
    // MoS = ((62.5 - 100) / 100) × 100 = -37.5%
    expect(marginOfSafety).toBeCloseTo(-37.5, 2);

    const recommendation = getRecommendation(marginOfSafety);
    expect(recommendation).toBe('overvalued');
  });
});
