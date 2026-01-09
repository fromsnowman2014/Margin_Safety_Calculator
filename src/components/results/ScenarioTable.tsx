'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import type { Scenario } from '@/types/calculator';

interface ScenarioTableProps {
  scenarios: Scenario[];
  currentPrice: number;
}

export const ScenarioTable: React.FC<ScenarioTableProps> = ({
  scenarios,
  currentPrice,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getMarginColor = (value: number) => {
    if (value >= 30) return 'text-green-600 font-semibold';
    if (value >= 0) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'undervalued':
        return 'bg-green-100 text-green-800';
      case 'fairly_valued':
        return 'bg-yellow-100 text-yellow-800';
      case 'overvalued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'undervalued':
        return 'Undervalued';
      case 'fairly_valued':
        return 'Fairly Valued';
      case 'overvalued':
        return 'Overvalued';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card title="Scenario Comparison" subtitle="Compare all three scenarios side by side">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              {scenarios.map((scenario) => (
                <th
                  key={scenario.type}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {scenario.type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Growth Rate Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Growth Rate
              </td>
              {scenarios.map((scenario) => (
                <td
                  key={scenario.type}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {scenario.assumptions.growthRate.toFixed(1)}%
                </td>
              ))}
            </tr>

            {/* EPS Row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                EPS (TTM)
              </td>
              {scenarios.map((scenario) => (
                <td
                  key={scenario.type}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {formatPrice(scenario.assumptions.eps)}
                </td>
              ))}
            </tr>

            {/* P/E Ratio Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                P/E Ratio
              </td>
              {scenarios.map((scenario) => (
                <td
                  key={scenario.type}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {scenario.assumptions.peRatio.toFixed(1)}x
                </td>
              ))}
            </tr>

            {/* Intrinsic Value Row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Intrinsic Value
              </td>
              {scenarios.map((scenario) => (
                <td
                  key={scenario.type}
                  className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600"
                >
                  {formatPrice(scenario.intrinsicValue)}
                </td>
              ))}
            </tr>

            {/* Current Price Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Current Price
              </td>
              {scenarios.map((scenario) => (
                <td
                  key={scenario.type}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {formatPrice(currentPrice)}
                </td>
              ))}
            </tr>

            {/* Margin of Safety Row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Margin of Safety
              </td>
              {scenarios.map((scenario) => (
                <td
                  key={scenario.type}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getMarginColor(
                    scenario.marginOfSafety
                  )}`}
                >
                  {formatPercent(scenario.marginOfSafety)}
                </td>
              ))}
            </tr>

            {/* Recommendation Row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Recommendation
              </td>
              {scenarios.map((scenario) => (
                <td key={scenario.type} className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getRecommendationColor(
                      scenario.recommendation
                    )}`}
                  >
                    {getRecommendationLabel(scenario.recommendation)}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};
