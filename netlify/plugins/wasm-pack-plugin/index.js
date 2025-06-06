module.exports = {
  onPreBuild: async ({ utils, inputs }) => {
    // Get inputs with defaults
    const wasmDir = inputs.wasmDir || './gpx-file-processor-wasm';
    const targetDir = inputs.targetDir || '../static/wasm';
    const target = inputs.target || 'web';

    console.log(`Setting up wasm-pack...`);
    console.log(`WASM directory: ${wasmDir}`);
    console.log(`Target directory: ${targetDir}`);
    console.log(`Build target: ${target}`);

    // Detect platform
    const isWindows = process.platform === 'win32';

    // Install wasm-pack - platform specific
    try {
      if (isWindows) {
        // For Windows local development
        console.log('Detected Windows environment');
        console.log('Checking if wasm-pack is installed...');

        try {
          // Try to check if wasm-pack is already installed
          await utils.run.command('wasm-pack --version');
          console.log('wasm-pack is already installed');
        } catch (error) {
          console.log('wasm-pack not found, installing with cargo...');
          await utils.run.command('cargo install wasm-pack');
        }
      } else {
        // For Linux/Unix (Netlify's actual build environment)
        console.log('Detected Unix environment');
        await utils.run.command('curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh');
      }

      console.log('wasm-pack setup completed');
    } catch (error) {
      utils.build.failBuild('Failed to install wasm-pack', { error });
    }

    // Build the WASM module
    console.log('Building WASM module...');
    try {
      await utils.run.command(`wasm-pack build ${wasmDir} --target ${target} --out-dir ${targetDir}`);

      // Run the modulize script
      console.log('Running modulize script...');
      await utils.run.command('node ./gpx-file-processor-wasm/modulize.js');

      console.log('WASM module built successfully');
    } catch (error) {
      utils.build.failBuild('Failed to build WASM module', { error });
    }
  }
};