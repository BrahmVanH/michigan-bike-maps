import { browser } from '$app/environment';
import type { RouteMapProps } from '$lib/types';

export const convertGpxStringToGeoJson = async (
	gpxString: string
): Promise<RouteMapProps['geojsonRoute']> => {
	if (!browser) {
		return {
			type: 'FeatureCollection',
			features: []
		};
	}
	const [{ default: toGeoJSON }] = await Promise.all([import('@mapbox/togeojson')]);

	const parser = new DOMParser();
	const gpxDoc = parser.parseFromString(gpxString, 'text/xml');

	return toGeoJSON.gpx(gpxDoc);
};

export const darkMapStyle = {
	version: 8,
	name: 'Dark Contour',
	sprite: '',
	glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
	sources: {
		'terrain-source': {
			type: 'raster-dem',
			tiles: ['https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key=get_your_own_key'],
			tileSize: 256,
			maxzoom: 14
		},
		composite: {
			type: 'vector',
			tiles: ['https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf'],
			maxzoom: 14
		}
	},
	layers: [
		{
			id: 'background',
			type: 'background',
			paint: {
				'background-color': '#000000'
			}
		},
		{
			id: 'contours',
			type: 'line',
			source: 'composite',
			'source-layer': 'contour',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': '#333333',
				'line-width': 1,
				'line-opacity': 0.5
			}
		}
	]
};
