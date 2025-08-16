import { browser } from '$app/environment';

let wasmModule: any = null;
let isLoading = false;

export async function loadWasmModule() {
  if (!browser) return null;
  if (wasmModule) return wasmModule;

  if (isLoading) {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (wasmModule || !isLoading) {
          clearInterval(checkInterval);
          resolve(wasmModule);
        }
      }, 100);
    });
  }

  isLoading = true;

  try {

    // This should work with your vite.config.ts setup
    const wasmPkg = await import('@wasm/gpx_file_processor_wasm.js');

    // Initialize the WASM module
    if (typeof wasmPkg.default === 'function') {
      await wasmPkg.default(); // Initialize the WASM
    }

    wasmModule = wasmPkg;
    return wasmModule;

  } catch (error) {
    console.error('Failed to load WASM module:', error);

    try {

      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';

      const nonceElement = document.querySelector('script[nonce]');
      if (nonceElement) {
        scriptElement.nonce = nonceElement.getAttribute('nonce') || '';
      }

      scriptElement.src = '/wasm/gpx_file_processor_wasm.js';

      return new Promise((resolve, reject) => {
        scriptElement.onload = async () => {
          try {
            const globalWasm = (window as any).wasm_bindgen;
            if (globalWasm) {
              await globalWasm('/wasm/gpx_file_processor_wasm_bg.wasm');
              wasmModule = globalWasm;
              resolve(wasmModule);
            } else {
              reject(new Error('WASM module not found in global scope'));
            }
          } catch (err) {
            reject(err);
          }
        };

        scriptElement.onerror = () => {
          reject(new Error('Failed to load WASM script'));
        };

        document.head.appendChild(scriptElement);
      });

    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      throw fallbackError;
    }
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
    if (typeof module.process_gpx_with_analytics === 'function') {
      return module.process_gpx_with_analytics(gpxString);
    } else {
      throw new Error('process_gpx_with_analytics function not found in WASM module');
    }
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
    if (typeof module.reduce_compress_gpx === 'function') {
      return module.reduce_compress_gpx(gpxString);
    } else {
      throw new Error('reduce_compress_gpx function not found in WASM module');
    }
  } catch (error) {
    console.error('Error compressing GPX data:', error);
    throw new Error('Failed to compress GPX data. Please check file format and try again.');
  }
}


/**
 * Safely converts GeoTIFF to Jpeg using the WASM module
 * @param src The GeoTIFF data to compress
 * @returns The Jpeg buffer of the GeoTiff data
 */
// export async function getJpegFromGeoTiff(tiff: ArrayBuffer): Promise<Uint8Array> {
//   const module = await loadWasmModule();
//   if (!module) throw new Error('WASM module not loaded');

//   console.log("tiff: ", tiff);

//   try {
//     if (typeof module.convert_geotiff_to_jpeg_buffer === 'function') {
//       return module.convert_geotiff_to_jpeg_buffer(tiff);
//     } else {
//       throw new Error('convert_geotiff_to_jpeg_buffer function not found in WASM module');
//     }
//   } catch (error) {
//     console.error('Error converting GeoTIFF data:', error);
//     throw new Error('Failed to convert GeoTIFF data. Please check file format and try again.');
//   }
// }


