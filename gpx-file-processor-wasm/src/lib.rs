use std::io::Cursor;

use compress_gpx::compress_gpx;
use gpx::Gpx;
use reduce_gpx::reduce_gpx_size;

mod reduce_gpx;
mod compress_gpx;

#[derive(Debug, Serialize, Deserialize)]
pub struct SmlrGpx {
    pub trk: Vec<SmlrTrack>,
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

#[wasm_bindgen]
pub fn reduce_compress_gpx(gpx_string: &str) {
    let smlr_gpx = reduce_gpx_size(gpx_string)?;

    let compressed_gpx = compress_gpx(smlr_gpx)?;

    Ok(compressed_gpx)
}

fn parse_gpx_from_string(gpx_string: &str) -> Result<Gpx, gpx::Error> {
    let gpx: Gpx = quick_xml::de::from_str(gpx_string)?;
    Ok(gpx)
}
