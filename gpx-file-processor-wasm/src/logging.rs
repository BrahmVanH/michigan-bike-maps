use tracing::Level;
use tracing_wasm::{ConsoleConfig, WASMLayerConfigBuilder};
use wasm_bindgen::prelude::*;


#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
   let config = WASMLayerConfigBuilder::new()
        .set_max_level(Level::INFO)
        .set_console_config(ConsoleConfig::ReportWithConsoleColor)
        .set_report_logs_in_timings(true)
        .build();
    tracing_wasm::set_as_global_default_with_config(config);

    Ok(())
}