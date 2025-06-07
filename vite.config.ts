import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import svg from '@poppanator/sveltekit-svg';
import wasmPack from 'vite-plugin-wasm-pack';
import { defineConfig } from 'vite';
import { partytownVite } from '@qwik.dev/partytown/utils';
import path from 'path';

export default defineConfig({
	plugins: [enhancedImages(), tailwindcss(), sveltekit(), partytownVite({
		dest: path.join(__dirname, "static", "~partytown")
	}), svg({
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
			strict: false,
			allow: ['..']
		}
	},
	resolve: {
		alias: {
			'@wasm': '/wasm',
			'@': './src',
		}
	},
	optimizeDeps: {
		exclude: ['@wasm/gpx_file_processor_wasm']
	}
});
