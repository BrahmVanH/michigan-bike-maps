#!/bin/bash
set -e

echo "Starting Netlify build with Rust and WASM..."

# Install Rust
echo "Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
source ~/.cargo/env

# Add wasm32 target
echo "Adding wasm32 target..."
rustup target add wasm32-unknown-unknown

# Install wasm-pack
echo "Installing wasm-pack..."
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
export PATH="$HOME/.cargo/bin:$PATH"

# Verify installations
echo "Verifying installations..."
rustc --version
wasm-pack --version

# Install npm dependencies
echo "Installing npm dependencies..."
npm ci

# Build WASM
echo "Building WASM..."
cd gpx-file-processor-wasm
wasm-pack build --target web --out-dir pkg
cd ..

# Copy WASM files to static directory
echo "Copying WASM files..."
mkdir -p static/wasm
cp gpx-file-processor-wasm/pkg/* static/wasm/

# Run modulize script
echo "Running modulize script..."
npm run modulize-wasm

# Build SvelteKit
echo "Building SvelteKit..."
npm run build