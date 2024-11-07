<script lang="ts">
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import type { PageData } from './$types';
	import GpxForm from './gpx-form.svelte';
	export let data: PageData;
</script>

<!-- <GpxForm data={data.form} /> -->
<LeafletMap />
