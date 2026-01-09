/**
 * Unit Tests for Scenario Generation
 *
 * Tests the scenario generation logic for Conservative, Neutral, and Optimistic scenarios
 */

import { generateScenarios, getScenarioAssumptions } from '@/lib/graham/scenarios';

describe('generateScenarios', () => {
  it('should generate three scenarios with correct structure', () => {
    const input = {
      eps: 25.30,
      currentPrice: 500,
      historicalGrowth: 12.0,
      analystConsensus: 10.0,
      analystHigh: 15.0,
    };

    const scenarios = generateScenarios(input);

    expect(scenarios).toHaveLength(3);
    expect(scenarios[0].type).toBe('conservative');
    expect(scenarios[1].type).toBe('neutral');
    expect(scenarios[2].type).toBe('optimistic');

    // Each scenario should have all required fields
    scenarios.forEach((scenario) => {
      expect(scenario).toHaveProperty('type');
      expect(scenario).toHaveProperty('assumptions');
      expect(scenario).toHaveProperty('intrinsicValue');
      expect(scenario).toHaveProperty('marginOfSafety');
      expect(scenario).toHaveProperty('recommendation');
    });
  });

  it('should calculate Conservative scenario correctly (50% of historical, capped at 5%)', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 12.0,
    };

    const scenarios = generateScenarios(input);
    const conservative = scenarios[0];

    // Conservative: 12% × 0.5 = 6%, capped at 5%
    expect(conservative.assumptions.growthRate).toBe(5.0);

    // IV = 10.0 × (8.5 + 2 × 5) = 10.0 × 18.5 = 185.0
    expect(conservative.intrinsicValue).toBeCloseTo(185.0, 2);

    // MoS = ((185 - 100) / 100) × 100 = 85%
    expect(conservative.marginOfSafety).toBeCloseTo(85, 2);
    expect(conservative.recommendation).toBe('undervalued');
  });

  it('should not cap Conservative growth if below 5%', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 6.0,
    };

    const scenarios = generateScenarios(input);
    const conservative = scenarios[0];

    // Conservative: 6% × 0.5 = 3% (not capped)
    expect(conservative.assumptions.growthRate).toBe(3.0);
  });

  it('should calculate Neutral scenario with analyst consensus', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 12.0,
      analystConsensus: 8.0,
    };

    const scenarios = generateScenarios(input);
    const neutral = scenarios[1];

    // Neutral: Uses analyst consensus (8%)
    expect(neutral.assumptions.growthRate).toBe(8.0);

    // IV = 10.0 × (8.5 + 2 × 8) = 10.0 × 24.5 = 245.0
    expect(neutral.intrinsicValue).toBeCloseTo(245.0, 2);
  });

  it('should calculate Neutral scenario without analyst consensus (uses historical)', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 12.0,
    };

    const scenarios = generateScenarios(input);
    const neutral = scenarios[1];

    // Neutral: Uses historical (12%) when no analyst consensus
    expect(neutral.assumptions.growthRate).toBe(12.0);
  });

  it('should calculate Optimistic scenario correctly (capped at 25%)', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 20.0,
      analystHigh: 30.0,
    };

    const scenarios = generateScenarios(input);
    const optimistic = scenarios[2];

    // Optimistic: max(20%, 30%) = 30%, capped at 25%
    expect(optimistic.assumptions.growthRate).toBe(25.0);

    // IV = 10.0 × (8.5 + 2 × 25) = 10.0 × 58.5 = 585.0
    expect(optimistic.intrinsicValue).toBeCloseTo(585.0, 2);
  });

  it('should not cap Optimistic growth if below 25%', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 15.0,
      analystHigh: 18.0,
    };

    const scenarios = generateScenarios(input);
    const optimistic = scenarios[2];

    // Optimistic: max(15%, 18%) = 18% (not capped)
    expect(optimistic.assumptions.growthRate).toBe(18.0);
  });

  it('should use historical growth for Optimistic when no analyst high', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 15.0,
    };

    const scenarios = generateScenarios(input);
    const optimistic = scenarios[2];

    // Optimistic: Uses historical (15%) when no analyst high
    expect(optimistic.assumptions.growthRate).toBe(15.0);
  });

  it('should handle NVDA real-world example', () => {
    const input = {
      eps: 25.30,
      currentPrice: 500,
      historicalGrowth: 12.5,
      analystConsensus: 10.0,
      analystHigh: 15.0,
    };

    const scenarios = generateScenarios(input);

    // Conservative: 12.5% × 0.5 = 6.25%, capped at 5%
    expect(scenarios[0].assumptions.growthRate).toBe(5.0);

    // Neutral: Uses analyst consensus (10%)
    expect(scenarios[1].assumptions.growthRate).toBe(10.0);

    // Optimistic: max(12.5%, 15%) = 15%
    expect(scenarios[2].assumptions.growthRate).toBe(15.0);
  });

  it('should calculate correct P/E ratios for each scenario', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 10.0,
    };

    const scenarios = generateScenarios(input);

    // Conservative: growthRate = 5%, P/E = 8.5 + 2 × 5 = 18.5
    expect(scenarios[0].assumptions.peRatio).toBe(18.5);

    // Neutral: growthRate = 10%, P/E = 8.5 + 2 × 10 = 28.5
    expect(scenarios[1].assumptions.peRatio).toBe(28.5);

    // Optimistic: growthRate = 10%, P/E = 8.5 + 2 × 10 = 28.5
    expect(scenarios[2].assumptions.peRatio).toBe(28.5);
  });
});

