/**
 * Enum defining available log levels
 * @enum {number}
 */
export enum LogLevel {
  /** Debug level for detailed development information */
  DEBUG,
  /** Info level for general operational information */
  INFO,
  /** Warning level for potentially problematic situations */
  WARN,
  /** Error level for error conditions */
  ERROR
}

/**
 * Logs a message with the specified log level
 * 
 * This function provides a consistent logging interface that:
 * - Only logs DEBUG and INFO messages in development mode
 * - Always logs WARN and ERROR messages
 * - Prefixes messages with the log level tag
 * - Uses appropriate console methods based on level
 * 
 * @param {LogLevel} level - The severity level of the log
 * @param {...unknown[]} args - Arguments to log (same as console.log)
 * 
 * @example
 * ```typescript
 * // Debug message (only in development)
 * log(LogLevel.DEBUG, 'Initializing component', { props });
 * 
 * // Warning message (always shown)
 * log(LogLevel.WARN, 'API request failed', error);
 * 
 * // Error message (always shown)
 * log(LogLevel.ERROR, 'Fatal error', error);
 * ```
 */
export const log = (level: LogLevel, ...args: unknown[]) => {
  // Only log DEBUG and INFO in development, always log WARN and ERROR
  if (import.meta.env.DEV || level >= LogLevel.WARN) {
    const tag = LogLevel[level];
    console[level === LogLevel.ERROR ? 'error' : 'log'](`[${tag}]`, ...args);
  }
};
