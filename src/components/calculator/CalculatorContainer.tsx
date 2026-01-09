'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TickerInput } from './TickerInput';
import { ManualInputForm, type ManualInputData } from './ManualInputForm';
import { useCalculatorStore } from '@/store/calculatorStore';

export const CalculatorContainer: React.FC = () => {
  const { mode, setMode, loading, error, setError } = useCalculatorStore();

  // Ticker input state
  const [ticker, setTicker] = useState('');

  // Manual input state
  const [manualData, setManualData] = useState<ManualInputData>({
    currentPrice: '',
    eps: '',
    historicalGrowth: '',
  });

  const handleModeToggle = () => {
    setMode(mode === 'auto' ? 'manual' : 'auto');
    setError(null);
    setTicker('');
    setManualData({
      currentPrice: '',
      eps: '',
      historicalGrowth: '',
    });
  };

  const handleTickerSubmit = async () => {
    if (!ticker || ticker.length < 1) {
      setError('Please enter a valid ticker symbol');
      return;
    }

    // TODO: Day 7 - Implement API call to /api/analyze
    console.log('Analyzing ticker:', ticker);
    setError('API integration not yet implemented (Day 7)');
  };

  const handleManualSubmit = async () => {
    // Validate manual inputs
    const errors: { [key: string]: string } = {};

    if (!manualData.currentPrice || parseFloat(manualData.currentPrice) <= 0) {
      errors.currentPrice = 'Current price must be greater than 0';
    }

    if (!manualData.eps || parseFloat(manualData.eps) <= 0) {
      errors.eps = 'EPS must be greater than 0';
    }

    if (!manualData.historicalGrowth || parseFloat(manualData.historicalGrowth) < 0) {
      errors.historicalGrowth = 'Growth rate must be 0 or greater';
    }

    if (Object.keys(errors).length > 0) {
      setError('Please fill in all required fields correctly');
      return;
    }

    // TODO: Day 7 - Implement API call with manual data
    console.log('Analyzing manual data:', manualData);
    setError('API integration not yet implemented (Day 7)');
  };

  return (
    <Card
      title="Stock Analysis"
      subtitle="Enter a ticker symbol or input data manually to calculate margin of safety"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => mode !== 'auto' && handleModeToggle()}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'auto'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Auto (Ticker)
            </button>
            <button
              onClick={() => mode !== 'manual' && handleModeToggle()}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manual Input
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on mode */}
        <div className="flex justify-center">
          {mode === 'auto' ? (
            <TickerInput
              value={ticker}
              onChange={setTicker}
              onSubmit={handleTickerSubmit}
              loading={loading}
              error={error || undefined}
            />
          ) : (
            <div className="w-full max-w-md">
              <ManualInputForm data={manualData} onChange={setManualData} />
              <button
                onClick={handleManualSubmit}
                disabled={loading}
                className="w-full mt-6 px-6 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? 'Analyzing...' : 'Analyze Stock'}
              </button>
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
