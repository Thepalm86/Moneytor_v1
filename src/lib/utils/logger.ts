/**
 * Production-safe logging utility
 * Replaces console.log/console.error with safe logging in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, data))
    }
  }

  info(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, data))
    }
  }

  warn(message: string, data?: unknown): void {
    // Always log warnings, but sanitize in production
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, data))
    } else {
      console.warn(this.formatMessage('warn', message))
    }
  }

  error(message: string, error?: Error | unknown): void {
    // Always log errors, but sanitize in production
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, error))
    } else {
      // In production, only log sanitized error information
      const sanitizedError =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : 'Error occurred'
      console.error(this.formatMessage('error', message, sanitizedError))
    }
  }

  // For database or API errors that shouldn't expose sensitive information
  secureError(userMessage: string, internalError?: Error | unknown): void {
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', userMessage, internalError))
    } else {
      // In production, only log the user-safe message
      console.error(this.formatMessage('error', userMessage))
    }
  }
}

export const logger = new Logger()

// Helper functions to replace console.log/console.error
export const secureLog = logger.debug.bind(logger)
export const secureError = logger.secureError.bind(logger)
