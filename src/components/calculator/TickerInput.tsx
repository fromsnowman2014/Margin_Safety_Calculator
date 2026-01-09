'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string;
}

export const TickerInput: React.FC<TickerInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading = false,
  error,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value && value.length >= 1) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        value={value}
        onChange={(val) => onChange(val.toUpperCase())}
        onKeyDown={handleKeyDown}
        placeholder="Enter ticker symbol (e.g., NVDA)"
        label="Stock Ticker"
        error={error}
        prefix={<Search className="h-5 w-5 text-gray-400" />}
        suffix={
          value && !loading ? (
            <button
              onClick={() => onChange('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onSubmit}
        loading={loading}
        disabled={!value || value.length < 1}
        className="mt-3"
      >
        Analyze Stock
      </Button>
    </div>
  );
};
