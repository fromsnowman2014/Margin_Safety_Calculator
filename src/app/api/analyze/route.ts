/**
 * POST /api/analyze
 *
 * Analyzes a stock using Benjamin Graham's margin of safety formula.
 * Supports both auto mode (fetches data via Claude AI) and manual mode (user-provided data).
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/data/validators';
import { claude } from '@/lib/ai/claude';
import {
  SYSTEM_PROMPT,
  createDataCollectionPrompt,
  createScenarioPrompt,
  createInsightsPrompt,
  FALLBACK_DATA_PROMPT,
} from '@/lib/ai/prompts';
import { generateScenarios } from '@/lib/graham/scenarios';
import { ClaudeAPIError, DataParsingError } from '@/lib/ai/errors';
import type { CalculationResult } from '@/types/calculator';

/**
 * POST handler for stock analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AnalyzeRequestSchema.parse(body);

    const { ticker, mode, data: manualData } = validatedData;

    let stockData: {
      ticker: string;
      companyName: string;
      currentPrice: number;
      eps: number;
      historicalGrowth: number;
      analystConsensus: number | null;
    };

    // Step 1: Get stock data (auto or manual)
    if (mode === 'auto') {
      try {
        // Use Claude to fetch stock data
        const dataPrompt = createDataCollectionPrompt(ticker);
        const claudeResponse = await claude.sendMessage({
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: dataPrompt,
            },
          ],
          temperature: 0.3,
          maxTokens: 2048,
        });

        // Parse the JSON response
        const fetchedData = claude.parseJSON<{
          ticker: string;
          companyName: string;
          currentPrice: number;
          eps: number;
          historicalGrowth: number;
          analystConsensus: number | null;
          dataDate: string;
          sources: string[];
        }>(claudeResponse);

        // Validate fetched data
        if (!fetchedData.companyName || !fetchedData.currentPrice || !fetchedData.eps) {
          throw new DataParsingError('Incomplete data received from Claude');
        }

        stockData = {
          ticker: fetchedData.ticker,
          companyName: fetchedData.companyName,
          currentPrice: fetchedData.currentPrice,
          eps: fetchedData.eps,
          historicalGrowth: fetchedData.historicalGrowth || 0,
          analystConsensus: fetchedData.analystConsensus,
        };
      } catch (error) {
        console.error('Failed to fetch stock data:', error);

        return NextResponse.json(
          {
            error: {
              code: 'DATA_FETCH_FAILED',
              message:
                'Failed to fetch stock data. Please try manual mode or verify the ticker symbol.',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
          },
          { status: 500 }
        );
      }
    } else {
      // Manual mode - use provided data
      if (!manualData || !manualData.currentPrice || !manualData.eps) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_MANUAL_DATA',
              message: 'Manual mode requires currentPrice and eps',
            },
          },
          { status: 400 }
        );
      }

      stockData = {
        ticker: ticker.toUpperCase(),
        companyName: `${ticker.toUpperCase()} Corporation`, // Placeholder name for manual mode
        currentPrice: manualData.currentPrice,
        eps: manualData.eps,
        historicalGrowth: manualData.historicalGrowth || 0,
        analystConsensus: null,
      };
    }

    // Step 2: Generate scenarios using our calculation engine
    // (We could also use Claude for this, but our algorithm is faster and more consistent)
    const scenarios = generateScenarios({
      eps: stockData.eps,
      currentPrice: stockData.currentPrice,
      historicalGrowth: stockData.historicalGrowth,
      analystConsensus: stockData.analystConsensus ?? undefined,
    });

    // Step 3: Generate AI insights (only in auto mode for now)
    let insights: {
      summary: string;
      keyFactors: string[];
      risks: string[];
      opportunities: string[];
      recommendation: string;
    } | null = null;

    if (mode === 'auto') {
      try {
        const insightsPrompt = createInsightsPrompt({
          ticker: stockData.ticker,
          companyName: stockData.companyName,
          currentPrice: stockData.currentPrice,
          eps: stockData.eps,
          scenarios: scenarios.map((s) => ({
            type: s.type,
            growthRate: s.assumptions.growthRate,
            intrinsicValue: s.intrinsicValue,
            marginOfSafety: s.marginOfSafety,
            recommendation: s.recommendation,
          })),
        });

        const insightsResponse = await claude.sendMessage({
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: insightsPrompt,
            },
          ],
          temperature: 0.5,
          maxTokens: 2048,
        });

        insights = claude.parseJSON(insightsResponse);
      } catch (error) {
        console.error('Failed to generate insights:', error);
        // Continue without insights - not critical
        insights = null;
      }
    }

    // Step 4: Build response
    const result: CalculationResult = {
      ticker: stockData.ticker,
      companyName: stockData.companyName,
      currentPrice: stockData.currentPrice,
      eps: stockData.eps,
      scenarios,
      lastUpdated: new Date().toISOString(),
    };

    // Add insights if available
    const response: any = result;
    if (insights) {
      response.insights = insights;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);

    // Handle validation errors
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle Claude API errors
    if (error instanceof ClaudeAPIError) {
      return NextResponse.json(
        {
          error: {
            code: 'AI_SERVICE_ERROR',
            message: 'Failed to process request with AI service',
            details: error.message,
          },
        },
        { status: error.statusCode || 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - return API info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/analyze',
    method: 'POST',
    description: 'Analyze stocks using Benjamin Graham\'s margin of safety formula',
    version: '1.0.0',
    modes: ['auto', 'manual'],
  });
}
