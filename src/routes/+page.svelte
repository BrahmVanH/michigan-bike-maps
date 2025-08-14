<script lang="ts">
	import type { PageData } from './$types';
	import Form from '@/components/Form/index.svelte';
	import harlowContour from '$lib/images/harlow-area-contour-2-01.jpg';
	import harlowContourMobile from '$lib/images/harlow-area-contour-mobile-01.jpg';
	import { onMount } from 'svelte';
	// import Map from '$lib/components/map/index.svelte';

	let { data }: { data: PageData } = $props();
	let clientLoaded = $state(false);
	let mapReady = $state(false);

	let lazyMap = $state<Promise<any> | null>(null);

	function handleMapReady() {
		mapReady = true;
	}

	function loadMap() {
		lazyMap = import('$lib/components/map/index.svelte');
	}

	const { form, instructionsImgObjs } = data;

	let gpxString = $state<string | null>(null);

	function setGpxString(newGpxString: string) {
		gpxString = newGpxString;
	}

	function delayedSetGpxString(newGpxString: string) {
		setTimeout(() => {
			gpxString = newGpxString;
		}, 1500);
	}

	onMount(() => {
		loadMap();
		console.log('typeof lazymap import: ', typeof lazyMap);
	});
</script>

<main class="relative flex h-screen w-screen">
	<enhanced:img
		class="absolute hidden h-screen w-full object-cover lg:block"
		src={harlowContour ?? ''}
		alt="dark themed contour map of harlow lake recreation area in marquette, michigan"
	/>
	<enhanced:img
		class="absolute h-screen w-full object-cover lg:hidden"
		src={harlowContourMobile ?? ''}
		alt="dark themed contour map of harlow lake recreation area in marquette, michigan"
	/>
	<div class="mx-2 flex h-screen w-full lg:m-auto lg:block lg:h-min lg:max-w-[500px]">
		{#if lazyMap}
			{#await lazyMap then { default: Map }}
				<Map />
			{/await}
		{/if}
		<!-- {#if gpxString}
		{:else}
			<Form
				data={form}
				instructionsS3Objs={instructionsImgObjs}
				{delayedSetGpxString}
				{setGpxString}
			/>
		{/if} -->
	</div>
</main>
