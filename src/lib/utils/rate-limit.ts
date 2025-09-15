/**
 * Rate limiting utility for authentication and API endpoints
 * Prevents brute force attacks and abuse
 */

import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max unique tokens (IPs) per interval
  tokensPerInterval: number // Max requests per token per interval
}

// Default rate limits for different endpoints
export const RATE_LIMITS = {
  // Authentication endpoints - strict limits
  AUTH: {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 500, // Max 500 unique IPs
    tokensPerInterval: 5, // Max 5 attempts per IP per 15 minutes
  },
  // Password reset - very strict
  PASSWORD_RESET: {
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 100, // Max 100 unique IPs
    tokensPerInterval: 2, // Max 2 attempts per IP per hour
  },
  // API endpoints - moderate limits
  API: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 1000, // Max 1000 unique IPs
    tokensPerInterval: 60, // Max 60 requests per IP per minute
  },
} as const

class RateLimiter {
  private cache: LRUCache<string, number[]>
  private options: RateLimitOptions

  constructor(options: RateLimitOptions) {
    this.options = options
    this.cache = new LRUCache({
      max: options.uniqueTokenPerInterval,
      ttl: options.interval,
    })
  }

  check(token: string): { success: boolean; limit: number; remaining: number; reset: Date } {
    const now = Date.now()
    const tokenRequests = this.cache.get(token) || []

    // Remove expired requests
    const validRequests = tokenRequests.filter(timestamp => now - timestamp < this.options.interval)

    const limit = this.options.tokensPerInterval
    const remaining = Math.max(0, limit - validRequests.length)
    const reset = new Date(now + this.options.interval)

    if (validRequests.length >= limit) {
      return { success: false, limit, remaining: 0, reset }
    }

    // Add current request
    validRequests.push(now)
    this.cache.set(token, validRequests)

    return {
      success: true,
      limit,
      remaining: remaining - 1,
      reset,
    }
  }
}

// Create rate limiter instances
export const authRateLimiter = new RateLimiter(RATE_LIMITS.AUTH)
export const passwordResetRateLimiter = new RateLimiter(RATE_LIMITS.PASSWORD_RESET)
export const apiRateLimiter = new RateLimiter(RATE_LIMITS.API)

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for real IP (common proxy headers)
  const headers = new Headers(request.headers)

  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('x-client-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('fastly-client-ip') || // Fastly
    headers.get('x-cluster-client-ip') ||
    headers.get('x-forwarded') ||
    headers.get('forwarded-for') ||
    headers.get('forwarded') ||
    'unknown'
  )
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  request: Request,
  limiter: RateLimiter
): { success: boolean; headers: Record<string, string>; error?: string } {
  const ip = getClientIP(request)
  const result = limiter.check(ip)

  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toISOString(),
  }

  if (!result.success) {
    return {
      success: false,
      headers: {
        ...headers,
        'Retry-After': Math.round((result.reset.getTime() - Date.now()) / 1000).toString(),
      },
      error: 'Too many requests. Please try again later.',
    }
  }

  return { success: true, headers }
}
