<script lang="ts">
	/**
	 * SEO Metadata Component
	 *
	 * This component centralizes the application's SEO metadata management by:
	 * - Setting document title and meta descriptions
	 * - Managing canonical URLs
	 * - Adding OpenGraph metadata for social media sharing
	 * - Configuring robots directives
	 * - Supporting proper indexing with structured metadata
	 *
	 * The component reads from a central SEO configuration and the current page
	 * context to generate appropriate metadata tags.
	 */

	import { page } from '$app/state'; // Import current page data from SvelteKit
	import { metatag } from '$lib/config/seo'; // Import centralized SEO configuration

	// Destructure the SEO configuration for easier access
	const {
		title, // Page title
		description, // Meta description
		keywords, // SEO keywords array
		author, // Content author
		follow, // Whether search engines should index and follow links
		language, // Content language (e.g., 'en-US')
		canonical, // Canonical URL (if different from current URL)
		og // OpenGraph metadata for social sharing
	} = metatag;
</script>

<!-- 
svelte:head injects content into the document's <head> element
This ensures SEO metadata is properly included in the rendered HTML
-->
<svelte:head>
	<!-- Document title - primary factor for SEO -->
	<title>{title}</title>

	<!-- 
		Canonical URL - prevents duplicate content issues
		Falls back to current page URL if not explicitly set
	-->
	<link rel="canonical" href={canonical || page.url.href} />

	<!-- Basic metadata -->
	<meta name="language" content={language} />
	<meta name="description" content={description} />

	<!-- Keywords (only added if provided) -->
	{#if keywords.length}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}

	<!-- Author information (only added if provided) -->
	{#if author}
		<meta name="author" content={author} />
	{/if}

	<!-- 
		Search engine directives
		Controls whether search engines should index this page and follow its links
	-->
	<meta name="robots" content={follow ? 'index,follow' : 'noindex,nofollow'} />

	<!-- URL metadata for discovery -->
	<meta name="url" content={page.url.href} />

	<!-- 
		OpenGraph metadata for social media sharing
		Enhances appearance when content is shared on platforms like Facebook, Twitter, LinkedIn
	-->
	<meta property="og:title" content={title} />
	<meta property="og:site_name" content={og.siteName} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content={og.type} />
	<meta property="og:locale" content={language} />

	<!-- 
		OpenGraph image metadata
		Supports multiple images with their properties
		Each property is conditionally rendered only if provided
	-->
	{#each og.image as image}
		{#if image.url}
			<meta property="og:image" content={image.url} />
		{/if}
		{#if image.secureUrl}
			<meta property="og:image:secure_url" content={image.secureUrl} />
		{/if}
		{#if image.type}
			<meta property="og:image:type" content={image.type} />
		{/if}
		{#if image.width}
			<meta property="og:image:width" content={image.width} />
		{/if}
		{#if image.height}
			<meta property="og:image:height" content={image.height} />
		{/if}
		{#if image.alt}
			<meta property="og:image:alt" content={image.alt} />
		{/if}
	{/each}
</svelte:head>