describe('getScenarioAssumptions', () => {
  it('should return assumptions for all three scenarios', () => {
    const input = {
      eps: 25.30,
      currentPrice: 500,
      historicalGrowth: 12.0,
      analystConsensus: 10.0,
      analystHigh: 15.0,
    };

    const assumptions = getScenarioAssumptions(input);

    expect(assumptions).toHaveProperty('conservative');
    expect(assumptions).toHaveProperty('neutral');
    expect(assumptions).toHaveProperty('optimistic');

    // Verify structure of each assumption
    expect(assumptions.conservative).toHaveProperty('growthRate');
    expect(assumptions.conservative).toHaveProperty('eps');
    expect(assumptions.conservative).toHaveProperty('peRatio');

    expect(assumptions.neutral).toHaveProperty('growthRate');
    expect(assumptions.neutral).toHaveProperty('eps');
    expect(assumptions.neutral).toHaveProperty('peRatio');

    expect(assumptions.optimistic).toHaveProperty('growthRate');
    expect(assumptions.optimistic).toHaveProperty('eps');
    expect(assumptions.optimistic).toHaveProperty('peRatio');
  });

  it('should match growth rates with generateScenarios', () => {
    const input = {
      eps: 25.30,
      currentPrice: 500,
      historicalGrowth: 12.0,
      analystConsensus: 10.0,
      analystHigh: 15.0,
    };

    const assumptions = getScenarioAssumptions(input);
    const scenarios = generateScenarios(input);

    expect(assumptions.conservative.growthRate).toBe(
      scenarios[0].assumptions.growthRate
    );
    expect(assumptions.neutral.growthRate).toBe(
      scenarios[1].assumptions.growthRate
    );
    expect(assumptions.optimistic.growthRate).toBe(
      scenarios[2].assumptions.growthRate
    );
  });

  it('should return same EPS for all scenarios', () => {
    const input = {
      eps: 25.30,
      currentPrice: 500,
      historicalGrowth: 12.0,
    };

    const assumptions = getScenarioAssumptions(input);

    expect(assumptions.conservative.eps).toBe(25.30);
    expect(assumptions.neutral.eps).toBe(25.30);
    expect(assumptions.optimistic.eps).toBe(25.30);
  });
});

describe('Edge cases and boundary conditions', () => {
  it('should handle very low historical growth', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 2.0,
    };

    const scenarios = generateScenarios(input);

    // Conservative: 2% × 0.5 = 1%
    expect(scenarios[0].assumptions.growthRate).toBe(1.0);

    // Neutral: 2% (historical)
    expect(scenarios[1].assumptions.growthRate).toBe(2.0);

    // Optimistic: 2% (historical, no analyst high)
    expect(scenarios[2].assumptions.growthRate).toBe(2.0);
  });

  it('should handle zero historical growth', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 0,
    };

    const scenarios = generateScenarios(input);

    // All scenarios should have 0% growth
    expect(scenarios[0].assumptions.growthRate).toBe(0);
    expect(scenarios[1].assumptions.growthRate).toBe(0);
    expect(scenarios[2].assumptions.growthRate).toBe(0);

    // All should have same intrinsic value: 10.0 × 8.5 = 85.0
    expect(scenarios[0].intrinsicValue).toBe(85.0);
    expect(scenarios[1].intrinsicValue).toBe(85.0);
    expect(scenarios[2].intrinsicValue).toBe(85.0);
  });

  it('should handle extremely high historical growth', () => {
    const input = {
      eps: 10.0,
      currentPrice: 100,
      historicalGrowth: 50.0,
    };

    const scenarios = generateScenarios(input);

    // Conservative: 50% × 0.5 = 25%, capped at 5%
    expect(scenarios[0].assumptions.growthRate).toBe(5.0);

    // Neutral: 50% (historical)
    expect(scenarios[1].assumptions.growthRate).toBe(50.0);

    // Optimistic: 50%, capped at 25%
    expect(scenarios[2].assumptions.growthRate).toBe(25.0);
  });
});
