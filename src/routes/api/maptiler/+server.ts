// import type { RequestHandler } from '@sveltejs/kit';
// // import { MAP_TILER_API_KEY, OPEN_TOPO_API_KEY } from '$env/static/private'; // Use your private env var
// import { json } from '@sveltejs/kit';

// import * as mapTilerClient from '@maptiler/client';
// import { initialMapCenter } from '@/config/map';

// export const GET: RequestHandler = async ({ url }) => {
//   mapTilerClient.config.fetch = fetch;
//   // mapTilerClient.config.apiKey = MAP_TILER_API_KEY;

//   const mapTile = mapTilerClient.staticMaps.centered(
//     [initialMapCenter.lng, initialMapCenter.lng],
//     16,
//     {
//       style: 'basic-vs-light',

//     }
//   )

//   return new Response(mapTile, {
//     status: 200,
//     headers: {
//       'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream'
//     }
//   });
// }