<script lang="ts">
	import { mapThemeOptions, MapThemeOptions } from '@/config/map';

	import { onMount } from 'svelte';
	import Label from '../ui/label/label.svelte';

	interface Props {
		selectedTheme: MapThemeOptions;
		setSelectedTheme: (arg0: MapThemeOptions) => void;
		setMapTheme: (style: MapThemeOptions) => void;
		setGpxRouteStyle: (theme: MapThemeOptions) => void;
	}

	let {
		selectedTheme = $bindable(),
		setSelectedTheme,
		setMapTheme,
		setGpxRouteStyle
	}: Props = $props();



	function handleThemeSelect(e: MouseEvent, key: MapThemeOptions) {
		e.preventDefault();
		setSelectedTheme(key as MapThemeOptions);
		setMapTheme(key as MapThemeOptions);
		setGpxRouteStyle(key as MapThemeOptions);
	}

	onMount(() => {
		const themeSelectorEl = document.querySelector('.theme-selector');

		themeSelectorEl?.classList.add('active');
		setTimeout(() => {}, 9000);
	});
</script>

<div class="theme-selector hidden lg:flex">
	<Label>Theme:</Label>
	{#each Object.keys(mapThemeOptions) as key}
		<button
			class:selected={selectedTheme === key}
			onclick={(e) => handleThemeSelect(e, key as MapThemeOptions)}
		>
			{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
		</button>
	{/each}
</div>

<!-- <div class="theme-select lg:hidden">
	<Select type="single" name="mapTheme" value={selectedTheme}>
		<Trigger class="z-[2147483647]">
			{triggerContent}
		</Trigger>
		<Content class="theme-select-content">
			<Group>
				<Label>Map Theme</Label>
				{#each Object.keys(mapThemeOptions) as key}
					<Item
						value={key}
						label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
					>
						{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
					</Item>
				{/each}
			</Group>
		</Content>
	</Select>
</div> -->

<!-- Mobile Drawer for map style selection, cant use until i figure out how to fix map render focus thing -->
<!-- <div class="lg:hidden">
	<Drawer>
		<DrawerTrigger>
			<button class="drawer-trigger-btn" aria-label="Select Map Theme"> Map Theme </button>
		</DrawerTrigger>
		<DrawerContent>
			<div class="drawer-content">
				<h2 class="drawer-title">Select Map Theme</h2>
				<RadioGroup value={selectedTheme}>
					{#each Object.keys(mapThemeOptions) as key}
						<div class="theme-radio-item">
							<RadioItem value={key} id={'drawer-radio-' + key} />
							<Label>
								{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
							</Label>
						</div>
					{/each}
				</RadioGroup>
			</div>
		</DrawerContent>
	</Drawer>
</div> -->

<style>
	.theme-selector {
		position: absolute;
		top: 24px;
		right: 24px;
		z-index: 3000;
		opacity: 0;
		background: rgba(30, 30, 30, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		padding: 12px 18px;
		height: min-content;
		width: min-content;
		align-items: center;
		gap: 10px;
		font-family: inherit;
		color: #fff;
		transition: opacity 1s ease-in-out;
	}

	:global(.theme-selector.active) {
		opacity: 1 !important;
	}
	.theme-selector label {
		font-weight: bold;
		margin-right: 8px;
		color: rgb(251, 146, 60);
		letter-spacing: 1px;
	}
	.theme-selector button {
		color: #fff;
		border: none;
		text-wrap: nowrap;
		border-radius: 4px;
		padding: 6px 14px;
		cursor: pointer;
		font-size: 0.75rem;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.theme-selector button.selected,
	.theme-selector button:hover {
		background: rgba(154, 52, 18, 0.6);
		color: #fff;
	}

	/* Drawer trigger button styling */
	.drawer-trigger-btn {
		position: absolute;
		top: 24px;
		right: 24px;
		z-index: 2147483647;
		background: rgba(30, 30, 30, 0.95);
		color: rgb(251, 146, 60);
		font-weight: bold;
		border: none;
		border-radius: 8px;
		padding: 12px 18px;
		font-size: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		letter-spacing: 1px;
	}

	.drawer-content {
		padding: 24px 16px;
		background: rgba(30, 30, 30, 0.98);
		border-radius: 16px;
		color: #fff;
		display: flex;
		flex-direction: column;
		gap: 18px;
		align-items: flex-start;
	}

	.drawer-title {
		font-size: 1.2rem;
		font-weight: bold;
		color: rgb(251, 146, 60);
		margin-bottom: 8px;
		letter-spacing: 1px;
	}

	.theme-radio-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
	}

	.theme-radio-item label {
		font-weight: 600;
		color: rgb(251, 146, 60);
		letter-spacing: 1px;
		font-size: 1rem;
		cursor: pointer;
		padding: 0 4px;
	}

	.theme-radio-item input[type='radio'] {
		accent-color: rgb(251, 146, 60);
		width: 22px;
		height: 22px;
		margin-right: 2px;
		border: 2px solid rgb(251, 146, 60);
		background: #222;
	}

	/* :global(.theme-select .ui-select__trigger) {
		color: #fff;
		background: none;
		border: none;
		border-radius: 4px;
		padding: 6px 14px;
		font-size: 0.75rem;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	:global(.theme-select .ui-select__trigger:hover),
	:global(.theme-select .ui-select__trigger[aria-expanded='true']) {
		background: rgba(154, 52, 18, 0.6);
		color: #fff;
	}
	:global(.theme-select .ui-select__content) {
		background: rgba(30, 30, 30, 0.98);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		color: #fff;
		font-size: 0.75rem;
		padding: 8px 0;
	}
	:global(.theme-select .ui-select__item) {
		color: #fff;
		padding: 6px 14px;
		border-radius: 4px;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	:global(.theme-select .ui-select__item[aria-selected='true']),
	:global(.theme-select .ui-select__item:hover) {
		background: rgba(154, 52, 18, 0.6);
		color: #fff;
	}
	:global(.theme-select .ui-select__label) {
		font-weight: bold;
		color: rgb(251, 146, 60);
		letter-spacing: 1px;
		margin-bottom: 4px;
		padding-left: 14px;
	} */
</style>
