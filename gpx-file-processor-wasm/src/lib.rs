//! GPX File Processor WASM Module
//!
//! This WebAssembly module provides functionality for processing GPX (GPS Exchange Format) files:
//! - Reducing file size by simplifying track points
//! - Compressing GPX data using gzip
//! - Analyzing GPX files for metadata and statistics
//! - Decompressing previously compressed GPX files
//!
//! The module is designed to be used in web applications via WebAssembly.

// Standard library imports
use std::{collections::HashMap, io::Read};

// External crate imports
use compress_gpx::compress_gpx;                // Custom compression module
use flate2::bufread::GzDecoder;                // Decompression functionality
use gpx::Gpx;                                  // GPX parsing and representation
use js_sys;                                    // JavaScript interop utilities
use reduce_gpx::reduce_gpx_size;               // Custom GPX size reduction module
use serde::{Deserialize, Serialize};           // Serialization framework
use wasm_bindgen::prelude::*;                  // WebAssembly bindings

// Local module imports
mod compress_gpx;   // Module for GPX compression functionality
mod reduce_gpx;     // Module for GPX size reduction algorithms

/// Simplified GPX structure for serialization and compression.
///
/// This structure maintains only the essential elements of a GPX file
/// to reduce size while preserving the core geospatial data.
#[derive(Debug, Serialize, Deserialize)]
pub struct SmlrGpx {
    trk: Vec<SmlrTrack>,  // Collection of tracks in the GPX file
}

/// Simplified representation of a GPX track.
#[derive(Debug, Serialize, Deserialize)]
struct SmlrTrack {
    trkseg: Vec<SmlrTrackSegment>,  // Segments within this track
}

/// Simplified representation of a track segment.
#[derive(Debug, Serialize, Deserialize)]
struct SmlrTrackSegment {
    trkpt: Vec<SmlrTrackPoint>,  // Track points within this segment
}

/// Simplified representation of a track point with only essential data.
///
/// Maintains latitude, longitude, and optional elevation while
/// removing timestamps and other metadata to reduce size.
#[derive(Debug, Serialize, Deserialize)]
struct SmlrTrackPoint {
    #[serde(rename = "@lat")]
    lat: f64,           // Latitude in decimal degrees
    #[serde(rename = "@lon")]
    lon: f64,           // Longitude in decimal degrees
    ele: Option<f64>,   // Optional elevation in meters
}

/// Comprehensive analysis of a GPX file including size metrics and geographical information.
///
/// This structure contains detailed information about the original GPX file,
/// as well as metrics about the compression and reduction process.
#[derive(Debug, Serialize, Deserialize)]
pub struct GpxAnalysis {
    original_size_bytes: usize,         // Size of the original GPX file in bytes
    reduced_size_bytes: usize,          // Size after point reduction in bytes
    compressed_size_bytes: usize,       // Size after compression in bytes
    compression_ratio: f64,             // Ratio of compression (0.0-1.0, higher is better)
    point_count: usize,                 // Number of track points in original file
    reduced_point_count: usize,         // Number of track points after reduction
    point_reduction_ratio: f64,         // Ratio of point reduction (0.0-1.0)
    tracks_count: usize,                // Number of tracks in the file
    segments_count: usize,              // Total number of track segments
    elevation_range: Option<(f64, f64)>, // Min and max elevation if available
    bounding_box: Option<BoundingBox>,  // Geographical bounds of the GPX data
    timing_ms: HashMap<String, f64>,    // Performance metrics for processing steps
}

/// Geographical bounding box for the GPX data.
///
/// Represents the minimum and maximum latitude and longitude
/// values found in the GPX file, defining its geographical extent.
#[derive(Debug, Serialize, Deserialize)]
pub struct BoundingBox {
    min_lat: f64,  // Minimum latitude in decimal degrees
    max_lat: f64,  // Maximum latitude in decimal degrees
    min_lon: f64,  // Minimum longitude in decimal degrees
    max_lon: f64,  // Maximum longitude in decimal degrees
}

/// Validates that a string contains well-formed GPX data
///
/// This function performs several checks:
/// 1. Ensures the input isn't too large
/// 2. Validates that it contains valid XML
/// 3. Confirms it has the expected GPX structure
///
/// @param gpx_string - The GPX content to validate
/// @returns Whether the input is valid GPX data
#[wasm_bindgen]
pub fn validate_gpx(gpx_string: &str) -> bool {
    // Check for reasonable size
    if gpx_string.len() > 50_000_000 { // 50MB max
        return false;
    }
    
    // Check for XML header
    if !gpx_string.trim().starts_with("<?xml") {
        return false;
    }
    
    // Check for GPX tag
    if !gpx_string.contains("<gpx") {
        return false;
    }
    
    // Attempt to parse as GPX (most thorough validation)
    match parse_gpx_from_string(gpx_string) {
        Ok(_) => true,
        Err(_) => false
    }
}

