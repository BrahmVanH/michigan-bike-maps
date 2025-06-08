<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ConsentBanner from '@/components/ConsentBanner.svelte';
	import Gtag from '@/components/Gtag.svelte';
	
	import '../app.css';

	let { children } = $props();
</script>

<Gtag />
<svelte:head> <script nonce="%sveltekit.nonce%">
	window.dataLayer = window.dataLayer || [];
	function gtag() {
			dataLayer.push(arguments);
	}
	
	gtag('consent', 'default', {
			functionality_storage: 'granted',
			security_storage: 'granted',
			analytics_storage: 'denied',
			ad_personalization: 'denied',
			ad_storage: 'denied',
			ad_user_data: 'denied',
			personalization_storage: 'denied'
	});
	
	window.gtag = gtag;
</script>

<script async src="https://www.googletagmanager.com/gtag/js?id=G-895GM9HCBS" nonce="%sveltekit.nonce%"></script>

<script nonce="%sveltekit.nonce%">
	window.addEventListener('load', function () {
			if (window.gtag) {
					gtag('js', new Date());
					gtag('config', 'G-895GM9HCBS', {
							anonymize_ip: true,
							cookie_flags: 'SameSite=Strict;Secure'
					});
			}
	});
</script>
</svelte:head>

<Seo />
{@render children()}
<ConsentBanner />
