<script lang="ts">
	import { page } from '$app/state';
	import { metatag } from '$lib/config/seo';

	// Using Svelte 5 props syntax
	const { title, description, keywords, author, follow, language, canonical, og } = metatag;
</script>

<svelte:head>
	<title>{title}</title>
	<link rel="canonical" href={canonical || page.url.href} />
	<meta name="language" content={language} />
	<meta name="description" content={description} />

	{#if keywords.length}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}
	{#if author}
		<meta name="author" content={author} />
	{/if}

	<meta name="robots" content={follow ? 'index,follow' : 'noindex,nofollow'} />
	<meta name="url" content={page.url.href} />

	<meta property="og:title" content={title} />
	<meta property="og:site_name" content={og.siteName} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content={og.type} />
	<meta property="og:locale" content={language} />

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
