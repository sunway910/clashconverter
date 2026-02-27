/**
 * Custom error classes for ClashConverter
 * Provides structured error handling with error codes and detailed messages
 */

/**
 * Error codes enum for all converter errors
 */
export enum ErrorCode {
  // Parse errors (1000-1999)
  PARSE_FAILED = 'PARSE_FAILED',
  PARSE_INVALID_FORMAT = 'PARSE_INVALID_FORMAT',
  PARSE_MISSING_FIELD = 'PARSE_MISSING_FIELD',
  PARSE_INVALID_BASE64 = 'PARSE_INVALID_BASE64',
  PARSE_INVALID_JSON = 'PARSE_INVALID_JSON',

  // Generate errors (2000-2999)
  GENERATE_FAILED = 'GENERATE_FAILED',
  GENERATE_INVALID_CONFIG = 'GENERATE_INVALID_CONFIG',
  GENERATE_SERIALIZATION_ERROR = 'GENERATE_SERIALIZATION_ERROR',

  // Validation errors (3000-3999)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_MISSING_REQUIRED = 'VALIDATION_MISSING_REQUIRED',
  VALIDATION_INVALID_RANGE = 'VALIDATION_INVALID_RANGE',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',

  // Unsupported protocol errors (4000-4999)
  UNSUPPORTED_PROTOCOL = 'UNSUPPORTED_PROTOCOL',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNSUPPORTED_KERNEL = 'UNSUPPORTED_KERNEL',
}

/**
 * Base error class for all converter errors
 */
export class ConverterError extends Error {
  readonly code: ErrorCode;
  readonly detail: string;

  constructor(code: ErrorCode, detail: string, message?: string) {
    super(message || `${code}: ${detail}`);
    this.name = this.constructor.name;
    this.code = code;
    this.detail = detail;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConverterError);
    }
  }

  /**
   * Convert error to plain object for JSON serialization
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      detail: this.detail,
      message: this.message,
    };
  }
}

/**
 * Error thrown when parsing fails (invalid link format, missing fields, etc.)
 */
export class ParseError extends ConverterError {
  constructor(
    code: ErrorCode,
    detail: string,
    protocol?: string
  ) {
    const message = protocol
      ? `Failed to parse ${protocol} link: ${detail}`
      : `Failed to parse: ${detail}`;
    super(code, detail, message);
  }

  /**
   * Create error for missing required field
   */
  static missingField(field: string, protocol?: string): ParseError {
    return new ParseError(
      ErrorCode.PARSE_MISSING_FIELD,
      `Missing required field: ${field}`,
      protocol
    );
  }

  /**
   * Create error for invalid format
   */
  static invalidFormat(expectedFormat: string, protocol?: string): ParseError {
    return new ParseError(
      ErrorCode.PARSE_INVALID_FORMAT,
      `Invalid format, expected: ${expectedFormat}`,
      protocol
    );
  }

  /**
   * Create error for invalid base64
   */
  static invalidBase64(protocol?: string): ParseError {
    return new ParseError(
      ErrorCode.PARSE_INVALID_BASE64,
      'Invalid base64 encoding',
      protocol
    );
  }

  /**
   * Create error for invalid JSON
   */
  static invalidJson(originalError: string, protocol?: string): ParseError {
    return new ParseError(
      ErrorCode.PARSE_INVALID_JSON,
      `Invalid JSON: ${originalError}`,
      protocol
    );
  }
}

/**
 * Error thrown when generating output fails
 */
export class GenerateError extends ConverterError {
  constructor(code: ErrorCode, detail: string, format?: string) {
    const message = format
      ? `Failed to generate ${format} format: ${detail}`
      : `Failed to generate: ${detail}`;
    super(code, detail, message);
  }

  /**
   * Create error for invalid config
   */
  static invalidConfig(reason: string, format?: string): GenerateError {
    return new GenerateError(
      ErrorCode.GENERATE_INVALID_CONFIG,
      `Invalid configuration: ${reason}`,
      format
    );
  }

  /**
   * Create error for serialization failure
   */
  static serializationError(
    originalError: string,
    format?: string
  ): GenerateError {
    return new GenerateError(
      ErrorCode.GENERATE_SERIALIZATION_ERROR,
      `Serialization failed: ${originalError}`,
      format
    );
  }
}

/**
 * Error thrown when a protocol is not supported
 */
export class UnsupportedProtocolError extends ConverterError {
  constructor(protocol: string, context?: string) {
    const detail = context
      ? `Protocol "${protocol}" is not supported for ${context}`
      : `Protocol "${protocol}" is not supported`;
    super(ErrorCode.UNSUPPORTED_PROTOCOL, detail);
    this.protocol = protocol;
  }

  readonly protocol: string;

  /**
   * Create error for unsupported protocol in specific kernel
   */
  static forKernel(protocol: string, kernel: string): UnsupportedProtocolError {
    return new UnsupportedProtocolError(
      protocol,
      `${kernel} kernel`
    );
  }

  /**
   * Create error for unsupported protocol in specific format
   */
  static forFormat(protocol: string, format: string): UnsupportedProtocolError {
    return new UnsupportedProtocolError(
      protocol,
      `${format} format`
    );
  }
}

/**
 * Error thrown when data validation fails
 */
export class ValidationError extends ConverterError {
  constructor(
    code: ErrorCode,
    detail: string,
    field?: string
  ) {
    const message = field
      ? `Validation failed for field "${field}": ${detail}`
      : `Validation failed: ${detail}`;
    super(code, detail, message);
    this.field = field;
  }

  readonly field?: string;

  /**
   * Create error for missing required field
   */
  static missingRequired(field: string): ValidationError {
    return new ValidationError(
      ErrorCode.VALIDATION_MISSING_REQUIRED,
      `Required field is missing or empty`,
      field
    );
  }

  /**
   * Create error for invalid range
   */
  static invalidRange(
    field: string,
    min: number,
    max: number,
    actual: number
  ): ValidationError {
    return new ValidationError(
      ErrorCode.VALIDATION_INVALID_RANGE,
      `Value must be between ${min} and ${max}, got ${actual}`,
      field
    );
  }

  /**
   * Create error for invalid format
   */
  static invalidFormat(field: string, expectedFormat: string): ValidationError {
    return new ValidationError(
      ErrorCode.VALIDATION_INVALID_FORMAT,
      `Invalid format, expected: ${expectedFormat}`,
      field
    );
  }
}

// Type guard functions
export function isParseError(error: unknown): error is ParseError {
  return error instanceof ParseError;
}

export function isGenerateError(error: unknown): error is GenerateError {
  return error instanceof GenerateError;
}

export function isUnsupportedProtocolError(
  error: unknown
): error is UnsupportedProtocolError {
  return error instanceof UnsupportedProtocolError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isConverterError(error: unknown): error is ConverterError {
  return error instanceof ConverterError;
}
