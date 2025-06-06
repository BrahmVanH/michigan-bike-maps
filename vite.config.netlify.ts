// vite.config.netlify.ts
import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    // Netlify-specific configuration
    build: {
      outDir: 'build',
      rollupOptions: {
        // Ensure WASM files are properly handled
        output: {
          manualChunks: {
            wasm: ['@wasm/gpx_file_processor_wasm']
          }
        }
      }
    }
  })
);