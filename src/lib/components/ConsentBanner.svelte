<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Types
	interface ConsentSettings {
		functionality_storage: 'granted' | 'denied';
		security_storage: 'granted' | 'denied';
		analytics_storage: 'granted' | 'denied';
		ad_storage: 'granted' | 'denied';
		ad_user_data: 'granted' | 'denied';
		ad_personalization: 'granted' | 'denied';
		personalization_storage: 'granted' | 'denied';
	}

	// Constants
	const CONSENT_SETTINGS_KEY = 'userConsent';

	// Essential only settings
	const ESSENTIAL_SETTINGS: ConsentSettings = {
		functionality_storage: 'granted',
		security_storage: 'granted',
		analytics_storage: 'denied',
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		personalization_storage: 'denied'
	};

	// Accept all settings
	const FULL_SETTINGS: ConsentSettings = {
		functionality_storage: 'granted',
		security_storage: 'granted',
		analytics_storage: 'granted',
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		personalization_storage: 'denied'
	};

	// Reactive state
	let showBanner = $state(false);
	let showDialog = $state(false);
	let bannerElement: HTMLDivElement | null = $state(null);
	let dialogElement: HTMLDialogElement;

	// Check if user has already consented
	function hasExistingConsent(): boolean {
		if (!browser) return false;

		try {
			// Check localStorage first
			const localStorageConsent = localStorage.getItem(CONSENT_SETTINGS_KEY);
			if (localStorageConsent) return true;

			// Check cookies as fallback
			const cookieConsent = document.cookie
				.split('; ')
				.find((row) => row.startsWith('userConsent='));

			return !!cookieConsent;
		} catch (error) {
			// console.error('Error checking consent:', error);
			return false;
		}
	}

	// In ConsentBanner.svelte, update the saveConsent function:
	function saveConsent(settings: ConsentSettings): void {
		if (!browser) return;

		try {
			// Save to localStorage
			localStorage.setItem(CONSENT_SETTINGS_KEY, JSON.stringify(settings));

			// Save to cookie as backup
			const cookieValue = encodeURIComponent(JSON.stringify(settings));
			document.cookie = `userConsent=${cookieValue}; path=/; max-age=31536000; SameSite=Strict`;

			// Update Google Analytics consent if available
			if ((window as any).updateGoogleAnalyticsConsent) {
				(window as any).updateGoogleAnalyticsConsent(settings);
			}
		} catch (error) {
			// console.error('Failed to save consent:', error);
		}
	}

	// Handle essential only consent
	function acceptEssential(): void {
		saveConsent(ESSENTIAL_SETTINGS);
		showBanner = false;
	}

	// Handle accept all consent
	function acceptAll(): void {
		saveConsent(FULL_SETTINGS);
		showBanner = false;
	}

	// Show privacy policy dialog
	function openDialog(): void {
		showDialog = true;
		// Prevent body scroll when dialog is open
		if (browser) {
			document.body.classList.add('overflow-hidden');
			document.documentElement.classList.add('overflow-hidden');
		}
	}

	// Close privacy policy dialog
	function closeDialog(): void {
		showDialog = false;
		// Restore body scroll
		if (browser) {
			document.body.classList.remove('overflow-hidden');
			document.documentElement.classList.remove('overflow-hidden');
		}
	}

	// Handle dialog click outside to close
	function handleDialogClick(event: MouseEvent): void {
		if (event.target === dialogElement) {
			closeDialog();
		}
	}

	// Handle keyboard navigation in banner
	function handleBannerKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Tab') return;

		const focusableElements = bannerElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		if (event.shiftKey && document.activeElement === firstElement) {
			event.preventDefault();
			lastElement.focus();
		} else if (!event.shiftKey && document.activeElement === lastElement) {
			event.preventDefault();
			firstElement.focus();
		}
	}

	// Handle escape key to close dialog
	function handleDialogKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			closeDialog();
		}
	}

	// Initialize on mount
	onMount(() => {
		// Show banner if no existing consent
		showBanner = !hasExistingConsent();
	});

	// Reactive effect for dialog management
	$effect(() => {
		if (!browser || !dialogElement) return;

		if (showDialog && dialogElement) {
			dialogElement.showModal();
		} else {
			dialogElement.close();
		}
	});
