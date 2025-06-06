
use compress_gpx::compress_gpx;
use flate2::bufread::GzDecoder;
use gpx::Gpx;
use reduce_gpx::reduce_gpx_size;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use std::{collections::HashMap, io::Read};
use js_sys;

mod reduce_gpx;
mod compress_gpx;

#[derive(Debug, Serialize, Deserialize)]
pub struct SmlrGpx {
    trk: Vec<SmlrTrack>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SmlrTrack {
    trkseg: Vec<SmlrTrackSegment>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SmlrTrackSegment {
    trkpt: Vec<SmlrTrackPoint>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SmlrTrackPoint {
    #[serde(rename = "@lat")]
    lat: f64,
    #[serde(rename = "@lon")]
    lon: f64,
    ele: Option<f64>,
}



// Structure to hold analysis data
#[derive(Debug, Serialize, Deserialize)]
pub struct GpxAnalysis {
    original_size_bytes: usize,
    reduced_size_bytes: usize,
    compressed_size_bytes: usize,
    compression_ratio: f64,
    point_count: usize,
    reduced_point_count: usize,
    point_reduction_ratio: f64,
    tracks_count: usize,
    segments_count: usize,
    elevation_range: Option<(f64, f64)>,
    bounding_box: Option<BoundingBox>,
    timing_ms: HashMap<String, f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BoundingBox {
    min_lat: f64,
    max_lat: f64,
    min_lon: f64, 
    max_lon: f64,
}

// This function returns detailed analysis of the GPX processing
#[wasm_bindgen]
pub fn analyze_gpx(gpx_string: &str) -> Result<JsValue, JsValue> {
    // Track timings
    let mut timings = HashMap::new();
    let start_time = js_sys::Date::now();
    
    // Parse original GPX
    let original_gpx = match parse_gpx_from_string(gpx_string) {
        Ok(gpx) => gpx,
        Err(e) => return Err(JsValue::from_str(&format!("Error parsing GPX: {}", e))),
    };
    
    timings.insert("parsing".to_string(), js_sys::Date::now() - start_time);
    
    // Analyze original GPX
    let original_size = gpx_string.len();
    let original_point_count = count_points(&original_gpx);
    let tracks_count = original_gpx.tracks.len();
    let segments_count = original_gpx.tracks.iter()
        .map(|track| track.segments.len())
        .sum();
    
    // Calculate elevation range
    let elevation_range = calculate_elevation_range(&original_gpx);
    
    // Calculate bounding box
    let bounding_box = calculate_bounding_box(&original_gpx);
    
    // Reduce GPX
    let reduce_start = js_sys::Date::now();
    let reduced_gpx_string = match reduce_gpx_size(gpx_string) {
        Ok(reduced) => reduced,
        Err(e) => return Err(e),
    };
    timings.insert("reduction".to_string(), js_sys::Date::now() - reduce_start);
    
    // Parse the reduced GPX to count points
    let reduced_gpx: SmlrGpx = match serde_json::from_str(&reduced_gpx_string) {
        Ok(gpx) => gpx,
        Err(e) => return Err(JsValue::from_str(&format!("Error parsing reduced GPX: {}", e))),
    };
    
    let reduced_point_count = reduced_gpx.trk.iter()
        .flat_map(|track| &track.trkseg)
        .map(|segment| segment.trkpt.len())
        .sum();
    
    // Compress GPX
    let compress_start = js_sys::Date::now();
    let compressed_gpx = match compress_gpx(&reduced_gpx_string) {
        Ok(compressed) => compressed,
        Err(e) => return Err(e),
    };
    timings.insert("compression".to_string(), js_sys::Date::now() - compress_start);
    
    // Calculate metrics
    let reduced_size = reduced_gpx_string.len();
    let compressed_size = compressed_gpx.len();
    let compression_ratio = if original_size > 0 {
        1.0 - (compressed_size as f64 / original_size as f64)
    } else {
        0.0
    };
    
    let point_reduction_ratio = if original_point_count > 0 {
        1.0 - (reduced_point_count as f64 / original_point_count as f64)
    } else {
        0.0
    };
    
    // Create analysis object
    let analysis = GpxAnalysis {
        original_size_bytes: original_size,
        reduced_size_bytes: reduced_size,
        compressed_size_bytes: compressed_size,
        compression_ratio,
        point_count: original_point_count,
        reduced_point_count,
        point_reduction_ratio,
        tracks_count,
        segments_count,
        elevation_range,
        bounding_box,
        timing_ms: timings,
    };
    
    // Serialize to JS
    match serde_wasm_bindgen::to_value(&analysis) {
        Ok(js) => Ok(js),
        Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
    }
}

// Helper function to count points in a GPX file
fn count_points(gpx: &Gpx) -> usize {
    gpx.tracks.iter()
        .flat_map(|track| &track.segments)
        .map(|segment| segment.points.len())
        .sum()
}

// Helper function to calculate elevation range
fn calculate_elevation_range(gpx: &Gpx) -> Option<(f64, f64)> {
    let elevations: Vec<f64> = gpx.tracks.iter()
        .flat_map(|track| &track.segments)
        .flat_map(|segment| &segment.points)
        .filter_map(|point| point.elevation)
        .collect();
    
    if elevations.is_empty() {
        return None;
    }
    
    let min_ele = elevations.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max_ele = elevations.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
    
    Some((min_ele, max_ele))
}

// Helper function to calculate bounding box
fn calculate_bounding_box(gpx: &Gpx) -> Option<BoundingBox> {
    let mut min_lat = f64::INFINITY;
    let mut max_lat = f64::NEG_INFINITY;
    let mut min_lon = f64::INFINITY;
    let mut max_lon = f64::NEG_INFINITY;
    
    let mut has_points = false;
    
    for track in &gpx.tracks {
        for segment in &track.segments {
            for point in &segment.points {
                has_points = true;
                let lat = point.point().y();
                let lon = point.point().x();
                
                min_lat = min_lat.min(lat);
                max_lat = max_lat.max(lat);
                min_lon = min_lon.min(lon);
                max_lon = max_lon.max(lon);
            }
        }
    }
    
    if !has_points {
        return None;
    }
    
    Some(BoundingBox {
        min_lat,
        max_lat,
        min_lon,
        max_lon,
    })
}

// Enhanced version of reduce_compress_gpx that also returns analytics
#[wasm_bindgen]
pub fn process_gpx_with_analytics(gpx_string: &str) -> Result<JsValue, JsValue> {
    // First analyze the GPX
    let analysis_js = analyze_gpx(gpx_string)?;
    
    // Then perform the reduction and compression
    let compressed_data = reduce_compress_gpx(gpx_string)?;
    
    // Create a result object with both the compressed data and analysis
    let result = js_sys::Object::new();
    js_sys::Reflect::set(&result, &JsValue::from_str("analysis"), &analysis_js)
        .map_err(|_| JsValue::from_str("Error setting analysis property"))?;
    
    // Convert binary data to Uint8Array for JavaScript
    let array = js_sys::Uint8Array::new_with_length(compressed_data.len() as u32);
    array.copy_from(&compressed_data);
    
    js_sys::Reflect::set(&result, &JsValue::from_str("data"), &array)
        .map_err(|_| JsValue::from_str("Error setting data property"))?;
    
    Ok(result.into())
}
#[wasm_bindgen]
pub fn reduce_compress_gpx(gpx_string: &str) -> Result<Vec<u8>, JsValue> {
    let smlr_gpx = reduce_gpx_size(gpx_string)?;

    let compressed_gpx = compress_gpx(&smlr_gpx)?;

    Ok(compressed_gpx)
}

#[wasm_bindgen]
pub fn decompress_gpx(compressed_data: &[u8]) -> Result<String, JsValue> {
    let mut decoder = GzDecoder::new(compressed_data);
    let mut decompressed_data = String::new();
    
    decoder
        .read_to_string(&mut decompressed_data)
        .map_err(|e| JsValue::from_str(&format!("Decompression error: {}", e)))?;
    
    Ok(decompressed_data)
}

fn parse_gpx_from_string(gpx_string: &str) -> Result<Gpx, String> {
    let gpx: Gpx = gpx::read(gpx_string.as_bytes()).map_err(|e| format!("Error parsing GPX: {}", e))?;
    Ok(gpx)
}
