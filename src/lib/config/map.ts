import { MapStyle } from "@maptiler/client";
import { LatLng } from "leaflet";

export const initialMapCenter = new LatLng(46.623198, -87.4908000);

export enum MapThemeOptions {
  default = "default",
  aquarelleDark = "aquarelleDark",
  voyagerDark = "voyagerDark",
  winterDark = "winterDark",
  streetsNight = "streetsNight"
}

export const mapThemeOptions = {
  default: null,
  aquarelleDark: MapStyle.AQUARELLE.DARK,
  voyagerDark: MapStyle.VOYAGER.DARK,
  winterDark: MapStyle.WINTER.DARK,
  streetsNight: MapStyle.STREETS.NIGHT
};

export function buildOpenTopoApiUrl({
  datasetName,
  south,
  north,
  west,
  east,
  outputFormat,
  apiKey
}: {
  datasetName: string;
  south: number;
  north: number;
  west: number;
  east: number;
  outputFormat: string;
  apiKey: string;
}): string {
  return `https://portal.opentopography.org/API/usgsdem?datasetName=${encodeURIComponent(datasetName)}&south=${south}&north=${north}&west=${west}&east=${east}&outputFormat=${encodeURIComponent(outputFormat)}&API_Key=${encodeURIComponent(apiKey)}`;
}

export function getBoundingBoxParams(pointA: LatLng, pointB: LatLng) {
  const south = Math.min(pointA.lat, pointB.lat);
  const north = Math.max(pointA.lat, pointB.lat);
  const west = Math.min(pointA.lng, pointB.lng);
  const east = Math.max(pointA.lng, pointB.lng);

  return { south, north, west, east };
}