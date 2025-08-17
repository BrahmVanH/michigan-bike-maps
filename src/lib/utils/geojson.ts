import GpxParser from 'gpxparser';
import type { Feature, FeatureCollection, GeoJsonObject, Geometry, Position } from 'geojson';
import * as togeojson from '@mapbox/togeojson';
import { MapThemeOptions, colorStopVariants } from '@/config/map';
import { featureGroup, latLngBounds, Layer, polyline as polylineL, Polyline, type LatLng, type LatLngTuple } from 'leaflet';

export type { FeatureCollection } from 'geojson';

export const gpxToString = (gpxData: any) => {
	const gpx = new GpxParser();
	gpx.parse(gpxData);
	const gpxString = gpx.xmlSource;
	return gpxString;
}

export const getRouteCenter = (gpxRouteData: string) => {
	const gpx = new GpxParser();
	gpx.parse(gpxRouteData);
	const positions = getGpxPositions(gpx);
	return getCenterOfGpxRoute(positions);
};

const getColorStopVariant = (mapTheme: MapThemeOptions) => {
	switch (mapTheme) {
		case MapThemeOptions.default:
			return colorStopVariants.default;
		case MapThemeOptions.aquarelleDark:
			return colorStopVariants.aquarelleDark;
		case MapThemeOptions.streetsNight:
			return colorStopVariants.streetsNight;
		case MapThemeOptions.voyagerDark:
			return colorStopVariants.iridescent;
		case MapThemeOptions.winterDark:
			return colorStopVariants.winterDark;
	}
}

export const getGeoJsonRouteCenter = (routeCoordinates: number[][]) => {
	// const positions = geoJsonRouteData.features[0].geometry.coordinates;
	const latitudes = routeCoordinates.map((position: Position) => position[1]);
	const longitudes = routeCoordinates.map((position: Position) => position[0]);

	const minLat = Math.min(...latitudes);
	const maxLat = Math.max(...latitudes);
	const minLon = Math.min(...longitudes);
	const maxLon = Math.max(...longitudes);

	const center = { lat: (maxLat + minLat) / 2, lng: (maxLon + minLon) / 2 };
	return center;
};

const getCenterOfGpxRoute = (gpxPositions: number[][]) => {
	const latitudes = gpxPositions.map((position) => position[0]);
	const longitudes = gpxPositions.map((position) => position[1]);

	const minLat = Math.min(...latitudes);
	const maxLat = Math.max(...latitudes);
	const minLon = Math.min(...longitudes);
	const maxLon = Math.max(...longitudes);

	const center = { lat: (maxLat + minLat) / 2, lng: (maxLon + minLon) / 2 };
	return center;
};

const getGpxPositions = (gpxData: GpxParser) => {
	const points = gpxData.tracks[0].points;
	const positions = points.map((point) => [point.lat, point.lon]);
	return positions;
};

export const convertGpxStringToGeoJson = (gpxString: string) => {
	const parser = new DOMParser();
	const gpxDoc = parser.parseFromString(gpxString, 'text/xml');
	const geoJson = togeojson.gpx(gpxDoc);
	// saveGeoJsonFile(geoJson, "bareback-to-slackey.geojson");
	return geoJson;
};

export const getColorFromElevation = (x: number, mapTheme: MapThemeOptions) => {
	try {

		const colorStops = getColorStopVariant(mapTheme);

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

		const rangeFactor = (x - lowStop.elevation) / (highStop.elevation - lowStop.elevation);

		const lowRGB = lowStop.color.match(/\d+/g)!.map(Number);
		const highRGB = highStop.color.match(/\d+/g)!.map(Number);

		const adjustedFactor = Math.pow(rangeFactor, 0.7);
		// console.log('Adjusted factor:', adjustedFactor); // Debugging statement

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
					Math.max(0, Math.min(255, channel + distanceFromMax * (saturationBoost - 1)))
				);
			});
			// console.log('Saturation adjusted color:', saturationAdjusted); // Debugging statement
			return `rgb(${saturationAdjusted[0]}, ${saturationAdjusted[1]}, ${saturationAdjusted[2]})`;
		}
		// console.log('Color:', `rgb(${r}, ${g}, ${b})`); // Debugging statement
		return `rgb(${r}, ${g}, ${b})`;
	} catch (error) {
		// console.error('Error in getColorFromElevation:', error); // Error handling
		return 'rgb(0, 0, 0)'; // Return a default color in case of error
	}
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



