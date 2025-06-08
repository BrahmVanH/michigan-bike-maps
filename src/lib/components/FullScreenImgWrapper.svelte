<script lang="ts">
  import { browser } from '$app/environment';

  // Props
  let { className = '' } = $props();

  // State
  let isOpen = $state(false);
  let dialogElement: HTMLDialogElement;

  // Open overlay
  function openOverlay(): void {
      isOpen = true;
  }

  // Close overlay
  function closeOverlay(): void {
      isOpen = false;
    
      if (browser) {
          document.body.classList.remove('overflow-hidden');
          document.documentElement.classList.remove('overflow-hidden');
      }
  }

  // Handle overlay click (click outside image to close)
  function handleOverlayClick(event: MouseEvent): void {
      if (event.target !== dialogElement) {
          closeOverlay();
      }
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
          closeOverlay();
      }
  }

  // Reactive effect for dialog management
  $effect(() => {
      if (!browser || !dialogElement) return;

      if (isOpen && dialogElement) {
          dialogElement.showModal();
          // Prevent body scroll when overlay is open
          document.body.classList.add('overflow-hidden');
          document.documentElement.classList.add('overflow-hidden');
      } else {
          dialogElement.close();
          // Restore body scroll
          document.body.classList.remove('overflow-hidden');
          document.documentElement.classList.remove('overflow-hidden');
      }
  });
</script>

<!-- Clickable thumbnail -->
<button
  type="button"
  class="cursor-zoom-in transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 {className}"
  onclick={openOverlay}
  aria-label="Click to view full size image"
>
  <slot />
</button>

<!-- Full-screen overlay -->
<dialog
  bind:this={dialogElement}
  class="fixed inset-0 z-50 h-full w-full max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/90 backdrop:backdrop-blur-sm"
  onclick={handleOverlayClick}
  onkeydown={handleKeydown}
>
  <div class="relative flex h-full w-full items-center justify-center p-4">
      <!-- Close button -->
      <button
          type="button"
          class="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white/80 transition-all duration-200 hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          onclick={closeOverlay}
          aria-label="Close full-screen view"
      >
          <svg
              class="h-6 w-6"
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
      </button>

      <!-- Full-size image container -->
      <div class="flex max-h-full max-w-full items-center justify-center">
          <slot />
      </div>

      <!-- Instructions text -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-3 py-2 text-sm text-white/80">
          Press <kbd class="rounded bg-white/20 px-1">Esc</kbd> or click outside to close
      </div>
  </div>
</dialog>

<style>
  dialog {
      border: none;
      outline: none;
  }

  dialog[open] {
      display: flex;
      position: fixed;
      inset: 0;
  }

  dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(4px);
  }

  /* Ensure the slotted image scales properly */
  dialog :global(img) {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  }

  /* Style the thumbnail image */
  button :global(img) {
      transition: transform 0.2s ease;
  }

  button:hover :global(img) {
      transform: scale(1.02);
  }
</style>