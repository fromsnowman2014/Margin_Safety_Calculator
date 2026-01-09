/**
 * Custom error classes for AI operations
 */

export class ClaudeAPIError extends Error {
  public readonly statusCode?: number;
  public readonly originalError?: unknown;

  constructor(error: unknown, message?: string) {
    const errorMessage = message || ClaudeAPIError.extractErrorMessage(error);
    super(errorMessage);
    this.name = 'ClaudeAPIError';
    this.originalError = error;

    // Extract status code if available
    if (error && typeof error === 'object' && 'status' in error) {
      this.statusCode = error.status as number;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClaudeAPIError);
    }
  }

  private static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }

      if ('error' in error && typeof error.error === 'object') {
        const nestedError = error.error as any;
        if ('message' in nestedError) {
          return String(nestedError.message);
        }
      }
    }

    return 'An unknown error occurred while calling Claude API';
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export class DataParsingError extends Error {
  public readonly rawData?: string;

  constructor(message: string, rawData?: string) {
    super(message);
    this.name = 'DataParsingError';
    this.rawData = rawData;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataParsingError);
    }
  }
}

export class ValidationError extends Error {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
