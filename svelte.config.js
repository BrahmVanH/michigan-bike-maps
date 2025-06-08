import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		alias: {
			"@/*": "./src/lib/*",
			"@types/*": './types/*',
			'@wasm': './static/wasm',

		}, adapter: adapter(),
		csp: {
			mode: 'auto', // This generates nonces automatically
			directives: {
				'script-src': [
					'self',
					'wasm-unsafe-eval',
					'https://www.googletagmanager.com',
					'https://www.google-analytics.com'
					// SvelteKit will automatically add nonces here
				],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': [
					'self',
					'data:',
					'https://www.google-analytics.com',
					'https://www.googletagmanager.com',
					'https://*.amazonaws.com'
				],
				'connect-src': [
					'self',
					'blob:',
					'https://www.google-analytics.com',
					'https://analytics.google.com',
					'https://www.googletagmanager.com',
					'https://api.iconify.design',
					'https://api.unisvg.com',
					'https://api.simplesvg.com'
				],
				'worker-src': ['self', 'blob:'],
				'child-src': ['self', 'blob:'],
				'form-action': ['self'],
				'frame-ancestors': ["'none'"]
			}
		}
	}
};

export default config;
