<script lang="ts">
	import { onMount } from 'svelte';
	import {
		canvas as createCanvas,
		map as mapConstructor,
		featureGroup as featureGroupL,
		geoJSON as geoJSONL,
		polyline as polylineL,
		tileLayer as tileLayerL,
		type LatLngTuple,
		type Map
	} from 'leaflet';

	import {
		convertGpxStringToGeoJson,
		getColorFromElevation,
		getGeoJsonRouteCenter
	} from '$lib/utils/geojson';

	import type { Feature, GeoJsonObject, Geometry, LineString } from 'geojson';

	// import gpxString from '../data/geo/bareback-to-rickles.gpx?raw';

	let { gpxString, mapReady }: { gpxString: string; mapReady: boolean } = $props();

	// import geoJsonFile from '../data/geo/bareback-to-slackey.geojson?raw';

	let map: Map;
	let mapElement: HTMLElement;

	onMount(async () => {
		if (mapElement) {
			initMap();
		}
	});

	function addGpxRoute(geoJsonData: GeoJsonObject, map: Map) {
		const routeGroup = featureGroupL();

		const geoJsonLayer = geoJSONL(geoJsonData, {
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
						const color = getColorFromElevation(normalizedElevation);

						// Debug log
						// console.log(
						//   `Creating polyline with color: ${color}, elevation: ${elevation}`,
						// );

						const polyline = polylineL([prevCoord, coord], {
							color: color,
							weight: 5,
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
			// const response = await fetch('src/lib/data/geo/harlow-contours-simplified.json?raw');
			// const marquetteContourData = await response.json();
			// console.log('json: ', marquetteContourData);

			// L.geoJSON(marquetteContourData, {
			// 	style: function (feature) {
			// 		return {
			// 			color: 'white',
			// 			weight: 0.25,
			// 			opacity: 1,
			// 			fillOpacity: 1
			// 		};
			// 	},
			// 	onEachFeature: (feature, layer) => {
			// 		if (feature.properties && feature.properties.level) {
			// 			layer.bindPopup(`Elevation: ${feature.properties.level}m`);
			// 		}
			// 	}
			// }).addTo(map);

			const topoLayer = tileLayerL('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
				maxZoom: 17,
				attribution:
					'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
				className: 'leaflet-tile-container'
			});
			topoLayer.addTo(map);
		} catch (err) {
			console.error(err);
		}
	}

	async function addBaseLayer(map: Map) {
		const topoLayer = tileLayerL('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution:
				'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
		});
		topoLayer.addTo(map);
	}

	async function initMap() {
		try {
			const featureCollection = await convertGpxStringToGeoJson(gpxString);

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
			// const geoJsonRouteData = convertToGeoJson(gpxRouteData);
			// const routeCenter = getRouteCenter(gpxRouteData);
			const routeCenter = getGeoJsonRouteCenter(routeCoordinates);
			// downloadGeoJSONasSVG(geoJsonRouteData, "my-map.svg");

			map = mapConstructor(mapElement, {
				renderer: createCanvas({ padding: 0.5 })
			}).setView(routeCenter, 12);

			addContourMap(map);
			addGpxRoute(routeFeature, map);
		} catch (err) {
			console.error(err);
		}
	}

	function resizeMap() {
		if (map) map.invalidateSize();
	}
</script>

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

	:global(.leaflet-tile-container) {
		filter: grayscale(100%) invert(100%);
		/* filter:	brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); */

		/* Desaturates and inverts colors */
		/* You might need further adjustments for brightness/contrast */
		/* filter: grayscale(100%) brightness(50%) contrast(150%); */
	}
</style>
