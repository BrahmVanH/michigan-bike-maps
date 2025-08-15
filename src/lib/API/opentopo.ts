export async function fetchOpenTopoGeoTiff(params: {
  datasetName: string;
  south: number;
  north: number;
  west: number;
  east: number;
  outputFormat: string;
}) {
  const query = new URLSearchParams({
    datasetName: params.datasetName,
    south: params.south.toString(),
    north: params.north.toString(),
    west: params.west.toString(),
    east: params.east.toString(),
    outputFormat: params.outputFormat,
  });

  // const response = await fetch(`/api/opentopo?${query.toString()}`);
  const response = await fetch('src/lib/test-data/demo-tif.tif');

  if (!response.ok) {
    throw new Error('Failed to fetch OpenTopography data');
  }

  // For binary data (GeoTIFF)
  const arrayBuffer = await response.arrayBuffer();
  // You can now process this buffer, e.g., pass to WASM or create a Blob
  return arrayBuffer;
}