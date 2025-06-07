<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { loadWasmModule } from '$lib/wasm-loader';
  
  const dispatch = createEventDispatcher();
  
  export let autoLoad = true;
  export let loaded = false;
  
  // Initialize WASM on component mount if autoLoad is true
  onMount(async () => {
    if (autoLoad) {
      await loadWasm();
    }
  });
  
  // Function to load WASM manually if autoLoad is false
  export async function loadWasm() {
    try {
      await loadWasmModule();
      loaded = true;
      dispatch('load', { success: true });
    } catch (error) {
      console.error('Failed to load WebAssembly module:', error);
      dispatch('load', { success: false, error });
    }
  }
</script>

{#if $$slots.default}
  <slot {loaded} />
{/if}