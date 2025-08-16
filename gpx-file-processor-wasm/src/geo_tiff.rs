// use tiff::decoder::{Decoder, DecodingResult};
// use image::{codecs::jpeg::JpegEncoder, DynamicImage, ImageBuffer, Rgb};

// use tracing::{info, Level};
// use tracing_wasm::{ConsoleConfig, WASMLayerConfigBuilder};
// use wasm_bindgen::prelude::*;
// use web_sys::console;
// use std::{fs::File, io::Cursor};

// #[wasm_bindgen]
// pub fn convert_geotiff_to_jpeg_buffer(tiff: js_sys::ArrayBuffer) -> Result<js_sys::Uint8Array, JsValue> {

   

//     console::log_1(&JsValue::from_str(&format!("geotiff input: {:?}", tiff)));
//     info!("geotiff input: {:?}", tiff);

//     let bytes: Vec<u8> = js_sys::Uint8Array::new(&tiff).to_vec();
//     let mut decoder = Decoder::new(Cursor::new(bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
//     let (width, height) = decoder.dimensions().map_err(|e| JsValue::from_str(&e.to_string()))?;
//     let image_data = decoder.read_image().map_err(|e| JsValue::from_str(&e.to_string()))?;

//     let pixel_format = match &image_data {
//         DecodingResult::U8(_) => "U8",
//         DecodingResult::U16(_) => "U16",
//         DecodingResult::F32(_) => "F32",
//         _ => "Unknown",
//     };
//     console::log_1(&JsValue::from_str(&format!("GeoTIFF pixel format: {}", pixel_format)));
//     info!("GeoTIFF pixel format: {}", pixel_format);

//     match image_data {
//         DecodingResult::U8(data) => handle_u8(data, width, height),
//         DecodingResult::U16(data) => handle_u16(data, width, height),
//         DecodingResult::F32(data) => handle_f32(data, width, height),
//         _ => handle_unsupported(),
//     }


//     // let rgb_pixels= match image_data {
//     //     DecodingResult::U8(data) => {
//     //         data.chunks(3).flat_map(|chunk| [chunk[0], chunk[1], chunk[2]]).collect::<Vec<u8>>()
//     //     },
//     //      DecodingResult::U16(data) => {
//     //         data.chunks(3).flat_map(|chunk| [chunk[0], chunk[1], chunk[2]]).collect::<Vec<u16>>()
//     //     },
//     //     _ => return Err(JsValue::from_str("Unsupported GeoTIFF pixel format")),
//     // };

//     // let img: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, rgb_pixels)
//     //     .ok_or_else(|| JsValue::from_str("Failed to create image buffer"))?;

//     // let dyn_img = DynamicImage::ImageRgb8(img);
//     // info!("dynamic image before output from wasm function: {:?}", dyn_img);
//     // // console::log_1(&JsValue::from_str(&format!("dynamic image before output from wasm function: {:?}", dyn_img)));

//     // let mut buf = Vec::new();
//     // {
//     //     use image::codecs::jpeg::JpegEncoder;
//     //     let mut encoder = JpegEncoder::new_with_quality(&mut buf, 80);
//     //     encoder.encode_image(&dyn_img)
//     //         .map_err(|e| JsValue::from_str(&e.to_string()))?;
//     // }

//     // Ok(js_sys::Uint8Array::from(buf.as_slice()))
// }



// fn handle_f32(data: Vec<f32>, width: u32, height: u32) -> Result<js_sys::Uint8Array, JsValue> {
//     // Convert f32 values to u8 (assuming normalized [0.0, 1.0] or [0.0, 255.0])
//     info!("f32 channel count: {}", data.len());
//         // Log buffer and image info
//         info!("handle_f32: width={}, height={}, data.len()={}", width, height, data.len());
//         let expected_rgb = width as usize * height as usize * 3;
//         info!("handle_f32: expected RGB buffer size = {}", expected_rgb);
//         let channels = if width > 0 && height > 0 { data.len() / (width as usize * height as usize) } else { 0 };
//         info!("handle_f32: detected channel count = {}", channels);

