use std::io::Write;

use flate2::{ write::GzEncoder, Compression };
use wasm_bindgen::JsValue;

pub fn compress_gpx(data: &str) -> Result<Vec<u8>, JsValue> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::new(6));

    let cleaned_data = remove_excess_whitespace(data);

    encoder
        .write_all(cleaned_data.as_bytes())
        .map_err(|e| JsValue::from_str(&format!("Compression error: {}", e)))?;

    encoder.finish().map_err(|e| JsValue::from_str(&format!("Compression error: {}", e)))
}

fn remove_excess_whitespace(xml: &str) -> String {
    // Simple whitespace cleanup - you might want more sophisticated XML minification
    xml.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}
