<script lang="ts">
	import { loadWasmModule } from '$lib/wasm-loader';
	import type { Snippet } from 'svelte';

	interface Props {
		autoLoad: boolean;
		loaded: boolean;
		onload?: (result: { success: boolean; error?: any }) => void;
		children?: Snippet;
	}

	let { autoLoad, loaded = $bindable(false), onload, children }: Props = $props();


	$effect(() => {
		if (autoLoad) {
			loadWasm();
		}
	});

	export async function loadWasm() {
		try {
			await loadWasmModule();
			loaded = true;
			onload?.({ success: true });
		} catch (error) {
			// console.error('Failed to load WebAssembly module:', error);
			onload?.({ success: false, error });
		}
	}
</script>