//         // Handle grayscale (single channel) or other channel counts
//         let rgb_pixels: Vec<u8> = match channels {
//             1 => {
//                 // Grayscale: replicate value to R,G,B
//                 data.iter().flat_map(|v| {
//                     let u = f32_to_u8(Some(v));
//                     [u, u, u]
//                 }).collect()
//             },
//             3 => {
//                 // RGB
//                 data.chunks(3)
//                     .flat_map(|chunk| [
//                         f32_to_u8(chunk.get(0)),
//                         f32_to_u8(chunk.get(1)),
//                         f32_to_u8(chunk.get(2))
//                     ])
//                     .collect()
//             },
//             4 => {
//                 // RGBA: ignore alpha
//                 data.chunks(4)
//                     .flat_map(|chunk| [
//                         f32_to_u8(chunk.get(0)),
//                         f32_to_u8(chunk.get(1)),
//                         f32_to_u8(chunk.get(2))
//                     ])
//                     .collect()
//             },
//             _ => {
//                 info!("handle_f32: unsupported channel count {}", channels);
//                 return Err(JsValue::from_str("Unsupported channel count in f32 GeoTIFF"));
//             }
//         };

//         info!("handle_f32: rgb_pixels.len()={}", rgb_pixels.len());
//     let img: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, rgb_pixels)
//         .ok_or_else(|| JsValue::from_str("Failed to create image buffer from f32"))?;
//     let dyn_img = DynamicImage::ImageRgb8(img);
//     info!("dynamic image before output from wasm function: {:?}", dyn_img);
//     let mut buf = Vec::new();
//     {
//         use image::codecs::jpeg::JpegEncoder;
//         let mut encoder = JpegEncoder::new_with_quality(&mut buf, 80);
//         encoder.encode_image(&dyn_img)
//             .map_err(|e| JsValue::from_str(&e.to_string()))?;
//     }
//     Ok(js_sys::Uint8Array::from(buf.as_slice()))
// }

// fn f32_to_u8(val: Option<&f32>) -> u8 {
//     match val {
//         Some(v) => {
//             if *v <= 1.0 {
//                 (*v * 255.0).round() as u8
//             } else {
//                 v.round().clamp(0.0, 255.0) as u8
//             }
//         },
//         None => 0,
//     }
// }

// fn handle_u8(data: Vec<u8>, width: u32, height: u32) -> Result<js_sys::Uint8Array, JsValue> {
//     let rgb_pixels: Vec<u8> = data.chunks(3).flat_map(|chunk| [chunk[0], chunk[1], chunk[2]]).collect();
//     let img: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, rgb_pixels)
//         .ok_or_else(|| JsValue::from_str("Failed to create image buffer"))?;
//     let dyn_img = DynamicImage::ImageRgb8(img);
//     info!("dynamic image before output from wasm function: {:?}", dyn_img);
//     let mut buf = Vec::new();
//     {
//         use image::codecs::jpeg::JpegEncoder;
//         let mut encoder = JpegEncoder::new_with_quality(&mut buf, 80);
//         encoder.encode_image(&dyn_img)
//             .map_err(|e| JsValue::from_str(&e.to_string()))?;
//     }
//     Ok(js_sys::Uint8Array::from(buf.as_slice()))
// }

// fn handle_u16(data: Vec<u16>, width: u32, height: u32) -> Result<js_sys::Uint8Array, JsValue> {
//     // Downcast u16 to u8 for JPEG encoding (lossy)
//     let rgb_pixels: Vec<u8> = data.chunks(3)
//         .flat_map(|chunk| [
//             (chunk[0] >> 8) as u8,
//             (chunk[1] >> 8) as u8,
//             (chunk[2] >> 8) as u8
//         ])
//         .collect();
//     let img: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, rgb_pixels)
//         .ok_or_else(|| JsValue::from_str("Failed to create image buffer from u16"))?;
//     let dyn_img = DynamicImage::ImageRgb8(img);
//     info!("dynamic image before output from wasm function: {:?}", dyn_img);
//     let mut buf = Vec::new();
//     {
//         use image::codecs::jpeg::JpegEncoder;
//         let mut encoder = JpegEncoder::new_with_quality(&mut buf, 80);
//         encoder.encode_image(&dyn_img)
//             .map_err(|e| JsValue::from_str(&e.to_string()))?;
//     }
//     Ok(js_sys::Uint8Array::from(buf.as_slice()))
// }

// fn handle_unsupported() -> Result<js_sys::Uint8Array, JsValue> {
//     Err(JsValue::from_str("Unsupported GeoTIFF pixel format"))
   
// }



