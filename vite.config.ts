import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import svg from '@poppanator/sveltekit-svg';
import wasmPack from 'vite-plugin-wasm-pack';
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
	}), wasmPack("./gpx-file-processor-wasm/")],
	server: {
		hmr: {
			overlay: true
		},
		fs: {
			strict: false
		}
	},
	resolve: {
		alias: {
			'@wasm': '/wasm'
		}
	}
});
