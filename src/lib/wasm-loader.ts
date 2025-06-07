import { browser } from '$app/environment';

let wasmModule: any = null;
let isLoading = false;

export async function loadWasmModule() {
  if (!browser) return null;
  if (wasmModule) return wasmModule;

  if (isLoading) {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (wasmModule) {
          clearInterval(checkInterval);
          resolve(wasmModule);
        }
      }, 100);
    });
  }

  isLoading = true;

  try {

    try {
      const importedModule = await import('@wasm/gpx_file_processor_wasm');
      wasmModule = importedModule;
      return wasmModule;
    } catch (importError) {

      console.log('Dynamic import failed, trying manual WebAssembly instantiation...', importError);

      const wasmUrl = '/wasm/gpx_file_processor_wasm_bg.wasm';
      const response = await fetch(wasmUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch WASM file: ${response.status} ${response.statusText}`);
      }

      const wasmBytes = await response.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(wasmBytes, {});

      return wasmModule.instance.exports;
    }
  } catch (error) {
    console.error('Failed to load WASM module:', error);
    isLoading = false;
    throw error;
  } finally {
    isLoading = false;
  }
}


/**
 * Safely processes a GPX string using the WASM module
 * @param gpxString The GPX data to process
 * @returns The processed GPX data
 */

export async function processGpx(gpxString: string) {
  const module = await loadWasmModule();
  if (!module) throw new Error('WASM module not loaded');

  try {
    return module.process_gpx_with_analytics(gpxString);
  } catch (error) {
    console.error('Error processing GPX data:', error);
    throw new Error('Failed to process GPX data. Please check file format and try again.');
  }
}

/**
 * Safely reduces and compresses a GPX string using the WASM module
 * @param gpxString The GPX data to compress
 * @returns The compressed GPX data
 */
export async function reduceCompressGpx(gpxString: string) {
  const module = await loadWasmModule();
  if (!module) throw new Error('WASM module not loaded');

  try {
    return module.reduce_compress_gpx(gpxString);
  } catch (error) {
    console.error('Error compressing GPX data:', error);
    throw new Error('Failed to compress GPX data. Please check file format and try again.');
  }
}