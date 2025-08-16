import type { RequestHandler } from '@sveltejs/kit';
import { MAP_TILER_API_KEY } from '$env/static/private'; // Use your private env var
import { json } from '@sveltejs/kit';
import { MaptilerLayer, MapStyle } from '@maptiler/leaflet-maptilersdk';
import type { MapStyleVariant } from '@maptiler/client';



export const GET: RequestHandler = async ({ url }) => {
  const style = url.searchParams.get('style') ?? 'default';
  const mapStyleOptions = {
    default: null,
    aquarelleDark: MapStyle.AQUARELLE.DARK,
    voyagerDark: MapStyle.VOYAGER.DARK,
    winterDark: MapStyle.WINTER.DARK,
    streetsNight: MapStyle.STREETS.NIGHT
  };

  const layer = new MaptilerLayer({
    apiKey: MAP_TILER_API_KEY,
    style: mapStyleOptions[
      style as keyof typeof mapStyleOptions
    ] as MapStyleVariant
  });

  return json(layer);
}