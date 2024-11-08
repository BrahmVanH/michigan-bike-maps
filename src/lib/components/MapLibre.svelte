<!-- <script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as MapLibre from 'maplibre-gl';
	import { onMount, onDestroy } from 'svelte';

	import geoJsonFile from '../data/geo/bareback-to-slackey.geojson?raw';
	import { getColor, getGeoJsonRouteCenter } from '$lib/helpers/leaflet';
	import type { GeoJsonObject, LineString } from 'geojson';
	import type { Feature, FeatureCollection } from '$lib/types';

	let mapContainer: HTMLElement;
	let map: MapLibre.Map;

	const routeGeoJson: Feature = JSON.parse(geoJsonFile);

	if (!routeGeoJson) {
		throw new Error('No GeoJSON file found');
	}
	console.log('routeGeoJson', routeGeoJson);
	const routeCoordinates = routeGeoJson?.geometry?.coordinates;

	if (!routeCoordinates) {
		throw new Error('No route coordinates found in GeoJSON file');
	}

	const routeCoordinatesAsCollection = routeCoordinates as FeatureCollection<LineString>;
	console.log('routeCoordinates', routeCoordinates);
	const routeElevations = routeCoordinates.map((coord: any) => coord[2]);

	if (!routeElevations) {
		throw new Error('No route elevations found in GeoJSON file');
	}
	console.log('routeElevations', routeElevations);
	const mapCenter = getGeoJsonRouteCenter(routeGeoJson);

	if (!mapCenter) {
		throw new Error('No map center found in GeoJSON file');
	}

	

	const initializeMap = () => {
		map = new MapLibre.Map({
			container: mapContainer,
			style: 'https://demp.maplibre.org/style.json',
			center: mapCenter,
			zoom: 18
		});

		map.on('load', () => {
			map.addSource('route', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: routeCoordinates.map((coord: [number, number, number], i: number) => ({
						type: 'feature',
						geometry: {
							type: 'LineString',
							coordinates:
								i === routeCoordinates.length - 1
									? [routeCoordinates[i], routeCoordinates[i]]
									: [routeCoordinates[i], routeCoordinates[i + 1]]
						},
						properties: {
							color: getColor(routeElevations[i])
						}
					}))
				}
			});
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
					'line-width': 4
				}
			});

			const bounds = routeCoordinates.reduce(
				(bounds: MapLibre.LngLatBounds, coord: [number, number, number]) => {
					return bounds.extend([coord[0], coord[1]]);
				},
				new MapLibre.LngLatBounds(routeCoordinates[0], routeCoordinates[0])
			);

			map.fitBounds(bounds, {
				padding: 50
			});
		});
	};

	onMount(() => {
		if (!mapContainer) return;
		initializeMap();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div id="map" style="height: 100vh;"></div> -->
