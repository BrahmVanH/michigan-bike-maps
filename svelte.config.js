import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		alias: {
			"@/*": "./src/lib/*",
			'@wasm': './static/wasm'

		}, adapter: adapter()
	}
};

export default config;
