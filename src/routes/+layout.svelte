<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ConsentBanner from '@/components/ConsentBanner.svelte';
	import Gtag from '@/components/Gtag.svelte';
	
	import '../app.css';

	let { children } = $props();
</script>

<Gtag />

<Seo />
{@render children()}
<ConsentBanner />
