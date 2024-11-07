import GpxParser from "gpxparser";
// import toGeoJSON from "@mapbox/togeojson";
import type { GeoJsonObject } from "geojson";

export const getRouteCenter = (gpxRouteData: string) => {
  const gpx = new GpxParser();
  gpx.parse(gpxRouteData);
  const positions = getGpxPositions(gpx);
  return getCenterOfGpxRoute(positions);
};

export const getGeoJsonRouteCenter = (geoJsonRouteData: GeoJsonObject) => {
  const positions = (geoJsonRouteData as any).features[0].geometry.coordinates;
  const latitudes = positions.map((position: any) => position[1]);
  const longitudes = positions.map((position: any) => position[0]);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const center = { lat: (maxLat + minLat) / 2, lng: (maxLon + minLon) / 2 };
  return center;
}

const getCenterOfGpxRoute = (gpxPositions: number[][]) => {
  const latitudes = gpxPositions.map((position) => position[0]);
  const longitudes = gpxPositions.map((position) => position[1]);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const center = { lat: (maxLat + minLat) / 2, lng: (maxLon + minLon) / 2 };
  console.log(center);
  return center;
};

const getGpxPositions = (gpxData: GpxParser) => {
  const points = gpxData.tracks[0].points;
  const positions = points.map((point) => [point.lat, point.lon]);
  return positions;
};

// export const convertToGeoJson = (gpxString: string): GeoJsonObject => {
//   const parser = new DOMParser();
//   const gpxDoc = parser.parseFromString(gpxString, "text/xml");
//   const geoJson = toGeoJSON.gpx(gpxDoc);
//   // saveGeoJsonFile(geoJson, "bareback-to-slackey.geojson");
//   return geoJson;
// };

export const getColor = (x: number) => {
  const colorStops = [
    { elevation: 0, color: "rgb(51, 0, 102)" }, // Vivid deep indigo
    { elevation: 0.2, color: "rgb(102, 0, 153)" }, // Vivid dark magenta
    { elevation: 0.4, color: "rgb(153, 0, 153)" }, // Vivid magenta
    { elevation: 0.6, color: "rgb(255, 105, 180)" }, // Vivid hot pink
    { elevation: 0.8, color: "rgb(0, 76, 153)" }, // Vivid nebula blue
    { elevation: 1, color: "rgb(0, 76, 153)" }, // Vivid nebula blue (repeated for consistency)
  ];

  x = Math.max(0, Math.min(1, x));

  let lowIndex = 0;
  for (let i = 1; i < colorStops.length; i++) {
    if (x <= colorStops[i].elevation) {
      lowIndex = i - 1;
      break;
    }
  }

  const lowStop = colorStops[lowIndex];
  const highStop = colorStops[lowIndex + 1];

  const rangeFactor =
    (x - lowStop.elevation) / (highStop.elevation - lowStop.elevation);

  const lowRGB = lowStop.color.match(/\d+/g)!.map(Number);
  const highRGB = highStop.color.match(/\d+/g)!.map(Number);

  const adjustedFactor = Math.pow(rangeFactor, 0.7);

  const r = Math.round(lowRGB[0] + (highRGB[0] - lowRGB[0]) * adjustedFactor);
  const g = Math.round(lowRGB[1] + (highRGB[1] - lowRGB[1]) * adjustedFactor);
  const b = Math.round(lowRGB[2] + (highRGB[2] - lowRGB[2]) * adjustedFactor);

  const saturationBoost = 0.8; // Adjust this value to increase/decrease vibrancy
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const delta = maxChannel - minChannel;

  if (delta !== 0) {
    const saturationAdjusted = [r, g, b].map((channel) => {
      const distanceFromMax = maxChannel - channel;
      return Math.round(
        Math.max(
          0,
          Math.min(255, channel + distanceFromMax * (saturationBoost - 1)),
        ),
      );
    });
    return `rgb(${saturationAdjusted[0]}, ${saturationAdjusted[1]}, ${saturationAdjusted[2]})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
};

// if (x > 0.933) {
//   return "rgb(0, 76, 153)"; // Vivid nebula blue
// } else if (x > 0.866) {
//   return "rgb(255, 105, 180)"; // Vivid hot pink
// } else if (x > 0.8) {
//   return "rgb(153, 0, 153)"; // Vivid magenta
// } else if (x > 0.733) {
//   return "rgb(102, 0, 153)"; // Vivid dark magenta
// } else if (x > 0.666) {
//   return "rgb(51, 0, 102)"; // Vivid deep indigo
// } else if (x > 0.6) {
//   return "rgb(0, 76, 153)"; // Vivid nebula blue
// } else if (x > 0.533) {
//   return "rgb(255, 105, 180)"; // Vivid hot pink
// } else if (x > 0.466) {
//   return "rgb(153, 0, 153)"; // Vivid magenta
// } else if (x > 0.4) {
//   return "rgb(102, 0, 153)"; // Vivid dark magenta
// } else if (x > 0.333) {
//   return "rgb(51, 0, 102)"; // Vivid deep indigo
// } else if (x > 0.266) {
//   return "rgb(0, 76, 153)"; // Vivid nebula blue
// } else if (x > 0.2) {
//   return "rgb(255, 105, 180)"; // Vivid hot pink
// } else if (x > 0.133) {
//   return "rgb(153, 0, 153)"; // Vivid magenta
// } else if (x > 0.066) {
//   return "rgb(102, 0, 153)"; // Vivid dark magenta
// } else {
//   return "rgb(51, 0, 102)"; // Vivid deep indigo
// }
