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

export type ColorStops = ColorStop[];

type ColorStop = {
  elevation: number;
  color: string;
}


export const colorStopVariants = {
  themeSelectorActive: [
    { elevation: 0, color: 'rgb(90, 30, 10)' },      // Deep brown, darker than active
    { elevation: 0.2, color: 'rgb(120, 40, 14)' },  // Muted burnt brown
    { elevation: 0.4, color: 'rgb(154, 52, 18)' },  // ThemeSelector active button background
    { elevation: 0.6, color: 'rgb(200, 120, 60)' }, // Light tan brown, lighter than active
    { elevation: 0.8, color: 'rgb(220, 170, 110)' },// Pale tan brown
    { elevation: 1, color: 'rgb(240, 210, 160)' }   // Very pale tan brown
  ],
  // themeSelectorActive: [
  //   { elevation: 0, color: 'rgb(60, 28, 10)' },      // Deep burnt brown
  //   { elevation: 0.2, color: 'rgb(120, 48, 24)' },   // Muted burnt orange
  //   { elevation: 0.4, color: 'rgb(154, 52, 18)' },   // ThemeSelector active button background (middle)
  //   { elevation: 0.6, color: 'rgb(180, 110, 60)' },  // Tan brown
  //   { elevation: 0.8, color: 'rgb(210, 160, 110)' }, // Light tan brown
  //   { elevation: 1, color: 'rgb(230, 200, 160)' }    // Pale tan brown
  // ],
  iridescent: [
    { elevation: 0, color: 'rgb(51, 0, 102)' }, // Vivid deep indigo
    { elevation: 0.2, color: 'rgb(102, 0, 153)' }, // Vivid dark magenta
    { elevation: 0.4, color: 'rgb(153, 0, 153)' }, // Vivid magenta
    { elevation: 0.6, color: 'rgb(255, 105, 180)' }, // Vivid hot pink
    { elevation: 0.8, color: 'rgb(0, 76, 153)' }, // Vivid nebula blue
    { elevation: 1, color: 'rgb(0, 76, 153)' } // Vivid nebula blue (repeated for consistency)
  ],

  'aquarelleDark': [
    { elevation: 0, color: 'rgb(32, 44, 54)' },   // Deep blue-gray (low elevation, water)
    { elevation: 0.2, color: 'rgb(44, 62, 80)' },   // Muted dark blue
    { elevation: 0.4, color: 'rgb(38, 70, 83)' },   // Teal/blue-green
    // { elevation: 0.6, color: 'rgb(67, 90, 61)' },   // Olive green
    { elevation: 0.6, color: 'rgb(62, 130, 56)' },   // Moderately vivid olive green
    { elevation: 0.8, color: 'rgb(120, 99, 105)' }, // Muted purple-brown
    { elevation: 1, color: 'rgb(168, 140, 110)' } // Earthy brown (high elevation)
    // { elevation: 0, color: 'rgb(30, 42, 54)' },    // Moderately vivid blue-gray
    // { elevation: 0.2, color: 'rgb(42, 60, 105)' },   // Moderately vivid blue
    // { elevation: 0.4, color: 'rgb(36, 110, 125)' },  // Moderately vivid teal
    // { elevation: 0.6, color: 'rgb(62, 130, 56)' },   // Moderately vivid olive green
    // { elevation: 0.8, color: 'rgb(110, 90, 160)' },  // Moderately vivid purple
    // { elevation: 1, color: 'rgb(0, 76, 153)' } // Vivid nebula blue (repeated for consistency)

  ],


  'winterDark': [
    { elevation: 0, color: 'rgb(20, 28, 38)' },      // Very deep blue-gray
    { elevation: 0.2, color: 'rgb(30, 80, 160)' },   // Vivid icy blue
    { elevation: 0.4, color: 'rgb(100, 180, 255)' }, // Bright cold blue
    { elevation: 0.6, color: 'rgb(180, 180, 220)' }, // Light lavender
    { elevation: 0.8, color: 'rgb(180, 120, 220)' }, // More purple at high elevation
    { elevation: 1, color: 'rgb(220, 120, 255)' }    // Strong purple-white (highest elevation)
  ],

  'streetsNight': [
    { elevation: 0, color: 'rgb(24, 24, 32)' },    // Flat midnight blue
    { elevation: 0.2, color: 'rgb(38, 44, 60)' },  // Flat dark blue
    { elevation: 0.4, color: 'rgb(70, 80, 100)' }, // Flat blue-gray
    { elevation: 0.6, color: 'rgb(110, 110, 130)' }, // Flat muted blue
    { elevation: 0.8, color: 'rgb(140, 120, 160)' }, // Flat muted purple
    { elevation: 1, color: 'rgb(180, 170, 120)' }   // Flat muted yellow-brown
  ],

  'greyscale': [
    { elevation: 0, color: 'rgb(60, 30, 10)' },     // Extremely deep copper brown
    { elevation: 0.2, color: 'rgb(90, 45, 15)' },   // Deeper copper brown
    { elevation: 0.4, color: 'rgb(120, 60, 20)' },  // Rich copper brown
    { elevation: 0.6, color: 'rgb(150, 80, 30)' },  // Muted copper
    { elevation: 0.8, color: 'rgb(180, 110, 60)' }, // Light copper brown
    { elevation: 1, color: 'rgb(200, 160, 110)' }   // Very light copper brown
  ],

  deep: [
    { elevation: 0, color: 'rgb(80, 24, 6)' },     // Very dark burnt orange
    { elevation: 0.2, color: 'rgb(120, 36, 10)' }, // Dark orange
    { elevation: 0.4, color: 'rgb(154, 52, 18)' }, // App deep orange
    { elevation: 0.6, color: 'rgb(180, 70, 20)' }, // Deep orange
    { elevation: 0.8, color: 'rgb(220, 100, 30)' },// Rich orange
    { elevation: 1, color: 'rgb(251, 146, 60)' }   // Bright orange
  ],
  'good-orange': [
    { elevation: 0, color: 'rgb(80, 24, 6)' },     // Very dark burnt orange

    //  { elevation: 0, color: 'rgb(60, 28, 10)' },     // Deep burnt brown
    { elevation: 0.2, color: 'rgb(100, 48, 18)' }, // Burnt orange-brown
    { elevation: 0.4, color: 'rgb(140, 72, 30)' }, // Burnt tan brown
    // { elevation: 0.6, color: 'rgb(180, 110, 60)' },// Tan brown
    { elevation: 0.6, color: 'rgb(150, 80, 30)' },  // Muted copper

    { elevation: 0.8, color: 'rgb(210, 160, 110)' },// Light tan brown
    { elevation: 1, color: 'rgb(230, 200, 160)' }  // Pale tan brown
  ],
  burntTanBrown: [
    { elevation: 0, color: 'rgb(60, 28, 10)' },     // Deep burnt brown
    { elevation: 0.2, color: 'rgb(100, 48, 18)' }, // Burnt orange-brown
    { elevation: 0.4, color: 'rgb(140, 72, 30)' }, // Burnt tan brown
    { elevation: 0.6, color: 'rgb(180, 110, 60)' },// Tan brown
    { elevation: 0.8, color: 'rgb(210, 160, 110)' },// Light tan brown
    { elevation: 1, color: 'rgb(230, 200, 160)' }  // Pale tan brown
  ],
  default: [
    { elevation: 0, color: 'rgb(160, 60, 18)' },     // Deeper orange for lowest elevation
    { elevation: 0.2, color: 'rgb(110, 60, 20)' },   // Deep muted brown-orange
    { elevation: 0.4, color: 'rgb(154, 52, 18)' },  // Rich deep orange
    { elevation: 0.6, color: 'rgba(154, 52, 18, 0.6)' }, // Original 0
    { elevation: 0.8, color: 'rgb(180, 120, 60)' },  // Lighter brown for high elevation
    { elevation: 1, color: 'rgb(210, 170, 110)' }    // Even lighter tan brown for highest elevation
  ],
}

