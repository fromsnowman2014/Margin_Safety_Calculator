'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';

export interface ManualInputData {
  currentPrice: string;
  eps: string;
  historicalGrowth: string;
}

interface ManualInputFormProps {
  data: ManualInputData;
  onChange: (data: ManualInputData) => void;
  errors?: {
    currentPrice?: string;
    eps?: string;
    historicalGrowth?: string;
  };
}

export const ManualInputForm: React.FC<ManualInputFormProps> = ({
  data,
  onChange,
  errors,
}) => {
  const handleChange = (field: keyof ManualInputData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm text-gray-600 mb-4">
        Enter the stock data manually to calculate margin of safety
      </div>

      <Input
        type="number"
        value={data.currentPrice}
        onChange={(val) => handleChange('currentPrice', val)}
        placeholder="e.g., 500.00"
        label="Current Price"
        error={errors?.currentPrice}
        required
        prefix={<DollarSign className="h-5 w-5 text-gray-400" />}
        helperText="The current market price per share"
      />

      <Input
        type="number"
        value={data.eps}
        onChange={(val) => handleChange('eps', val)}
        placeholder="e.g., 25.30"
        label="EPS (Earnings Per Share)"
        error={errors?.eps}
        required
        prefix={<DollarSign className="h-5 w-5 text-gray-400" />}
        helperText="Trailing twelve months (TTM) earnings per share"
      />

      <Input
        type="number"
        value={data.historicalGrowth}
        onChange={(val) => handleChange('historicalGrowth', val)}
        placeholder="e.g., 12.5"
        label="Historical Growth Rate (%)"
        error={errors?.historicalGrowth}
        required
        prefix={<TrendingUp className="h-5 w-5 text-gray-400" />}
        suffix={<Percent className="h-4 w-4 text-gray-500" />}
        helperText="Average annual EPS growth rate over the past 3-5 years"
      />
    </div>
  );
};
