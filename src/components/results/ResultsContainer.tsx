'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StockHeader } from './StockHeader';
import { ScenarioCard } from './ScenarioCard';
import { ScenarioTable } from './ScenarioTable';
import { RotateCcw } from 'lucide-react';
import type { CalculationResult } from '@/types/calculator';

interface ResultsContainerProps {
  data: CalculationResult;
  onReset: () => void;
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  data,
  onReset,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(1); // Neutral by default

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <StockHeader
          ticker={data.ticker}
          companyName={data.companyName}
          currentPrice={data.currentPrice}
          eps={data.eps}
          lastUpdated={data.lastUpdated}
        />
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw className="h-4 w-4" />}
        >
          New Analysis
        </Button>
      </div>

      {/* Scenario Cards Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scenario Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.type}
              scenario={scenario}
              currentPrice={data.currentPrice}
              selected={selectedScenarioIndex === index}
              onClick={() => setSelectedScenarioIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <ScenarioTable scenarios={data.scenarios} currentPrice={data.currentPrice} />

      {/* Graham Formula Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-blue-900 mb-3">
          Graham's Formula Explained
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Intrinsic Value Formula:</strong> IV = EPS × (8.5 + 2g)
          </p>
          <p className="text-xs text-blue-700">
            Where EPS is earnings per share, 8.5 is the P/E ratio of a no-growth
            company, and g is the expected annual growth rate.
          </p>
          <p className="mt-3">
            <strong>Margin of Safety:</strong> MoS = ((IV - Price) / Price) × 100
          </p>
          <p className="text-xs text-blue-700">
            Benjamin Graham recommended a minimum 30% margin of safety for stocks.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          <strong>Disclaimer:</strong> This analysis is for educational purposes only
          and should not be considered as investment advice. Always conduct your own
          research and consult with a financial advisor before making investment
          decisions.
        </p>
      </div>
    </div>
  );
};
