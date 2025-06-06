// Standard library imports for I/O operations
use std::io::Write;

// External crate imports
use flate2::{ write::GzEncoder, Compression }; // For gzip compression
use wasm_bindgen::JsValue; // For WebAssembly <-> JavaScript interop

/**
 * Compresses a GPX file string using gzip compression.
 * 
 * This function takes a GPX XML string, removes excess whitespace to reduce size,
 * and then applies gzip compression with a moderate compression level (6).
 * The compression level balances between compression ratio and processing time.
 * 
 * @param data - The GPX file content as a string
 * @returns A Result containing either the compressed bytes or a JavaScript error value
 */
pub fn compress_gpx(data: &str) -> Result<Vec<u8>, JsValue> {
    // Initialize a gzip encoder with compression level 6 (moderate)
    // Level range is 0-9: 0=no compression, 9=max compression
    let mut encoder = GzEncoder::new(Vec::new(), Compression::new(6));

    // Pre-process the data to remove unnecessary whitespace
    let cleaned_data = remove_excess_whitespace(data);

    // Write the cleaned data to the encoder
    // Convert any IO errors to JavaScript errors for proper error handling in the browser
    encoder
        .write_all(cleaned_data.as_bytes())
        .map_err(|e| JsValue::from_str(&format!("Compression error: {}", e)))?;

    // Finalize the compression and return the compressed bytes
    // This consumes the encoder and returns the compressed data
    encoder.finish().map_err(|e| JsValue::from_str(&format!("Compression error: {}", e)))
}

/**
 * Removes excess whitespace from XML content to reduce file size.
 * 
 * This function:
 * 1. Splits the input string into lines
 * 2. Trims whitespace from each line
 * 3. Filters out empty lines
 * 4. Rejoins the lines with newline characters
 * 
 * While this is not a full XML minification, it significantly reduces
 * file size while maintaining XML structure and readability.
 * 
 * @param xml - The XML string to process
 * @returns A new string with excess whitespace removed
 */
fn remove_excess_whitespace(xml: &str) -> String {
    xml.lines()                         // Split into lines
        .map(|line| line.trim())        // Remove leading/trailing whitespace
        .filter(|line| !line.is_empty()) // Remove empty lines
        .collect::<Vec<_>>()            // Collect into a vector
        .join("\n")                     // Join with newlines
}