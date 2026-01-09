'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface StockHeaderProps {
  ticker: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  lastUpdated?: string;
}

export const StockHeader: React.FC<StockHeaderProps> = ({
  ticker,
  companyName,
  currentPrice,
  eps,
  lastUpdated,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Ticker and Company Name */}
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{ticker}</h2>
            <Badge variant="info" size="sm">
              Stock Analysis
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-4">{companyName}</p>

          {/* Stock Metrics */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Current Price</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(currentPrice)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">EPS (TTM)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(eps)}
                </div>
              </div>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium text-gray-700">
                    {formatDate(lastUpdated)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
