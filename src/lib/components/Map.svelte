<script lang="ts">
	import { onMount } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import type { Map } from 'maplibre-gl';
	import type { Feature, LineString, Position } from 'geojson';
	import { getColorFromElevation, getGeoJsonRouteCenter } from '../helpers/leaflet';

	import gpxString from '../data/geo/bareback-to-rickles.gpx?raw';
	import contoursGeoJson from '../data/geo/harlow-contours-simplified.json?raw';

	import type { FeatureCollection, Geometry, RouteMapProps } from '$lib/types';
	import { browser } from '$app/environment';
	import { convertGpxStringToGeoJson } from '$lib/helpers/map';
	import { darkMapStyle } from '$lib/helpers/map';

	let geoJsonRoute: RouteMapProps['geojsonRoute'] | null;

	// export let geojsonRoute: RouteMapProps['geojsonRoute'];
	export let mapStyle: any = darkMapStyle;
	export let initialView: RouteMapProps['initialView'] = {
		center: [-122.486052, 37.830348],
		zoom: 14
	};

	let mapContainer: HTMLDivElement;
	let map: Map;

	function createRouteLayer(geoJsonRoute: RouteMapProps['geojsonRoute']) {
		if (!map) {
			console.log('Map not initialized yet, skipping route layer creation');
			return;
		}

		console.log('Creating route layer with:', geoJsonRoute);

		// Convert the single LineString into segments with individual colors
		const coordinates = geoJsonRoute?.geometry.coordinates;
		const bounds = coordinates.reduce(
			(bounds: maplibregl.LngLatBounds, coord: Position) => {
				return bounds.extend([coord[0], coord[1]]);
			},
			new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
		);

		const segments: Feature<LineString>[] = [];

		// Find the min and max elevation values
		const elevations = coordinates.map((coord: Position) => coord[2] || 0);
		const minElevation = Math.min(...elevations);
		const maxElevation = Math.max(...elevations);

		for (let i = 0; i < coordinates.length - 1; i++) {
			const start = coordinates[i];
			const end = coordinates[i + 1];
			const elevation = start[2] || 0;

			// Normalize the elevation value
			const normalizedElevation = (elevation - minElevation) / (maxElevation - minElevation);
			console.log('Normalized elevation:', normalizedElevation); // Debugging statement

			const color = getColorFromElevation(normalizedElevation);
			console.log('Segment color:', color); // Debugging statement

			segments.push({
				type: 'Feature',
				properties: {
					color: color
				},
				geometry: {
					type: 'LineString',
					coordinates: [start, end]
				}
			});
		}

		console.log('Created segments:', segments);

		// Add the source
		map.addSource('route', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: segments
			}
		});

		// Add the layer
		map.addLayer({
			id: 'route',
			type: 'line',
			source: 'route',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': ['get', 'color'],
				'line-width': 6
			}
		});

		map.fitBounds(bounds, {
			padding: 50,
			duration: 4000
		});
	}

	function addContoursLayer() {
		if (!map) {
			console.log('Map not initialized yet, skipping contours layer creation');
			return;
		}

		console.log('Adding contours layer with:', contoursGeoJson);

		// Add the GeoJSON contours data as a source
		map.addSource('contours', {
			type: 'geojson',
			data: contoursGeoJson
		});

		// Add the contours layer
		map.addLayer({
			id: 'contours',
			type: 'line',
			source: 'contours',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': '#888',
				'line-width': 2
			}
		});
	}

	onMount(() => {
		console.log('onMount called'); // Debugging statement
		const initializeMap = async () => {
			console.log('Initializing map'); // Debugging statement
			const featureCollection = await convertGpxStringToGeoJson(gpxString);
			console.log('Raw GPX conversion result:', featureCollection);

			const routeFeature = featureCollection.features.find(
				(feature: Feature<Geometry>) => feature.geometry.type === 'LineString'
			) as Feature<LineString>;

			if (!routeFeature) {
				throw new Error('No valid route found in GPX file');
			}

			const routeCoordinates = routeFeature.geometry.coordinates;

			if (!routeCoordinates) {
				throw new Error('No route coordinates found in GeoJSON file');
			}

			console.log('routeCoordinates', routeCoordinates);
			const routeElevations = routeCoordinates.map((coord: any) => coord[2]);

			if (!routeElevations) {
				throw new Error('No route elevations found in GeoJSON file');
			}
			console.log('routeElevations', routeElevations);
			const mapCenter = getGeoJsonRouteCenter(routeCoordinates);

			if (!mapCenter) {
				throw new Error('No map center found in GeoJSON file');
			}

			console.log('Found route feature:', routeFeature);
			geoJsonRoute = routeFeature;

			if (mapContainer) {
				map = new maplibregl.Map({
					container: mapContainer,
					style: mapStyle,
					center: mapCenter,
					zoom: 14
				});

				map.on('load', () => {
					console.log('Map loaded, creating route layer');
					addContoursLayer(); // Add the contours layer
					createRouteLayer(routeFeature);
				});

				// Add this to check if the map style loaded correctly
				map.on('style.load', () => {
					console.log('Map style loaded');
				});

				// Add error handling
				map.on('error', (e) => {
					console.error('Map error:', e);
				});
			}
		};

		initializeMap().catch((error) => {
			console.error('Failed to initialize map:', error);
		});

		return () => {
			map?.remove();
		};
	});
</script>

<div class="map-wrapper">
	<div bind:this={mapContainer} class="map-container"></div>
</div>

<style>
	.map-wrapper {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100vh;
	}

	.map-container {
		width: 100%;
		height: 100%;
		border-radius: 4px;
		border: 1px solid #ccc;
	}
</style>
