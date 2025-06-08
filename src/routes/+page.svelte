<script lang="ts">
	import type { PageData } from './$types';
	import Form from '@/components/Form/index.svelte';
	import harlowContour from '$lib/images/harlow-area-contour-2-01.jpg';
	import harlowContourMobile from '$lib/images/harlow-area-contour-mobile-01.jpg';

	export let data: PageData;

	const {form, instructionsImgObjs} = data;
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
		<Form data={form} instructionsS3Objs={instructionsImgObjs} />
	</div>
</main>