/// Analyzes a GPX file string and returns detailed metrics and statistics.
///
/// This function performs a comprehensive analysis of the GPX file including:
/// - Size metrics (original, reduced, and compressed sizes)
/// - Track point statistics (count, reduction)
/// - Geographical information (elevation range, bounding box)
/// - Performance metrics for each processing step
///
/// # Arguments
/// * `gpx_string` - The raw GPX file content as a string
///
/// # Returns
/// * `Result<JsValue, JsValue>` - A JavaScript object containing analysis data or an error
#[wasm_bindgen]
pub fn analyze_gpx(gpx_string: &str) -> Result<JsValue, JsValue> {
    // Initialize timing tracking for performance analysis
    let mut timings = HashMap::new();
    let start_time = js_sys::Date::now();
    
    // Parse the original GPX file
    let original_gpx = match parse_gpx_from_string(gpx_string) {
        Ok(gpx) => gpx,
        Err(e) => return Err(JsValue::from_str(&format!("Error parsing GPX: {}", e))),
    };
    
    // Record parsing time
    timings.insert("parsing".to_string(), js_sys::Date::now() - start_time);
    
    // Extract basic metrics from the original GPX file
    let original_size = gpx_string.len();
    let original_point_count = count_points(&original_gpx);
    let tracks_count = original_gpx.tracks.len();
    let segments_count = original_gpx.tracks.iter()
        .map(|track| track.segments.len())
        .sum();
    
    // Calculate additional geographical metrics
    let elevation_range = calculate_elevation_range(&original_gpx);
    let bounding_box = calculate_bounding_box(&original_gpx);
    
    // Reduce the GPX file size by simplifying track points
    let reduce_start = js_sys::Date::now();
    let reduced_gpx_string = match reduce_gpx_size(gpx_string) {
        Ok(reduced) => reduced,
        Err(e) => return Err(e),
    };
    timings.insert("reduction".to_string(), js_sys::Date::now() - reduce_start);
    
    // Parse the reduced GPX to extract metrics
    let reduced_gpx: SmlrGpx = match serde_json::from_str(&reduced_gpx_string) {
        Ok(gpx) => gpx,
        Err(e) => return Err(JsValue::from_str(&format!("Error parsing reduced GPX: {}", e))),
    };
    
    // Count points in the reduced GPX
    let reduced_point_count = reduced_gpx.trk.iter()
        .flat_map(|track| &track.trkseg)
        .map(|segment| segment.trkpt.len())
        .sum();
    
    // Compress the reduced GPX
    let compress_start = js_sys::Date::now();
    let compressed_gpx = match compress_gpx(&reduced_gpx_string) {
        Ok(compressed) => compressed,
        Err(e) => return Err(e),
    };
    timings.insert("compression".to_string(), js_sys::Date::now() - compress_start);
    
    // Calculate size metrics
    let reduced_size = reduced_gpx_string.len();
    let compressed_size = compressed_gpx.len();
    
    // Calculate compression ratio (higher is better)
    let compression_ratio = if original_size > 0 {
        1.0 - (compressed_size as f64 / original_size as f64)
    } else {
        0.0
    };
    
    // Calculate point reduction ratio (higher means more points removed)
    let point_reduction_ratio = if original_point_count > 0 {
        1.0 - (reduced_point_count as f64 / original_point_count as f64)
    } else {
        0.0
    };
    
    // Create the analysis object with all collected metrics
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
    
    // Serialize to JavaScript value for return
    match serde_wasm_bindgen::to_value(&analysis) {
        Ok(js) => Ok(js),
        Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
    }
}

/// Counts the total number of track points in a GPX file.
///
/// # Arguments
/// * `gpx` - The parsed GPX structure
///
/// # Returns
/// * `usize` - The total count of track points across all segments and tracks
fn count_points(gpx: &Gpx) -> usize {
    gpx.tracks.iter()
        .flat_map(|track| &track.segments)
        .map(|segment| segment.points.len())
        .sum()
}

