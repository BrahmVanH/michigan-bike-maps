import { randomBytes } from 'crypto';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const nonce = randomBytes(16).toString('base64');

  event.locals.cspNonce = nonce;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace(/%sveltekit\.nonce%/g, nonce);
    }
  });

  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' data:; worker-src 'self' blob:;`
  );

  response.headers.set(
    'Content-Security-Policy-Report-Only',
    `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' data:; worker-src 'self' blob:;`
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};