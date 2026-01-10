/**
 * POST /api/analyze
 *
 * Analyzes a stock using Benjamin Graham's margin of safety formula.
 * Supports both auto mode (fetches data via Claude AI) and manual mode (user-provided data).
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/data/validators';
import { gemini } from '@/lib/ai/gemini';
import {
  SYSTEM_PROMPT,
  createDataCollectionPrompt,
  createScenarioPrompt,
  createInsightsPrompt,
  FALLBACK_DATA_PROMPT,
} from '@/lib/ai/prompts';
import { generateScenarios } from '@/lib/graham/scenarios';
import { DataParsingError } from '@/lib/ai/errors';
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
        console.log(`[API] Starting auto mode analysis for ticker: ${ticker}`);

        // Use Gemini to fetch stock data
        const dataPrompt = createDataCollectionPrompt(ticker);
        console.log('[API] Calling Gemini API for data collection...');
        console.log('[API] Prompt length:', dataPrompt.length, 'characters');

        const geminiResponse = await gemini.sendMessage({
          system: SYSTEM_PROMPT,
          userMessage: dataPrompt,
          temperature: 0.3,
          maxTokens: 2048,
        });

        console.log('[API] Gemini API response received!');
        console.log('[API] Response length:', geminiResponse.length, 'characters');
        console.log('[API] Response preview:', geminiResponse.substring(0, 200) + '...');
        console.log('[API] Full response:', geminiResponse);
        console.log('[API] Attempting to parse JSON...');

        // Parse the JSON response
        const fetchedData = gemini.parseJSON<{
          ticker: string;
          companyName: string;
          currentPrice: number;
          eps: number;
          historicalGrowth: number;
          analystConsensus: number | null;
          dataDate: string;
          sources: string[];
        }>(geminiResponse);

        console.log('[API] JSON parsing successful!');
        console.log('[API] Parsed data:', JSON.stringify(fetchedData, null, 2));

        // Validate fetched data
        if (!fetchedData.companyName || !fetchedData.currentPrice || !fetchedData.eps) {
          console.error('[API] Validation failed - missing required fields');
          console.error('[API] companyName:', fetchedData.companyName);
          console.error('[API] currentPrice:', fetchedData.currentPrice);
          console.error('[API] eps:', fetchedData.eps);
          throw new DataParsingError('Incomplete data received from Gemini');
        }

        stockData = {
          ticker: fetchedData.ticker,
          companyName: fetchedData.companyName,
          currentPrice: fetchedData.currentPrice,
          eps: fetchedData.eps,
          historicalGrowth: fetchedData.historicalGrowth || 0,
          analystConsensus: fetchedData.analystConsensus,
        };

        console.log('[API] Stock data prepared successfully:', JSON.stringify(stockData, null, 2));
      } catch (error) {
        console.error('[API] Failed to fetch stock data:', error);
        console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        // Check if it's an API key issue
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isApiKeyError = errorMessage.includes('GOOGLE_API_KEY');

        return NextResponse.json(
          {
            error: {
              code: isApiKeyError ? 'API_KEY_MISSING' : 'DATA_FETCH_FAILED',
              message: isApiKeyError
                ? 'Google API key not configured. Please contact the administrator.'
                : 'Failed to fetch stock data. Please try manual mode or verify the ticker symbol.',
              details: errorMessage,
            },
          },
          { status: isApiKeyError ? 503 : 500 }
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

        const insightsResponse = await gemini.sendMessage({
          system: SYSTEM_PROMPT,
          userMessage: insightsPrompt,
          temperature: 0.5,
          maxTokens: 2048,
        });

        insights = gemini.parseJSON(insightsResponse);
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
