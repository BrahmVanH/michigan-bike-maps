/**
 * Rate Limiter Module
 * 
 * This module provides rate limiting functionality to protect the application
 * from abuse and excessive requests. It implements a multi-layered approach:
 * 
 * - IP-based limiting: 10 uploads per hour
 * - IP+UserAgent limiting: 5 uploads per minute
 * - Cookie-based limiting: 2 uploads per minute
 * 
 * The cookie-based limiting requires a preflight call in the load function
 * to establish the cookie before form submission.
 */

import { error, type RequestEvent } from '@sveltejs/kit';
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

// Use environment variable for the cookie secret or fall back to a default value
// In production, make sure to set this environment variable!
const COOKIE_SECRET = env.RATE_LIMITER_SECRET || 'michigan-bike-maps-default-secret';

/**
 * Rate limiter for GPX file uploads
 * 
 * Implements three layers of protection:
 * 1. IP-based limiting (more lenient in dev mode)
 * 2. IP + User Agent limiting (more lenient in dev mode)
 * 3. Cookie-based limiting (more lenient in dev mode)
 */
export const uploadLimiter = new RateLimiter({
  // IP address limiter
  // In dev mode: 30 requests per minute, production: 10 per hour
  IP: dev ? [30, 'm'] : [10, 'h'],

  // IP + User Agent limiter
  // In dev mode: 20 requests per minute, production: 5 per minute
  IPUA: dev ? [20, 'm'] : [5, 'm'],

  // Cookie-based limiter
  // In dev mode: 10 requests per minute, production: 2 per minute
  cookie: {
    // Unique cookie name for this limiter
    name: 'mbm-upload-limiter',

    // Secret key for cookie signing (use environment variable in production)
    secret: COOKIE_SECRET,

    // Rate limit
    rate: dev ? [10, 'm'] : [2, 'm'],

    // Require preflight call in load function
    preflight: true
  }
});

/**
 * Handles preflight setup for cookie-based rate limiting
 * 
 * This function should be called in the load function of any route
 * that uses the rate limiter to ensure the cookie is properly set
 * before form submission.
 * 
 * @param event - The SvelteKit request event
 */
export async function setupRateLimiter(event: RequestEvent) {
  // Set up the cookie for rate limiting
  // This is required for the cookie-based limiter to work properly
  if (uploadLimiter.cookieLimiter?.preflight) {
    await uploadLimiter.cookieLimiter.preflight(event);
  }
}

/**
 * Checks if a request should be rate limited
 * 
 * @param event - The SvelteKit request event
 * @returns Object with limited flag and response data
 */
export async function checkRateLimit(event: RequestEvent) {
  // In development mode, log but don't actually rate limit
  if (dev) {
    console.log(`[DEV MODE] Rate limiting disabled. Path: ${event.url.pathname}`);
    return { limited: false };
  }

  // Check if the request is rate limited
  // This counts as a hit towards the rate limit
  if (await uploadLimiter.isLimited(event)) {
    // Log the rate limit hit
    // console.warn(`[RATE LIMIT] IP: ${event.getClientAddress()} | Path: ${event.url.pathname}`);

    // Return a structured response instead of throwing an error
    return {
      limited: true,
      response: {
        status: 429,
        body: {
          form: event.locals.form, // Pass back the form
          uploadResult: {
            success: false,
            message: 'Too many upload attempts. Please try again later.'
          }
        }
      }
    };
  }

  // Request is not rate limited
  return { limited: false };
}