/**
 * Calculator State Management with Zustand
 *
 * Manages the state for the calculator including:
 * - Current analysis results
 * - Loading states
 * - Error handling
 * - Reset functionality
 */

import { create } from 'zustand';
import type { CalculationResult } from '@/types/calculator';

interface CalculatorState {
  // Current analysis data
  currentAnalysis: CalculationResult | null;

  // UI states
  loading: boolean;
  error: string | null;

  // Input mode
  mode: 'auto' | 'manual';

  // Actions
  setAnalysis: (data: CalculationResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMode: (mode: 'auto' | 'manual') => void;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  // Initial state
  currentAnalysis: null,
  loading: false,
  error: null,
  mode: 'auto',

  // Actions
  setAnalysis: (data) =>
    set({
      currentAnalysis: data,
      loading: false,
      error: null,
    }),

  setLoading: (loading) =>
    set({
      loading,
      error: loading ? null : undefined, // Clear error when starting to load
    }),

  setError: (error) =>
    set({
      error,
      loading: false,
    }),

  setMode: (mode) =>
    set({
      mode,
      error: null, // Clear error when switching modes
    }),

  reset: () =>
    set({
      currentAnalysis: null,
      loading: false,
      error: null,
      mode: 'auto',
    }),
}));
