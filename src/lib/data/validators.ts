import { z } from 'zod';

// Analyze Request Validation Schema
export const AnalyzeRequestSchema = z.object({
  ticker: z.string()
    .min(1, 'Ticker is required')
    .max(10, 'Ticker must be 10 characters or less')
    .regex(/^[A-Z]{1,10}$/, 'Ticker must contain only uppercase letters'),
  mode: z.enum(['auto', 'manual'], {
    required_error: 'Mode must be either "auto" or "manual"',
  }),
  data: z.object({
    currentPrice: z.number().positive('Price must be positive').optional(),
    eps: z.number().optional(),
    historicalGrowth: z.number().min(-100).max(1000).optional(),
  }).optional(),
}).refine(
  (data) => {
    // If mode is manual, data must be provided with currentPrice and eps
    if (data.mode === 'manual') {
      return (
        data.data &&
        typeof data.data.currentPrice === 'number' &&
        typeof data.data.eps === 'number'
      );
    }
    return true;
  },
  {
    message: 'Manual mode requires currentPrice and eps in data',
    path: ['data'],
  }
);

export type ValidatedAnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