</script>

<!-- Consent Banner -->
{#if showBanner}
	<div
		bind:this={bannerElement}
		class="fixed right-0 bottom-[120px] left-0 z-[1000] w-full bg-black/40 p-2 backdrop-blur-sm lg:bottom-0"
		role="dialog"
		tabindex="0"
		aria-labelledby="consent-message"
		aria-describedby="consent-message"
		onkeydown={handleBannerKeydown}
	>
		<div
			class="relative w-full rounded-lg border border-orange-700/30 bg-black/60 p-4 shadow-xl backdrop-blur-sm"
		>
			<div
				class="flex flex-col items-center justify-between text-sm lg:flex-row [&_p]:leading-relaxed"
			>
				<span id="consent-message" class="text-sm text-gray-200 lg:text-base">
					We use essential cookies for security and functionality. You can choose to enable
					analytics cookies to help us improve your experience.
				</span>
				<div class="mt-3 flex flex-col gap-2 sm:flex-row lg:mt-0 lg:ml-4">
					<button
						type="button"
						class="rounded-md border border-orange-700/40 bg-transparent px-3 py-1.5 text-xs font-medium text-orange-300
                             transition-all duration-200 ease-in-out hover:border-orange-600/60 hover:bg-orange-900/20
                             focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-1 focus:outline-none"
						onclick={openDialog}
					>
						View Policy
					</button>
					<button
						type="button"
						class="rounded-md border border-orange-700/40 bg-transparent px-3 py-1.5 text-xs font-medium text-orange-300
                             transition-all duration-200 ease-in-out hover:border-orange-600/60 hover:bg-orange-900/20
                             focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-1 focus:outline-none"
						onclick={acceptEssential}
					>
						Essential Only
					</button>
					<button
						type="button"
						class="rounded-md border border-orange-800 bg-orange-800/60 px-3 py-1.5 text-xs font-medium text-white
                             shadow-md transition-all duration-200 ease-in-out hover:bg-orange-700/80 focus:ring-2
                             focus:ring-orange-500/50 focus:ring-offset-1 focus:outline-none"
						onclick={acceptAll}
					>
						Accept All
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Privacy Policy Dialog -->
<dialog
	bind:this={dialogElement}
	class="max-h-[80vh] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%]
             overflow-y-auto rounded-lg border border-orange-700/30 bg-black/90 p-0 shadow-xl
             backdrop-blur-sm duration-200 sm:rounded-lg"
	onclick={handleDialogClick}
	onkeydown={handleDialogKeydown}
>
	<div class="relative p-6">
		<button
			type="button"
			class="absolute top-4 right-4 rounded-full bg-orange-900/30 p-2 opacity-70
                     transition-all duration-200 hover:bg-orange-800/40 hover:opacity-100 focus:ring-2
                     focus:ring-orange-500/50 focus:outline-none"
			onclick={closeDialog}
			aria-label="Close dialog"
		>
			<!-- Updated close icon to match the theme -->
			<svg
				class="h-4 w-4 text-orange-300"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
			<span class="sr-only">Close</span>
		</button>

		<div
			class="prose prose-sm prose-headings:text-orange-400 prose-p:text-gray-200 prose-li:text-gray-200
                      prose-strong:text-orange-300 prose-a:text-orange-400 prose-a:hover:text-orange-300
                      max-w-none"
		>
			<h2 class="mb-4 text-xl font-light text-orange-400">Privacy Policy & Cookie Consent</h2>

			<h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">Essential Technical Features</h3>
			<p class="leading-relaxed text-gray-200">
				We use certain technical features that are necessary for the security and basic
				functionality of our website. These features are always active and include:
			</p>
			<ul class="space-y-2">
				<li class="text-gray-200">
					<strong class="text-orange-300">Rate Limiting</strong>: We monitor the frequency of page
					visits, especially for our donation page, to prevent abuse and ensure fair access for all
					users.
				</li>
				<li class="text-gray-200">
					<strong class="text-orange-300">Error Monitoring</strong>: We use
					<a
						href="https://sentry.io"
						target="_blank"
						rel="noreferrer noopener"
						class="text-orange-400 transition-colors hover:text-orange-300">Sentry</a
					>
					to track technical errors that occur on our website. This helps us identify and fix issues
					quickly to maintain a stable service.
				</li>
				<li class="text-gray-200">
					<strong class="text-orange-300">Basic Cookie Storage</strong>: Essential cookies required
					for the website's ability to function properly.
				</li>
			</ul>
			<p class="leading-relaxed text-gray-200">
				These features collect minimal technical data and are used solely for security and
				functionality purposes. By using our website, you consent to these essential features.
			</p>

			<h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">
				Optional Analytics (Google Analytics)
			</h3>
			<p class="leading-relaxed text-gray-200">
				We offer the option to help us improve our website through analytics tracking. This is
				completely optional and includes:
			</p>
			<ul class="space-y-2">
				<li class="text-gray-200">
					<strong class="text-orange-300">Website Usage Analytics</strong>: Understanding how
					visitors use our website
				</li>
				<li class="text-gray-200">
					<strong class="text-orange-300">Performance Monitoring</strong>: Measuring website loading
					times and performance
				</li>
				<li class="text-gray-200">
					<strong class="text-orange-300">Navigation Patterns</strong>: Learning which content is
					most useful to visitors
				</li>
			</ul>
			<p class="leading-relaxed text-gray-200">
				If you consent to analytics, we will use Google Analytics with the following limited scope:
			</p>
			<ul class="space-y-1">
				<li class="text-gray-200">analytics_storage: To analyze website usage patterns</li>
				<li class="text-gray-200">functionality_storage: To maintain your analytics preferences</li>
			</ul>
			<p class="leading-relaxed text-gray-200">We do NOT enable:</p>
			<ul class="space-y-1">
				<li class="text-gray-200">Ad personalization</li>
				<li class="text-gray-200">Advertising cookies</li>
				<li class="text-gray-200">Cross-site tracking</li>
				<li class="text-gray-200">Remarketing features</li>
			</ul>

			<h4 class="mt-6 mb-3 text-base font-medium text-orange-400">Your Choices</h4>
			<p class="leading-relaxed text-gray-200">You have two options:</p>
			<ol class="space-y-3">
				<li class="text-gray-200">
					<strong class="text-orange-300">Essential Only (Default)</strong>
					<ul class="mt-1 ml-4 space-y-1">
						<li class="text-sm text-gray-300">Includes only essential technical features</li>
						<li class="text-sm text-gray-300">Required for website security and functionality</li>
						<li class="text-sm text-gray-300">Minimal data collection</li>
					</ul>
				</li>
				<li class="text-gray-200">
					<strong class="text-orange-300">Accept All</strong>
					<ul class="mt-1 ml-4 space-y-1">
						<li class="text-sm text-gray-300">Includes everything in Essential Only</li>
						<li class="text-sm text-gray-300">Adds Google Analytics tracking</li>
						<li class="text-sm text-gray-300">Helps us improve website experience</li>
						<li class="text-sm text-gray-300">No advertising or personalization features</li>
					</ul>
				</li>
			</ol>
			<p class="leading-relaxed text-gray-200">
				You can change your preferences at any time through our cookie settings panel.
			</p>
		</div>
	</div>
</dialog>

<style>
	dialog[open] {
		display: grid;
		position: fixed;
		left: 50%;
		top: 50%;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}
</style>