/// Calculates the minimum and maximum elevation values in a GPX file.
///
/// # Arguments
/// * `gpx` - The parsed GPX structure
///
/// # Returns
/// * `Option<(f64, f64)>` - Tuple of (min_elevation, max_elevation) or None if no elevation data
fn calculate_elevation_range(gpx: &Gpx) -> Option<(f64, f64)> {
    // Extract all elevation values from the GPX file
    let elevations: Vec<f64> = gpx.tracks.iter()
        .flat_map(|track| &track.segments)
        .flat_map(|segment| &segment.points)
        .filter_map(|point| point.elevation)
        .collect();
    
    // Return None if no elevation data is available
    if elevations.is_empty() {
        return None;
    }
    
    // Find minimum and maximum elevation values
    let min_ele = elevations.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max_ele = elevations.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
    
    Some((min_ele, max_ele))
}

/// Calculates the geographical bounding box of a GPX file.
///
/// # Arguments
/// * `gpx` - The parsed GPX structure
///
/// # Returns
/// * `Option<BoundingBox>` - Bounding box with min/max lat/lon or None if no points
fn calculate_bounding_box(gpx: &Gpx) -> Option<BoundingBox> {
    let mut min_lat = f64::INFINITY;
    let mut max_lat = f64::NEG_INFINITY;
    let mut min_lon = f64::INFINITY;
    let mut max_lon = f64::NEG_INFINITY;
    
    let mut has_points = false;
    
    // Iterate through all points to find min/max values
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
    
    // Return None if no points were found
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

/// Processes a GPX file and returns both the compressed data and analysis metrics.
///
/// This is the main entry point for complete GPX processing, combining
/// size reduction, compression, and analysis into a single function.
///
/// # Arguments
/// * `gpx_string` - The raw GPX file content as a string
///
/// # Returns
/// * `Result<JsValue, JsValue>` - A JavaScript object containing both compressed data and analysis
#[wasm_bindgen]
pub fn process_gpx_with_analytics(gpx_string: &str) -> Result<JsValue, JsValue> {
    // Analyze the GPX file
    let analysis_js = analyze_gpx(gpx_string)?;
    
    // Reduce and compress the GPX file
    let compressed_data = reduce_compress_gpx(gpx_string)?;
    
    // Create a JavaScript object to hold both results
    let result = js_sys::Object::new();
    
    // Add the analysis data to the result object
    js_sys::Reflect::set(&result, &JsValue::from_str("analysis"), &analysis_js)
        .map_err(|_| JsValue::from_str("Error setting analysis property"))?;
    
    // Convert the compressed data to a JavaScript Uint8Array
    let array = js_sys::Uint8Array::new_with_length(compressed_data.len() as u32);
    array.copy_from(&compressed_data);
    
    // Add the compressed data to the result object
    js_sys::Reflect::set(&result, &JsValue::from_str("data"), &array)
        .map_err(|_| JsValue::from_str("Error setting data property"))?;
    
    Ok(result.into())
}

/// Reduces and compresses a GPX file in one operation.
///
/// This function combines the size reduction and compression steps
/// into a single operation for efficiency.
///
/// # Arguments
/// * `gpx_string` - The raw GPX file content as a string
///
/// # Returns
/// * `Result<Vec<u8>, JsValue>` - The compressed binary data or an error
#[wasm_bindgen]
pub fn reduce_compress_gpx(gpx_string: &str) -> Result<Vec<u8>, JsValue> {
    // First reduce the GPX file size by simplifying track points
    let smlr_gpx = reduce_gpx_size(gpx_string)?;

    // Then compress the reduced GPX file
    let compressed_gpx = compress_gpx(&smlr_gpx)?;

    Ok(compressed_gpx)
}

/// Decompresses a previously compressed GPX file.
///
/// This function reverses the compression process, converting
/// compressed binary data back to the original GPX XML string.
///
/// # Arguments
/// * `compressed_data` - The compressed binary data
///
/// # Returns
/// * `Result<String, JsValue>` - The decompressed GPX string or an error
#[wasm_bindgen]
pub fn decompress_gpx(compressed_data: &[u8]) -> Result<String, JsValue> {
    // Create a gzip decoder for the compressed data
    let mut decoder = GzDecoder::new(compressed_data);
    let mut decompressed_data = String::new();
    
    // Read the decompressed data into a string
    decoder
        .read_to_string(&mut decompressed_data)
        .map_err(|e| JsValue::from_str(&format!("Decompression error: {}", e)))?;
    
    Ok(decompressed_data)
}

/// Parses a GPX string into a structured Gpx object.
///
/// # Arguments
/// * `gpx_string` - The raw GPX file content as a string
///
/// # Returns
/// * `Result<Gpx, String>` - The parsed GPX structure or an error message
fn parse_gpx_from_string(gpx_string: &str) -> Result<Gpx, String> {
    // Use the gpx crate to parse the GPX XML
    let gpx: Gpx = gpx::read(gpx_string.as_bytes()).map_err(|e| format!("Error parsing GPX: {}", e))?;
    Ok(gpx)
}