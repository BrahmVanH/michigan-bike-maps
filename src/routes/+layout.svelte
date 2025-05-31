<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Seo />
{@render children()}
