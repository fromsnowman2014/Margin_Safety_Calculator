'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';
import type { Scenario } from '@/types/calculator';

interface ScenarioCardProps {
  scenario: Scenario;
  currentPrice: number;
  selected?: boolean;
  onClick?: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  currentPrice,
  selected = false,
  onClick,
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

  const getScenarioLabel = () => {
    return scenario.type.charAt(0).toUpperCase() + scenario.type.slice(1);
  };

  const getRecommendationBadge = () => {
    switch (scenario.recommendation) {
      case 'undervalued':
        return <Badge variant="success">Undervalued</Badge>;
      case 'fairly_valued':
        return <Badge variant="warning">Fairly Valued</Badge>;
      case 'overvalued':
        return <Badge variant="danger">Overvalued</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const getMarginColor = () => {
    if (scenario.marginOfSafety >= 30) return 'text-green-600';
    if (scenario.marginOfSafety >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onClick}
      padding="md"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {getScenarioLabel()}
          </h3>
          {getRecommendationBadge()}
        </div>

        {/* Margin of Safety */}
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Margin of Safety</div>
          <div className={`text-3xl font-bold ${getMarginColor()}`}>
            {formatPercent(scenario.marginOfSafety)}
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Intrinsic Value</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(scenario.intrinsicValue)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Current Price</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Growth Rate</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {scenario.assumptions.growthRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Percent className="h-4 w-4" />
              <span>P/E Ratio</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {scenario.assumptions.peRatio.toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>EPS</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {formatPrice(scenario.assumptions.eps)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
