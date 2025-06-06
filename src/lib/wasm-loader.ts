import { browser } from '$app/environment';

let wasmModule: any = null;
let isLoading = false;

export async function loadWasmModule() {
  if (!browser) return null;
  if (wasmModule) return wasmModule;

  isLoading = true;

  try {
    const wasmUrl = '/wasm/gpx_file_processor_wasm_bg.wasm';
    const response = await fetch(wasmUrl);
    const responseClone = response.clone();

    const { instance, module } = await WebAssembly.instantiateStreaming(
      responseClone,
      {}
    );

    const wasmModule = await import('@wasm/gpx_file_processor_wasm');
    await wasmModule.default(module);

    return wasmModule;
  } catch (error) {
    console.error('Failed to load WASM module:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

export async function processGpx(gpxString: string) {
  const module = await loadWasmModule();
  if (!module) throw new Error('WASM module not loaded');

  return module.process_gpx_with_analytics(gpxString);
}