export function lineStringToFeatureCollection(geoJsonObject: {
	geometry: {
		type: 'LineString',
		coordinates: number[][];
	};
	[key: string]: any;
}): FeatureCollection {
	const { geometry, ...properties } = geoJsonObject;
	const feature: Feature = {
		type: 'Feature',
		geometry: {
			type: 'LineString',
			coordinates: geometry.coordinates,
		} as Geometry,
		properties,
	};
	return {
		type: 'FeatureCollection',
		features: [feature],
	};
}

function getPreloadBounds(initialMapCenter: LatLng, routeCoordinates: LatLng[]) {
	const allLatLngs = [initialMapCenter, ...routeCoordinates];

	let minLat = allLatLngs[0].lat;
	let maxLat = allLatLngs[0].lat;
	let minLng = allLatLngs[0].lng;
	let maxLng = allLatLngs[0].lng;

	allLatLngs.forEach(({ lat, lng }) => {
		if (lat < minLat) minLat = lat;
		if (lat > maxLat) maxLat = lat;
		if (lng < minLng) minLng = lng;
		if (lng > maxLng) maxLng = lng;
	});

	return latLngBounds([minLat, minLng], [maxLat, maxLng]);
}

export function createGpxRouteGroup(
	geoJsonData: GeoJsonObject,
	fadeIn: boolean,
	selectedTheme: MapThemeOptions
) {
	const routeGroup = featureGroup();

	const features: Feature<any>[] = (geoJsonData as any).features ?? [geoJsonData as Feature<any>];

	features.forEach((feature) => {
		if (feature.geometry.type === 'LineString') {
			const coordinates = feature.geometry.coordinates as [number, number, number][];
			const latlngs = coordinates.map((coord) => [coord[1], coord[0], coord[2]] as LatLngTuple);

			const maxElevation = Math.max(
				...latlngs.map((coord) => coord[2]).filter((elevation) => elevation !== undefined)
			);

			let polylines: Polyline[] = [];
			latlngs.forEach((coord, index) => {
				if (coord.length < 3 || !coord[2]) return;
				if (index === 0) return;
				const prevCoord = latlngs[index - 1];
				if (prevCoord.length < 3 || !prevCoord[2]) return;

				const elevation = (coord[2] + prevCoord[2]) / 2;
				const normalizedElevation = elevation / maxElevation;
				const color = getColorFromElevation(normalizedElevation, selectedTheme);
				const opacity = fadeIn ? 0 : 1;

				const polyline = polylineL([prevCoord, coord], {
					color: color,
					weight: 5,
					opacity,
					className: 'elevation-line'
				});
				routeGroup.addLayer(polyline as unknown as Layer);

				polylines.push(polyline);
			});
			if (fadeIn) {
				let opacity = 0;
				const fadeInterval = setInterval(() => {
					opacity += 0.05;
					if (opacity >= 1) {
						opacity = 1;
						clearInterval(fadeInterval);
					}
					polylines.forEach((polyline) => polyline.setStyle({ opacity }));
				}, 900);
				// let start: number | null = null;
				// const duration = 5000; // 2 seconds

				// function animateFade(timestamp: number) {
				// 	if (!start) start = timestamp;
				// 	const elapsed = timestamp - start;
				// 	let opacity = Math.min(elapsed / duration, 1);

				// 	polylines.forEach((polyline) => polyline.setStyle({ opacity }));

				// 	if (opacity < 1) {
				// 		requestAnimationFrame(animateFade);
				// 	}
				// }
				// requestAnimationFrame(animateFade);
			}
		}
	});

	return routeGroup;
}