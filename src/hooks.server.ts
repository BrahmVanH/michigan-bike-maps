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
    `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'sha256-A0KtUzZjqbpeFRPxgjqKWTOxwZkt5Hj8I90vY6iPkLk=' 'sha256-DuGgxVdcpnS3W9cW3lYUmr9COOM7cGrDBaDyrTNauY8=' 'sha256-ArZS4bKt7vlTrUuJLICVouLGhK5bLkN3IPuCEHF9Ry0=' 'sha256-ZdcyT9UHm2RBYyGqChEN+cEuscyc3zkCR7i1APqE6g8=' 'sha256-kbtFhEcdr0jFD6Mza8SI5Qqj3pBq4XOVTZwWqY6FDnM=' 'sha256-CmBOr6DT+IJnxskHTVK4bLDpD9ifMThrsDuOSuhl4lY=' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' data:; worker-src 'self' blob:;`
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};