<script module lang="ts">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import {
		canvas as createCanvas,
		map as mapConstructor,
		tileLayer as tileLayerL,
		type Map,
		type Layer as LayerL,
		LatLng,
		FeatureGroup
	} from 'leaflet';

	import { MapStyleVariant } from '@maptiler/client';

	import { createGpxRouteGroup } from '$lib/utils/geojson';

	import type { GeoJsonObject } from 'geojson';

	// import devGpxString from '$lib/test-data/Afternoon_Ride.gpx?raw';
	import { initialMapCenter, mapThemeOptions, MapThemeOptions } from '@/config/map';
	import ThemeSelector from './ThemeSelector.svelte';
	import { getGpxRouteAndCenterFromString } from '@/utils/gpx';
	import { createNewMapTilerLayer } from '@/utils/maptiler';

	let { gpxString }: { gpxString: string } = $props();
	// let { gpxString = devGpxString }: { gpxString?: string } = $props();

	// import geoJsonFile from '../data/geo/bareback-to-slackey.geojson?raw';

	let map: Map;
	let mapElement: HTMLElement;
	let selectedTheme = $state(MapThemeOptions.default);
	let currentMaptilerLayer = $state<LayerL | null>(null);
	let currentGpxRouteLayer = $state<FeatureGroup<any> | null>(null);
	// let leaflet = $state<any>(null);

	onMount(async () => {
		if (mapElement) {
			initMap();
			mapElement.offsetHeight;
			const mapControlZoomEl = document.querySelector('.leaflet-control-zoom');
			const mapControlAttrEl = document.querySelector('.leaflet-control-attribution');

			setTimeout(() => mapControlAttrEl?.classList.add('active'), 9000);
			setTimeout(() => mapControlZoomEl?.classList.add('active'), 6000);

			setTimeout(() => mapElement.classList.add('active'), 200);
			setTimeout(() => {
				addRouteToMap(gpxString, true);
			}, 3000);
			mapElement.classList.add('active');
		}
	});

	function setSelectedTheme(themeName: MapThemeOptions) {
		selectedTheme = themeName;
	}

	async function addBaseMap() {
		try {
			setMapTheme(selectedTheme);
			setGpxRouteStyle();
		} catch (err) {
			// console.error(err);
		}
	}

	async function addRouteToMap(gpxString: string, fadeIn: boolean) {
		const { routeFeature, routeCenter } = await getGpxRouteAndCenterFromString(gpxString);

		addGpxRoute(routeFeature, fadeIn);
		updateMapCenter(routeCenter as LatLng);
	}

	function updateMapCenter(center: LatLng) {
		map.flyTo(center, 13);
	}

	async function setMapTheme(theme: MapThemeOptions) {
		if (currentMaptilerLayer) {
			map.removeLayer(currentMaptilerLayer);
			currentMaptilerLayer = null;
		}
		if (theme === 'default') {
			setMapToDefault(map);
			return;
		}
		const maptilerStyle = mapThemeOptions[theme as keyof typeof mapThemeOptions] as MapStyleVariant;

		const layer = createNewMapTilerLayer(maptilerStyle);

		layer.addTo(map);
		currentMaptilerLayer = layer;
	}

	function setMapToDefault(map: Map) {
		const defaultTileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';

		const topoLayer = tileLayerL(defaultTileUrl, {
			maxZoom: 20,

			attribution:
				'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
			className: 'leaflet-tile-container'
		});

		topoLayer.addTo(map);
		currentMaptilerLayer = topoLayer;
	}

	function addGpxRoute(geoJsonData: GeoJsonObject, fadeIn: boolean) {
		const routeGroup = createGpxRouteGroup(geoJsonData, fadeIn, selectedTheme);
		routeGroup.addTo(map);
		currentGpxRouteLayer = routeGroup;
	}

	async function setGpxRouteStyle() {
		if (currentGpxRouteLayer) {
			map.removeLayer(currentGpxRouteLayer);
			currentGpxRouteLayer = null;
		}
		addRouteToMap(gpxString, false);
	}

	async function initMap() {
		try {
			map = mapConstructor(mapElement, {
				renderer: createCanvas({ padding: 0.5 })
			}).setView(initialMapCenter, 17);

			addBaseMap();
		} catch (err) {
			// console.error(err);
		}
	}

	function resizeMap() {
		if (map) map.invalidateSize();
	}
</script>

<div bind:this={mapElement} class="map"></div>

<svelte:window on:resize={resizeMap} />
<ThemeSelector {selectedTheme} {setSelectedTheme} {setMapTheme} {setGpxRouteStyle} />

<style>
	.map {
		height: 800px;
		width: 100%;
		z-index: 500;
	}

	div {
		width: 100vw;
		height: 100vh;
	}

	/* These globals ensure the black background shows up */
	:global(.leaflet-container) {
		background-color: #000000 !important;
		z-index: 500;
	}

	:global(.leaflet-control-container .leaflet-pane) {
		background-color: #000000;
		z-index: 500;
	}

	/* Makes sure the canvas background is also black */
	:global(.leaflet-canvas-layer) {
		background-color: #000000;
		z-index: 500;
	}

	:global(.leaflet-tile-container) {
		filter: grayscale(100%) invert(100%);
		/* filter:	brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); */

		/* Desaturates and inverts colors */
		/* You might need further adjustments for brightness/contrast */
		/* filter: grayscale(100%) brightness(50%) contrast(150%); */
	}

	:global(.leaflet-control-zoom) {
		opacity: 0;
		transition:
			opacity 1s ease-in-out,
			transform 5s ease-out;
		transform: translateY(-20px);
		z-index: 500;
	}

	:global(.leaflet-control-attribution) {
		opacity: 0;
		transition:
			opacity 1s ease-in-out,
			transform 5s ease-out;
		transform: translateY(-20px);
		background-color: transparent !important;
		color: white !important;
	}

	:global(.leaflet-control-zoom.active) {
		opacity: 1 !important;
	}
	:global(.leaflet-control-attribution.active) {
		opacity: 1 !important;
	}

	:global(.elevation-line) {
		transition: opacity 2s ease-in-out;
	}
</style>
