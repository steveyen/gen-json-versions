/**
 * JSON processing utilities for cleansing and validation
 */

export interface JsonCleanseResult {
  result?: string;
  error?: string; // If error is present, the operation failed
}

export class JsonUtils {
  /**
   * Cleanse JSON content by removing C/C++ style comments
   * Supports:
   * - Single line comments: // comment
   * - Multi-line comments: /* comment *\/
   * - Handles comments within strings properly
   */
  static jsonCleanse(jsonContent: string): JsonCleanseResult {
    try {
      if (!jsonContent || typeof jsonContent !== 'string') {
        return {
          error: 'Invalid input: jsonContent must be a non-empty string'
        };
      }

      let cleaned = jsonContent;
      let inString = false;
      let escapeNext = false;
      let result = '';

      // Process character by character to handle comments within strings properly
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        const nextChar = cleaned[i + 1] || '';
        const nextNextChar = cleaned[i + 2] || '';

        // Handle string escaping
        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }

        // Handle escape sequences
        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }

        // Handle string boundaries
        if (char === '"' && !escapeNext) {
          inString = !inString;
          result += char;
          continue;
        }

        // If we're in a string, just add the character
        if (inString) {
          result += char;
          continue;
        }

        // Check for single-line comment start
        if (char === '/' && nextChar === '/') {
          // Remove trailing spaces before the comment
          while (result.length > 0 && result[result.length - 1] === ' ') {
            result = result.slice(0, -1);
          }
          // Skip until end of line
          while (i < cleaned.length && cleaned[i] !== '\n') {
            i++;
          }
          // Add the newline character if we found one
          if (i < cleaned.length && cleaned[i] === '\n') {
            result += '\n';
          }
          continue;
        }

        // Check for multi-line comment start
        if (char === '/' && nextChar === '*') {
          // Remove trailing spaces before the comment
          while (result.length > 0 && result[result.length - 1] === ' ') {
            result = result.slice(0, -1);
          }
          // Skip until comment end
          i += 2; // Skip /*
          while (i < cleaned.length - 1) {
            if (cleaned[i] === '*' && cleaned[i + 1] === '/') {
              i++; // Skip the closing /
              break;
            }
            i++;
          }
          continue;
        }

        // Regular character
        result += char;
      }

      return {
        result: result
      };
    } catch (error) {
      return {
        error: `Failed to cleanse JSON: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}