use gpx::Gpx;
use wasm_bindgen::JsValue;

use crate::{ parse_gpx_from_string, SmlrGpx, SmlrTrack, SmlrTrackPoint, SmlrTrackSegment };

pub fn reduce_gpx_size(gpx_string: &str) -> Result<SmlrGpx, JsValue> {
    let gpx: Gpx = parse_gpx_from_string(gpx_string).map_err(|e|
        JsValue::from_str(&format!("Error reducing gpx file: {}", e))
    )?;

    let smlr_gpx: SmlrGpx;

    let mut sml_trk: Vec<SmlrTrack> = Vec::new();
    for (track_index, track) in gpx.tracks.iter().enumerate() {
        if let Some(name) = &track.name {
            println!("Track name: {}", name);
        }

        let total_points: usize = track.segments
            .iter()
            .map(|seg| seg.points.len())
            .sum();

        let mut smlr_trk_segs: Vec<SmlrTrackSegment> = Vec::new();

        for seg in &track.segments {
            let smlr_seg: SmlrTrackSegment;

            let mut smlr_trk_pts: Vec<SmlrTrackPoint> = Vec::new();
            for track_point in &seg.trkpt {
                let rounded_lat = (track_point.lat * 100.0).round() / 100.0;
                let rounded_lon = (track_point.lon * 100.0).round() / 100.0;
                let rounded_ele = match track_point.ele {
                    Some(ele) => (ele * 100.0).round() / 100.0,
                    None => 0.0,
                };

                let smlr_trk_pt = SmlrTrackPoint {
                    lat: rounded_lat,
                    lon: rounded_lon,
                    ele: Some(rounded_ele),
                };
                smlr_trk_pts.push(smlr_trk_pt);
            }

            smlr_seg = SmlrTrackSegment {
                trkpt: smlr_trk_pts,
            };

            smlr_trk_segs.push(smlr_seg);
        }

        let track_name = match &track.name {
            Some(n) => n.to_string(),
            None => String::new(),
        };

        let smlr_track = SmlrTrack {
            trkseg: smlr_trk_segs,
        };

        smlr_trk.push(smlr_track);
    }

    smlr_gpx = SmlrGpx {
        trk: smlr_trk,
    };
}
