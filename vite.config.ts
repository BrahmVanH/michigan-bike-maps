import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import svg from '@poppanator/sveltekit-svg';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [enhancedImages(), tailwindcss(), sveltekit(), svg({
		includePaths: ['./src/lib/images/'],
		svgoOptions: {
			multipass: true,
			plugins: [
				{
					name: 'preset-default',
					params: { overrides: { removeViewBox: false } }
				}
			]
		}
	})]
});
