import { randomBytes } from 'crypto';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
  const nonce = randomBytes(16).toString('base64');

  event.locals.cspNonce = nonce;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace(/%sveltekit\.nonce%/g, nonce);
    }
  });

  // const allowedScriptHashes = [
  //   `'sha256-A0KtUzZjqbpeFRPxgjqKWTOxwZkt5Hj8I90vY6iPkLk='`,
  //   `'sha256-DuGgxVdcpnS3W9cW3lYUmr9COOM7cGrDBaDyrTNauY8='`,
  //   `'sha256-ArZS4bKt7vlTrUuJLICVouLGhK5bLkN3IPuCEHF9Ry0='`,
  //   `'sha256-ZdcyT9UHm2RBYyGqChEN+cEuscyc3zkCR7i1APqE6g8='`,
  //   `'sha256-kbtFhEcdr0jFD6Mza8SI5Qqj3pBq4XOVTZwWqY6FDnM='`,
  //   `'sha256-CmBOr6DT+IJnxskHTVK4bLDpD9ifMThrsDuOSuhl4lY='`,
  //   `'sha256-CqfYMUIFL74fhQmBN6Xf/7FmcOjZZBPj71joiZ3skNo='`,
  //   `'sha256-jMqCwIPbXjPJpVVnlA93Bz+TWoc5u5HMBFKz24AlDs4='`,
  //   `'sha256-3xxwmg6WMOgNc6THaHxKF300s5W8U6KMjMvdkBZByrg='`,
  //   `'sha256-8rLjiN3x5NJWIZKtkCCTqATQdX3qTnUS8oZPVR9rP4E='`,
  //   `'sha256-meqdSpNrglVbA6w847PYQV3GyXezaw1flzX4aNRVZX8='`,
  //   `'sha256-HHtagRqtrBqhKxET/abGldrDb61sdVoJxHbDOWhzIy4='`,
  //   `'sha256-uw1rPornAx9j6EbYyoq0QSaCaF9Da0jJsEtd4Zp8d4M='`,
  //   `'sha256-ZMajLaXDMA7M2y+wb+difNSbu49hGP+XtM6MwPc0scY='`,
  //   `'sha256-IKiWjhBtQOXPZs4J7bzTB6dIlajtcGQc6iMznYQ7g1E='`,
  //   `'sha256-B41PUWl4S8gI7ikZVh9TG7g55ya7GAebzqmBFzvGpi8='`,
  //   `'sha256-01LB0cG+kxl/rIzwX3Qmp7gK4XCKKJBWj6Z+AqaSE6U='`,
  //   `'sha256-H3KvZinGMRRwFhrAZtlJb2oonv7uzhQAslDChol0qGs='`,
  //   `'sha256-XozX+8sZ0KwynC7Ue/fccB5YCmcoOKSnOWmV2VdLM3c='`,
  //   `'sha256-PN4U1OVZZn0spBA/+++6CuQlugAzwSmQfDQuKRAQE2M='`,
  //   `'sha256-j50mogdgqyoyWOIg3RNS99k8/VX9nF+xbKICEt9pPXY='`,
  //   `'sha256-g6kgQC7tv47ZOxXCH5NcqyXz0yO8Jj+nExgKbw99Ns4='`,
  //   `'sha256-ULSkX3LjLXutvCpa9M8m//NTXVD+O+TYax1kyBsE6jo='`,
  //   `'sha256-/XPufXKTgrrhDe0bfPGvlQY6+mFeqst1DQpeQdCPLtk='`,
  //   `'sha256-evE75dxaCGTpHsEZ7DXYMwympHVx3XkLXk1ad2cyHiM='`,
  //   `'sha256-0+WdduhI85OzJ8YoPeR3C9I/iPY9WinTGHvzlGUSlf8='`,
  //   `'sha256-8j83q0INWNW0ozDkcbO5B6/KIBQZGgkPrroOsnVzzNU='`,
  //   `'sha256-DsFcvYGD35XPckKLTgRTuwLnxhg9URuwXgu3g5HQxFk='`,
  //   `'sha256-f0te7P6ZbE9iADjkKYvtsMOW8OtaZWMHNTJPQZVa58Y='`,
  //   `'sha256-D7sy7olsiO3VJETSyGbEuyKOWEPhepMoRsJTHYTiTFw='`,
  //   `'sha256-lxduVeO8vv9sYkFhc2iiIjpDMVoQUHY0xQ9NC/6worE='`,
  //   `'sha256-DDUf+DSx8+0zcUPBUoAoi/69Tnq+jNOCsW/LQUVCA64='`,
  //   `'sha256-E4Mt+Z/XFEshRm7Qjn69dhMa6AEEcZQORxQ1QLxCzLc='`,
  //   `'sha256-OivKBb1KpvZbvMmsEVIeLGHcweaKmaeUaAKZOwxtO2E='`,
  //   `'sha256-XcC9ewI1FeuiVulqLrsyJJ6lyGV4uaXiRONA+yHvGpU='`,
  //   `'sha256-/iGo6UcGpuIiFpkHRmvdEsvbMOU2ko7B2G31x813+iw='`,
  //   `'sha256-+K6LAjofIxF4uGlLSV1o32DsYI1cMUku2JDTLK+dyB4='`,
  //   `'sha256-x5pSi4aBbx6GLeWwpe9/cW9QW9m9ejdLaPHKYR5B77A='`


  // ]
  // const cspDirectives = [
  //   "default-src 'self'",
  //   `script-src 'self' 'wasm-unsafe-eval'  'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com`,
  //   "style-src 'self' 'unsafe-inline'",
  //   "connect-src 'self' blob: https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://region1.google-analytics.com",
  //   "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://*.amazonaws.com https://s3.amazonaws.com",

  //   "worker-src 'self' blob:",
  //   "child-src 'self' blob:"
  // ];


  let scriptSrc: string;

  if (dev) {
    // Relaxed CSP for development - allows hot reloading
    scriptSrc = `'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com`;
  } else {
    // Strict CSP for production
    scriptSrc = `'self' 'wasm-unsafe-eval' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com`;
  }

  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' blob: https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://region1.google-analytics.com",
    "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://*.amazonaws.com https://s3.amazonaws.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:"
  ];


  response.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; '));

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};