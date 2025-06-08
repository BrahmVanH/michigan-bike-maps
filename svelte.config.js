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
		csp: process.env.NODE_ENV === 'production' ? {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'wasm-unsafe-eval', 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'https://www.google-analytics.com', 'https://www.googletagmanager.com', 'https://*.amazonaws.com'],
				'connect-src': ['self', 'blob:', 'https://www.google-analytics.com', 'https://analytics.google.com', 'https://www.googletagmanager.com'],
				'worker-src': ['self', 'blob:'],
				'child-src': ['self', 'blob:']
			}
		} : undefined
	}
};

export default config;
