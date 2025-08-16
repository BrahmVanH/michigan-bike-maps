<script lang="ts">
	import { onMount } from 'svelte';
	import {
		canvas as createCanvas,
		map as mapConstructor,
		featureGroup as featureGroupL,
		geoJSON as geoJSONL,
		polyline as polylineL,
		tileLayer as tileLayerL,
		latLngBounds as latLngBoundsL,
		type LatLngTuple,
		type Map,
		type Layer as LayerL,
		LatLng,
		Polyline
	} from 'leaflet';
	import '$lib/leaflet-edgebuffer';

	import {
		convertGpxStringToGeoJson,
		getColorFromElevation,
		getGeoJsonRouteCenter
	} from '$lib/utils/geojson';

	import type { Feature, GeoJsonObject, Geometry, LineString } from 'geojson';

	// import devGpxString from '$lib/test-data/Afternoon_Ride.gpx?raw';
	import { getBoundingBoxParams, initialMapCenter } from '@/config/map';
	// import { getJpegFromGeoTiff } from '@/wasm-loader';
	// import { fetchOpenTopoGeoTiff } from '@/API/opentopo';
	// import { uint8ArrayToDataUrl } from '@/utils/geotiff';

	let { gpxString }: { gpxString: string } = $props();
	// let { gpxString = devGpxString }: { gpxString?: string } = $props();

	// import geoJsonFile from '../data/geo/bareback-to-slackey.geojson?raw';

	let map: Map;
	let mapElement: HTMLElement;

	onMount(async () => {
		if (mapElement) {
			initMap();
			mapElement.offsetHeight;
			const mapControlZoomEl = document.querySelector('.leaflet-control-zoom');
			const mapControlAttrEl = document.querySelector('.leaflet-control-attribution');

			setTimeout(() => mapControlAttrEl?.classList.add('active'), 9000);
			setTimeout(() => mapControlZoomEl?.classList.add('active'), 8000);
			setTimeout(() => mapElement.classList.add('active'), 200);
			setTimeout(() => {
				addRouteToMap(gpxString);
			}, 5000);
			mapElement.classList.add('active');
			addRouteToMap(gpxString);
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

					let polylines: Polyline[] = [];
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
							opacity: 0,
							className: 'elevation-line' // Add a class for easier debugging
						});
						routeGroup.addLayer(polyline as unknown as LayerL);

						polylines.push(polyline);
					});

					let opacity = 0;
					const fadeInterval = setInterval(() => {
						opacity += 0.05;
						if (opacity >= 1) {
							opacity = 1;
							clearInterval(fadeInterval);
						}
						polylines.forEach((polyline) => polyline.setStyle({ opacity }));
					}, 1000);
				}
			}
		});

		routeGroup.addTo(map);

		// map.fitBounds(routeGroup.getBounds());
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

			const { routeFeature, routeCenter } = await getGpxRouteAndCenterFromString(gpxString);

			const latLngs = routeFeature.geometry.coordinates.map(
				(coord) => new LatLng(coord[1], coord[0])
			);
			const bounds = getBoundingBoxParams(
				initialMapCenter,
				new LatLng(routeCenter.lat, routeCenter.lng)
			);

			// const tileLayerUrl = buildOpenTopoApiUrl({
			// 	datasetName: 'USGS30m',
			// 	...bounds,
			// 	outputFormat: 'GTiff',
			// 	apiKey: PUBLIC_OPEN_TOPO_API_KEY
			// });

			// if (!tileLayerUrl) {
			// 	throw new Error('Error in creating tileLayerUrl');
			// }

			// const topoLayerTiffArrayBuffer = await fetchOpenTopoGeoTiff({
			// 	datasetName: 'USGS30m',
			// 	...bounds,
			// 	outputFormat: 'GTiff'
			// });

			// console.log('topo layer array buffer: ', topoLayerTiffArrayBuffer);
			// const topoLayerTiff = await topoLayerTiffRes.json();

			// if (!topoLayerTiff) {
			// 	throw new Error('Error in fetching tileLayerTiff');
			// }

			// const topoLayerJpeg = await getJpegFromGeoTiff(topoLayerTiffArrayBuffer);

			// const topoLayerJpegUrl = uint8ArrayToDataUrl(topoLayerJpeg);

			const defaultTileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';

			// console.log('topo layer jpeg: ', topoLayerJpegUrl);

			const topoLayer = tileLayerL(defaultTileUrl, {
				maxZoom: 20,
				edgeBufferTiles: 10,
				tube: {
					start: initialMapCenter,
					end: new LatLng(routeCenter.lat, routeCenter.lng)
				},
				attribution:
					'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
				className: 'leaflet-tile-container'
			});
			topoLayer.addTo(map);
		} catch (err) {
			// console.error(err);
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

	async function getGpxRouteAndCenterFromString(gpxString: string) {
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

			return { routeFeature, routeCenter };
		} catch (err: any) {
			// console.error('Error in getting gpx route and center from gpx string: ', err);
			throw new Error(`Error in getting gpx route and center from gpx string: ${err}`);
		}
	}
	async function addRouteToMap(gpxString: string) {
		const { routeFeature, routeCenter } = await getGpxRouteAndCenterFromString(gpxString);

		addGpxRoute(routeFeature, map);
		updateMapCenter(routeCenter as LatLng);
	}

	function updateMapCenter(center: LatLng) {
		map.flyTo(center, 13);
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

		return latLngBoundsL([minLat, minLng], [maxLat, maxLng]);
	}

	async function initMap() {
		try {
			map = mapConstructor(mapElement, {
				renderer: createCanvas({ padding: 0.5 })
			}).setView(initialMapCenter, 17);

			addContourMap(map);
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

	:global(.leaflet-control-zoom) {
		opacity: 0;
		transition:
			opacity 1s ease-in-out,
			transform 5s ease-out;
		transform: translateY(-20px);
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
</style>
