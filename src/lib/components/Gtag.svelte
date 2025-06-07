<script lang="ts" >
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// Your Google Analytics ID
	const GA_ID = 'G-895GM9HCBS'; // Updated to match your actual ID

	// Types for consent settings
	interface ConsentSettings {
		functionality_storage: 'granted' | 'denied';
		security_storage: 'granted' | 'denied';
		analytics_storage: 'granted' | 'denied';
		ad_storage: 'granted' | 'denied';
		ad_user_data: 'granted' | 'denied';
		ad_personalization: 'granted' | 'denied';
		personalization_storage: 'granted' | 'denied';
	}

	let isGtagReady = $state(false);
	let pendingConsentUpdate: ConsentSettings | null = null;

	// Wait for gtag to be ready
	function waitForGtag(): Promise<void> {
		return new Promise((resolve) => {
			const checkGtag = () => {
				if ((window as any).gtag && (window as any).dataLayer) {
					isGtagReady = true;
					resolve();
				} else {
					setTimeout(checkGtag, 100);
				}
			};
			checkGtag();
		});
	}

	// Update consent function with better error handling
	async function updateGoogleAnalyticsConsent(settings: ConsentSettings): Promise<void> {
		if (!browser) return;

		try {
			// If gtag isn't ready yet, store the settings to apply later
			if (!isGtagReady) {
				pendingConsentUpdate = settings;
				console.log('Gtag not ready, storing consent update for later:', settings);
				return;
			}

			// Apply the consent update
			if ((window as any).gtag) {
				(window as any).gtag('consent', 'update', settings);
				console.log('Google Analytics consent updated:', settings);
			} else {
				console.warn('gtag function not available');
			}
		} catch (error) {
			console.error('Failed to update GA consent:', error);
		}
	}

	// Initialize and load stored consent
	onMount(async () => {
		if (!browser) return;

		try {
			// Make the consent updater globally available
			(window as any).updateGoogleAnalyticsConsent = updateGoogleAnalyticsConsent;

			// Wait for gtag to be ready before applying any stored consent
			await waitForGtag();
			console.log('Google Analytics gtag is ready');

			// Apply any pending consent update
			if (pendingConsentUpdate) {
				await updateGoogleAnalyticsConsent(pendingConsentUpdate);
				pendingConsentUpdate = null;
			}

			// Load any stored consent from localStorage
			const stored = localStorage.getItem('userConsent');
			if (stored) {
				const settings = JSON.parse(stored);
				await updateGoogleAnalyticsConsent(settings);
			}
		} catch (error) {
			console.error('Failed to initialize Google Analytics:', error);
		}
	});
</script>

<svelte:head>
	<!-- Initialize dataLayer first -->
	<script nonce="%sveltekit.nonce%">
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}

		// Set default consent immediately (restrictive)
		gtag('consent', 'default', {
			functionality_storage: 'granted',
			security_storage: 'granted',
			analytics_storage: 'denied',
			ad_personalization: 'denied',
			ad_storage: 'denied',
			ad_user_data: 'denied',
			personalization_storage: 'denied'
		});

		// Make gtag globally available
		window.gtag = gtag;
	</script>

	<!-- Load Google Analytics script -->
	<script async defer src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} nonce="%sveltekit.nonce%"></script>

	<!-- Configure Google Analytics after script loads -->
	<script nonce="%sveltekit.nonce%">
		// Wait for the gtag script to load, then configure
		window.addEventListener('load', function () {
			if (window.gtag) {
				gtag('js', new Date());
				gtag('config', 'G-895GM9HCBS', {
					anonymize_ip: true,
					cookie_flags: 'SameSite=Strict;Secure'
				});
				console.log('Google Analytics configured');
			}
		});
	</script>
</svelte:head>
