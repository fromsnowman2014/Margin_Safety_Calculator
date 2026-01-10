/**
 * Google Gemini AI Client
 *
 * Handles communication with Google's Gemini API for financial analysis tasks.
 * Uses Gemini 1.5 Pro for data collection, scenario generation, and insights.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get Gemini client instance with runtime API key validation
 */
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GOOGLE_API_KEY environment variable is required. Please add it to your .env.local file or Vercel environment variables.'
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

export interface AIRequest {
  system: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Gemini Client for interacting with Google's Generative AI API
 */
export class GeminiClient {
  private readonly model = 'gemini-1.5-pro';
  private readonly defaultMaxTokens = 4096;
  private readonly defaultTemperature = 0.3;

  /**
   * Send a message to Gemini and get a text response
   * @param request - The request configuration
   * @returns The text response from Gemini
   */
  async sendMessage(request: AIRequest): Promise<string> {
    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: this.model,
        systemInstruction: request.system,
      });

      const generationConfig = {
        temperature: request.temperature ?? this.defaultTemperature,
        maxOutputTokens: request.maxTokens || this.defaultMaxTokens,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: request.userMessage }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No text content in Gemini response');
      }

      return text;
    } catch (error) {
      console.error('Gemini API error:', error);

      // Extract error message
      let errorMessage = 'Unknown Gemini API error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }

      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
  }

  /**
   * Parse JSON from Gemini's response, handling markdown code blocks
   * @param text - The text response from Gemini
   * @returns Parsed JSON object
   */
  parseJSON<T = any>(text: string): T {
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();

      // Check for ```json ... ``` format
      const jsonBlockMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        cleanedText = jsonBlockMatch[1].trim();
      }
      // Check for ``` ... ``` format without language specifier
      else {
        const codeBlockMatch = cleanedText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          cleanedText = codeBlockMatch[1].trim();
        }
      }

      return JSON.parse(cleanedText) as T;
    } catch (error) {
      console.error('Failed to parse JSON from Gemini response:', text);
      throw new Error(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Singleton instance of Gemini Client
 */
export const gemini = new GeminiClient();
