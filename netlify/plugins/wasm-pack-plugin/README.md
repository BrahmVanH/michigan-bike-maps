# Netlify WASM Pack Plugin

This Netlify build plugin compiles Rust code to WebAssembly using wasm-pack during the Netlify build process.

## Usage

Add this to your `netlify.toml` file:

```toml
[[plugins]]
  package = "./netlify/plugins/wasm-pack-plugin"
  [plugins.inputs]
    wasmDir = "./path-to-rust-project"
    targetDir = "../path-to-output"
    target = "web"