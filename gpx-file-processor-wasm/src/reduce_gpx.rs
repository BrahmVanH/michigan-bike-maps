//! GPX Size Reduction Module
//!
//! This module provides functionality for reducing the size of GPX files by:
//! - Simplifying the GPX structure to only essential elements
//! - Rounding coordinate precision to reduce decimal places
//! - Removing unnecessary metadata while preserving the route information

use gpx::Gpx;                  // GPX parsing and representation
use wasm_bindgen::JsValue;     // WebAssembly <-> JavaScript interop

// Import custom types from the parent module
use crate::{ count_points, parse_gpx_from_string, SmlrGpx, SmlrTrack, SmlrTrackPoint, SmlrTrackSegment };

/// Reduces the size of a GPX file by simplifying its structure and precision.
///
/// This function performs several optimizations to reduce GPX file size:
/// 1. Parses the original GPX XML string into a structured format
/// 2. Converts it to a simplified structure that omits non-essential data
/// 3. Reduces coordinate precision by rounding to two decimal places
/// 4. Serializes the simplified structure to a JSON string
///
/// The resulting JSON representation is typically much smaller than the original 
/// XML while preserving the essential geospatial data needed for visualization 
/// and basic analysis.
///
/// # Arguments
/// * `gpx_string` - The original GPX file content as an XML string
///
/// # Returns
/// * `Result<String, JsValue>` - A JSON string of the simplified GPX or an error
///
/// # Errors
/// * Returns a JavaScript error value if GPX parsing fails
/// * Returns a JavaScript error value if JSON serialization fails
pub fn reduce_gpx_size(gpx_string: &str) -> Result<String, JsValue> {
      
    // Check input size
    if gpx_string.len() > 50_000_000 { // 50MB max
        return Err(JsValue::from_str("GPX file too large (max 50MB)"));
    }
    
    // Limit the number of points to process
    let max_points = 100000; 
    
    // Parse the original GPX XML string into a structured Gpx object
    let gpx: Gpx = parse_gpx_from_string(gpx_string).map_err(|e|
        JsValue::from_str(&format!("Error reducing gpx file: {}", e))
    )?;

       // Count points to ensure we don't process overly complex files
       let point_count = count_points(&gpx);
       if point_count > max_points {
           return Err(JsValue::from_str(
               &format!("GPX file contains too many points ({} > {} max)", 
                       point_count, max_points)
           ));
       }
       

    // Declare the simplified GPX structure to be populated
    let smlr_gpx: SmlrGpx;

    // Create a vector to hold simplified tracks
    let mut smlr_trk: Vec<SmlrTrack> = Vec::new();
    
    // Process each track in the original GPX file
    for (_track_index, track) in gpx.tracks.iter().enumerate() {
        // Create a vector to hold simplified track segments for this track
        let mut smlr_trk_segs: Vec<SmlrTrackSegment> = Vec::new();

        // Process each segment in the current track
        for seg in &track.segments {
            let smlr_seg: SmlrTrackSegment;

            // Create a vector to hold simplified track points for this segment
            let mut smlr_trk_pts: Vec<SmlrTrackPoint> = Vec::new();
            
            // Process each track point in the current segment
            for track_point in &seg.points {
                // Round latitude and longitude to 2 decimal places (approx. 1.1km precision)
                // This significantly reduces file size while maintaining reasonable accuracy
                let rounded_lat = (track_point.point().y() * 100.0).round() / 100.0;
                let rounded_lon = (track_point.point().x() * 100.0).round() / 100.0;
                
                // Round elevation to 2 decimal places if available, or default to 0
                // Note: Some GPX files may not include elevation data
                let rounded_ele = match track_point.elevation {
                    Some(ele) => (ele * 100.0).round() / 100.0,
                    None => 0.0,
                };

                // Create a simplified track point with the rounded coordinates
                let smlr_trk_pt = SmlrTrackPoint {
                    lat: rounded_lat,
                    lon: rounded_lon,
                    ele: Some(rounded_ele),
                };
                
                // Add the simplified point to our collection
                smlr_trk_pts.push(smlr_trk_pt);
            }

            // Create a simplified track segment containing the processed points
            smlr_seg = SmlrTrackSegment {
                trkpt: smlr_trk_pts,
            };

            // Add the simplified segment to our collection
            smlr_trk_segs.push(smlr_seg);
        }

        // Create a simplified track containing the processed segments
        let smlr_track = SmlrTrack {
            trkseg: smlr_trk_segs,
        };

        // Add the simplified track to our collection
        smlr_trk.push(smlr_track);
    }

    // Create the final simplified GPX structure
    smlr_gpx = SmlrGpx {
        trk: smlr_trk,
    };

    // Serialize the simplified GPX to a JSON string
    // This is more compact than XML and easier to process in web applications
    let smlr_gpx_str = serde_json::to_string(&smlr_gpx)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;

    // Return the simplified GPX as a JSON string
    Ok(smlr_gpx_str)
}