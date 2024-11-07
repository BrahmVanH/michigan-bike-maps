<script lang="ts">
	import { onMount } from 'svelte';
	import L from 'leaflet';
	import type { LatLngTuple, Map } from 'leaflet';

	import { getColor, getGeoJsonRouteCenter } from '../helpers/leaflet';
	import type { GeoJsonObject } from 'geojson';

	// import gpxString from '../lib/data/geo/bareback-to-rickles.gpx?raw';
	import geoJsonFile from '../data/geo/bareback-to-slackey.geojson?raw';

	let map: Map;
	let mapElement: HTMLElement;

	onMount(async () => {
		if (mapElement) {
			initMap();
		}
	});

	function addGpxRoute(geoJsonData: GeoJsonObject, map: Map) {
		const routeGroup = L.featureGroup();

		const geoJsonLayer = L.geoJSON(geoJsonData, {
			style: function (feature) {
				return {
					color: 'transparent',
					weight: 0,
					opacity: 0
				};
			},
			onEachFeature: function (feature, layer) {
				if (feature.geometry.type === 'LineString') {
					const coordinates = feature.geometry.coordinates as [number, number, number][];
					const latlngs = coordinates.map((coord) => [coord[1], coord[0], coord[2]] as LatLngTuple);

					const maxElevation = Math.max(
						...latlngs.map((coord) => coord[2]).filter((elevation) => elevation !== undefined)
					);

					latlngs.forEach((coord, index) => {
						if (coord.length < 3 || !coord[2]) return;
						if (index === 0) return;
						const prevCoord = latlngs[index - 1];
						if (prevCoord.length < 3 || !prevCoord[2]) return;

						const elevation = (coord[2] + prevCoord[2]) / 2;
						const normalizedElevation = elevation / maxElevation;
						const color = getColor(normalizedElevation);

						// Debug log
						// console.log(
						//   `Creating polyline with color: ${color}, elevation: ${elevation}`,
						// );

						const polyline = L.polyline([prevCoord, coord], {
							color: color,
							weight: 2,
							opacity: 1,
							className: 'elevation-line' // Add a class for easier debugging
						});

						routeGroup.addLayer(polyline);
					});
				}
			}
		});

		routeGroup.addTo(map);

		map.fitBounds(routeGroup.getBounds());
	}

	async function addContourMap(map: Map) {
		try {
			// const response = await fetch('src/lib/data/geo/marquette-county-contours-smoothed.geojson');
			const response = await fetch('src/lib/data/geo/marquette-county-contours-smoothed.geojson');
			const marquetteContourData = await response.json();

			L.geoJSON(marquetteContourData, {
				style: function (feature) {
					return {
						color: 'white',
						weight: 0.25,
						opacity: 1,
						fillOpacity: 1
					};
				},
				onEachFeature: (feature, layer) => {
					if (feature.properties && feature.properties.level) {
						layer.bindPopup(`Elevation: ${feature.properties.level}m`);
					}
				}
			}).addTo(map);
		} catch (err) {
			console.error(err);
		}
	}

	async function initMap() {
		try {
			const geoJsonRouteData = JSON.parse(geoJsonFile) as GeoJsonObject;
			// const geoJsonRouteData = convertToGeoJson(gpxRouteData);
			// const routeCenter = getRouteCenter(gpxRouteData);
			const routeCenter = getGeoJsonRouteCenter(geoJsonRouteData);
			// downloadGeoJSONasSVG(geoJsonRouteData, "my-map.svg");

			map = L.map(mapElement, {
				renderer: L.canvas({ padding: 0.5 })
			}).setView(routeCenter, 12);

			addContourMap(map);
			addGpxRoute(geoJsonRouteData, map);
		} catch (err) {
			console.error(err);
		}
	}

	function resizeMap() {
		if (map) map.invalidateSize();
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
</svelte:head>

<div bind:this={mapElement} class="map"></div>

<svelte:window on:resize={resizeMap} />

<style>
	.map {
		height: 800px;
		width: 100%;
	}
	div {
		width: 100vw;
		height: 100vh;
	}

	/* These globals ensure the black background shows up */
	:global(.leaflet-container) {
		background-color: #000000 !important;
	}

	:global(.leaflet-control-container .leaflet-pane) {
		background-color: #000000;
	}

	/* Makes sure the canvas background is also black */
	:global(.leaflet-canvas-layer) {
		background-color: #000000;
	}
</style>
