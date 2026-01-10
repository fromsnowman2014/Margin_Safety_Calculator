/**
 * Claude AI Client
 *
 * Handles communication with Anthropic's Claude API for financial analysis tasks.
 * Uses Claude 3.5 Sonnet for data collection, scenario generation, and insights.
 */

import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAPIError } from './errors';

/**
 * Get Anthropic client instance with runtime API key validation
 * This prevents build-time errors in environments where env vars aren't available during build
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required. Please add it to your .env.local file or Vercel environment variables.'
    );
  }

  return new Anthropic({
    apiKey: apiKey,
  });
}

export interface ClaudeRequest {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  temperature?: number;
  tools?: Anthropic.Tool[];
}

export interface ClaudeToolUseResponse {
  text: string;
  toolResults: Anthropic.ToolUseBlock[];
}

/**
 * Claude Client for interacting with Anthropic's API
 */
export class ClaudeClient {
  private readonly model = 'claude-3-5-sonnet-20241022';
  private readonly defaultMaxTokens = 4096;
  private readonly defaultTemperature = 0.3;

  /**
   * Send a message to Claude and get a text response
   * @param request - The request configuration
   * @returns The text response from Claude
   */
  async sendMessage(request: ClaudeRequest): Promise<string> {
    try {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: this.model,
        system: request.system,
        messages: request.messages,
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature ?? this.defaultTemperature,
        ...(request.tools && { tools: request.tools }),
      });

      // Extract text content from response
      const textContent = response.content.find((block) => block.type === 'text');

      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new ClaudeAPIError(error);
    }
  }

  /**
   * Send a message with tool use capabilities (e.g., web search)
   * @param request - The request configuration with tools
   * @returns Object containing text response and tool use results
   */
  async sendMessageWithToolUse(
    request: ClaudeRequest
  ): Promise<ClaudeToolUseResponse> {
    try {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: this.model,
        system: request.system,
        messages: request.messages,
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature ?? this.defaultTemperature,
        tools: request.tools || [],
      });

      // Process response blocks
      const toolResults: Anthropic.ToolUseBlock[] = [];
      let finalText = '';

      for (const block of response.content) {
        if (block.type === 'text') {
          finalText += block.text;
        } else if (block.type === 'tool_use') {
          toolResults.push(block);
        }
      }

      return { text: finalText, toolResults };
    } catch (error) {
      console.error('Claude API error (with tools):', error);
      throw new ClaudeAPIError(error);
    }
  }

  /**
   * Parse JSON from Claude's response, handling markdown code blocks
   * @param text - The text response from Claude
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
      console.error('Failed to parse JSON from Claude response:', text);
      throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Singleton instance of Claude Client
 */
export const claude = new ClaudeClient();
