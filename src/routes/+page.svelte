<script lang="ts">
	import type { PageData } from './$types';
	import Form from '$lib/components/Form/index.svelte';
	import { enhance } from '$app/forms';
	import harlowContour from '$lib/images/harlow-area-contour-2-01.jpg';

	export let data: PageData;
</script>

<main class="relative flex h-screen w-screen">
	<enhanced:img
		class="absolute h-screen w-full object-cover"
		src={harlowContour ?? ''}
		alt="dark themed contour map of harlow lake recreation area in marquette, michigan"
	/>
	<div class=" m-auto max-w-[500px]">
		<Form data={data.form} />
	</div>
</main>
