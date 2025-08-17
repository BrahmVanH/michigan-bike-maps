import { PUBLIC_MAP_TILER_API_KEY } from "$env/static/public";
import type { MapStyleVariant } from "@maptiler/client";
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";

export function createNewMapTilerLayer(style: MapStyleVariant) {
  return new MaptilerLayer({
    apiKey: PUBLIC_MAP_TILER_API_KEY,
    style
  });
}