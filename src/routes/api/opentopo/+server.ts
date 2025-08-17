// import type { RequestHandler } from '@sveltejs/kit';
// import { OPEN_TOPO_API_KEY } from '$env/static/private'; // Use your private env var
// import { json } from '@sveltejs/kit';

// export const GET: RequestHandler = async ({ url }) => {
//   // Extract query parameters from the incoming request
//   const datasetName = url.searchParams.get('datasetName') ?? 'USGS30m';
//   const south = url.searchParams.get('south');
//   const north = url.searchParams.get('north');
//   const west = url.searchParams.get('west');
//   const east = url.searchParams.get('east');
//   const outputFormat = url.searchParams.get('outputFormat') ?? 'GTiff';

//   if (!south || !north || !west || !east) {
//     return json({ error: 'Missing bounding box parameters.' }, { status: 400 });
//   }

//   const apiUrl = `https://portal.opentopography.org/API/usgsdem?datasetName=${encodeURIComponent(datasetName)}&south=${south}&north=${north}&west=${west}&east=${east}&outputFormat=${encodeURIComponent(outputFormat)}&API_Key=${encodeURIComponent(OPEN_TOPO_API_KEY)}`;

//   const response = await fetch(apiUrl);

//   if (!response.ok) {
//     return json({ error: 'Failed to fetch from OpenTopography.' }, { status: response.status });
//   }

//   // If you expect binary data (e.g., GeoTIFF), you may want to return a stream or buffer
//   const data = await response.arrayBuffer();
//   return new Response(data, {
//     status: 200,
//     headers: {
//       'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream'
//     }
//   });
// };

