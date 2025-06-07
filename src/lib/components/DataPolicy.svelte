<script lang="ts">
  import { browser } from '$app/environment';

  // Props
  let { open = $bindable(false) } = $props();

  // Element references
  let dialogElement: HTMLDialogElement;

  // Close dialog function
  function closeDialog(): void {
      open = false;
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

  // Handle escape key to close dialog
  function handleDialogKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
          closeDialog();
      }
  }

  // Reactive effect for dialog management
  $effect(() => {
      if (!browser || !dialogElement) return;

      if (open && dialogElement) {
          dialogElement.showModal();
          // Prevent body scroll when dialog is open
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

<!-- GPX Data Usage Dialog -->
<dialog
  bind:this={dialogElement}
  class="max-h-[85vh] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%]
         overflow-y-auto rounded-lg border border-orange-700/30 bg-black/95 p-0 shadow-xl
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
          <h2 class="mb-4 text-xl font-light text-orange-400">
              How We Handle Your GPX Data
          </h2>

          <div class="mb-6 rounded-lg border border-green-700/30 bg-green-900/10 p-4">
              <div class="flex items-start space-x-3">
                  <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                      <h3 class="text-base font-medium text-green-400">Privacy-First Processing</h3>
                      <p class="mt-1 text-sm text-gray-300">
                          We automatically strip all personally identifiable information from your GPX files during processing.
                      </p>
                  </div>
              </div>
          </div>

          <h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">Data We Keep</h3>
          <p class="leading-relaxed text-gray-200">
              From your uploaded GPX file, we retain only the essential geographic data needed to display bike routes on our maps:
          </p>
          <ul class="space-y-2">
              <li class="text-gray-200">
                  <strong class="text-orange-300">GPS Coordinates</strong>: Latitude and longitude points that define your route
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Elevation Data</strong>: Height information for terrain visualization (if present)
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Timestamps</strong>: Time data points for route sequencing (anonymized)
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Route Geometry</strong>: The path structure for accurate map display
              </li>
          </ul>

          <h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">Data We Remove</h3>
          <p class="leading-relaxed text-gray-200">
              Before storing any route data, our system automatically removes all personally identifiable information:
          </p>
          <ul class="space-y-2">
              <li class="text-gray-200">
                  <strong class="text-orange-300">Personal Names</strong>: Any names, usernames, or identifiers
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Device Information</strong>: GPS device models, serial numbers, or unique identifiers
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Metadata</strong>: Creator information, software details, and file properties
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Comments & Descriptions</strong>: Personal notes, waypoint descriptions, or custom text
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Heart Rate & Speed</strong>: Personal fitness data (if present)
              </li>
          </ul>

          <h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">Processing & Storage</h3>
          <div class="space-y-4">
              <div class="rounded-lg border border-blue-700/30 bg-blue-900/10 p-4">
                  <h4 class="text-base font-medium text-blue-400 mb-2">🔒 Client-Side Processing</h4>
                  <p class="text-sm text-gray-300">
                      Initial data cleaning and compression happens directly in your browser using WebAssembly technology. 
                      This ensures your raw data never leaves your device unprocessed.
                  </p>
              </div>
              
              <div class="rounded-lg border border-purple-700/30 bg-purple-900/10 p-4">
                  <h4 class="text-base font-medium text-purple-400 mb-2">☁️ Secure Storage</h4>
                  <p class="text-sm text-gray-300">
                      Only the cleaned, anonymized route data is stored securely in our cloud infrastructure. 
                      We use industry-standard encryption and access controls.
                  </p>
              </div>
          </div>

          <h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">How We Use This Data</h3>
          <p class="leading-relaxed text-gray-200">
              The anonymized route data is used exclusively for:
          </p>
          <ul class="space-y-2">
              <li class="text-gray-200">
                  <strong class="text-orange-300">Map Display</strong>: Showing bike routes on our interactive maps
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Route Discovery</strong>: Helping other cyclists find bike-friendly paths
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Community Building</strong>: Contributing to Michigan's cycling route database
              </li>
              <li class="text-gray-200">
                  <strong class="text-orange-300">Safety Analysis</strong>: Identifying popular and safe cycling corridors
              </li>
          </ul>

          <h3 class="mt-6 mb-3 text-lg font-medium text-orange-400">Your Rights</h3>
          <div class="rounded-lg border border-orange-700/30 bg-orange-900/10 p-4">
              <ul class="space-y-2">
                  <li class="text-gray-200">
                      <strong class="text-orange-300">No Personal Tracking</strong>: Since we strip all PII, routes cannot be traced back to individuals
                  </li>
                  <li class="text-gray-200">
                      <strong class="text-orange-300">Community Benefit</strong>: Your contributions help build a comprehensive cycling resource for Michigan
                  </li>
                  <li class="text-gray-200">
                      <strong class="text-orange-300">Open Data</strong>: Processed route data contributes to open-source cycling maps
                  </li>
              </ul>
          </div>

          <div class="mt-6 rounded-lg border border-yellow-700/30 bg-yellow-900/10 p-4">
              <div class="flex items-start space-x-3">
                  <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                      <h4 class="text-base font-medium text-yellow-400">Important Note</h4>
                      <p class="mt-1 text-sm text-gray-300">
                          By uploading a GPX file, you confirm that you have the right to share this route data and 
                          consent to its use for community mapping purposes as described above.
                      </p>
                  </div>
              </div>
          </div>
      </div>

      <div class="mt-6 flex justify-end">
          <button
              type="button"
              class="rounded-md border border-orange-800 bg-orange-800/60 px-4 py-2 text-sm font-medium text-white
                     shadow-md transition-all duration-200 ease-in-out hover:bg-orange-700/80 focus:ring-2
                     focus:ring-orange-500/50 focus:ring-offset-1 focus:outline-none"
              onclick={closeDialog}
          >
              I Understand
          </button>
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
      background-color: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(6px);
  }
</style>