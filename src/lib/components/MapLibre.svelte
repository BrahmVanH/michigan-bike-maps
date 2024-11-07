<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as MapLibre from 'maplibre-gl';
	import { onMount, onDestroy } from 'svelte';

	import geoJsonFile from '../data/geo/bareback-to-slackey.geojson?raw';
	import { getColor, getGeoJsonRouteCenter } from '$lib/helpers/leaflet';

	let mapContainer: HTMLElement;
	let map: MapLibre.Map;

	const routeGeoJson = JSON.parse(geoJsonFile);
	const routeCoordinates = routeGeoJson.geometry.coordinates;
	const routeElevations = routeCoordinates.map((coord: any) => coord[2]);
	const mapCenter = getGeoJsonRouteCenter(routeGeoJson);

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

<div id="map" style="height: 100vh;"></div>
