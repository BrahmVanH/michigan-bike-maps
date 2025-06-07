
<script lang="ts">
	/**
	 * GPX File Upload Form Component
	 *
	 * This component provides a user interface for uploading GPX route files, with client-side
	 * processing using WebAssembly for compression before submission to the server.
	 *
	 * Features:
	 * - Drag and drop file upload interface
	 * - Client-side validation for file type (.gpx)
	 * - WebAssembly-based compression to reduce file size
	 * - Visual feedback during upload process
	 * - Success/error handling with appropriate user messaging
	 */

	// Import WebAssembly loader and compression function
	import { loadWasmModule, reduceCompressGpx } from '$lib/wasm-loader';

	// Import UI components and form handling utilities
	import { FormField } from '$lib/components/ui/form/';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';
	import { onMount } from 'svelte';
	import WasmLoader from '../WasmLoader.svelte';

	/**
	 * Form data passed from the server-side load function
	 * Contains form validation schema and initial values
	 */
	const { data }: { data: SuperValidated<Infer<FormSchema>> } = $props();

	// Component state variables using Svelte 5 reactivity
	let selectedFileName = $state(''); // Name of the selected file
	let isSubmitting = $state(false); // Whether the form is currently submitting
	let isDragging = $state(false); // Whether a file is being dragged over the drop zone
	let isValid = $state(true); // Whether the selected file is a valid GPX file
	let fileInputRef = $state<HTMLInputElement | null>(null); // Reference to the hidden file input
	let uploadSuccess = $state(false); // Whether the upload was successful
	let uploadMessage = $state(''); // Message to display to the user
	let wasmLoaded = $state(false); // Whether the WebAssembly module has loaded

	// /**
	//  * Initialize the WebAssembly module on component mount
	//  * This ensures the compression functionality is available when needed
	//  */
	// onMount(async () => {
	// 	try {
	// 		await loadWasmModule();
	// 		wasmLoaded = true;
	// 	} catch (err) {
	// 		console.error('Failed to load WASM module:', err);
	// 	}
	// });

	/**
	 * Initialize the form with validation and lifecycle hooks
	 * This sets up form submission handling, validation, and result processing
	 */
	const form = superForm(data, {
		validators: zodClient(formSchema),
		onSubmit: () => {
			isSubmitting = true;
		},
		onResult: ({ result }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				// ...existing success code
			} else if (result.type === 'failure') {
				uploadSuccess = false;

				// Check for rate limiting errors (status code 429)
				if (result.status === 429) {
					uploadMessage = 'You have made too many upload attempts. Please try again later.';
				}
				// Check for custom error message from server
				else if (result.data?.uploadResult?.message) {
					uploadMessage = result.data.uploadResult.message;
				}
				// Default error message
				else {
					uploadMessage = 'There was an error uploading your file.';
				}
			} else {
				uploadSuccess = false;
				uploadMessage = 'There was an error uploading your file.';
			}
		},
		onError: (error) => {
			isSubmitting = false;
			uploadSuccess = false;
			uploadMessage = 'There was an error uploading your file.';
		}
	});

	// Extract form utilities from the superForm instance
	const { enhance, errors, message } = form;

	/**
	 * Handle file selection from the file input
	 * Triggered when a user selects a file through the browser dialog
	 *
	 * @param event - The file input change event
	 */
	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		processFiles(input.files);
	}

	/**
	 * Process the selected GPX files
	 * This function:
	 * 1. Validates that the file is a GPX file
	 * 2. Compresses the file using WebAssembly if available
	 * 3. Updates the hidden form input with the processed file
	 *
	 * @param files - The FileList from the file input or drop event
	 */
	async function processFiles(files: FileList | null) {
		if (!files || files.length === 0) {
			selectedFileName = '';
			isValid = true;
			return;
		}

		const file = files[0];

		selectedFileName = file.name;

		// Validate file extension is .gpx
		isValid = selectedFileName.toLowerCase().endsWith('.gpx');

		// Check the file's content type or signature
		try {
			const firstBytes = await readFirstBytes(file, 100);
			const fileContent = new TextDecoder().decode(firstBytes);

			// Basic check for XML structure and GPX content
			if (!fileContent.includes('<?xml') || !fileContent.includes('<gpx')) {
				isValid = false;
				uploadMessage = 'Invalid GPX file content';
				return;
			}
		} catch (error) {
			console.error('Error checking file content:', error);
			isValid = false;
			uploadMessage = 'Unable to validate file content';
			return;
		}

		if (!isValid) return;

		if (wasmLoaded) {
			try {
				// Process the file using WebAssembly for compression
				const fileText = await file.text();
				const compressedFileDataArray = reduceCompressGpx(fileText);

				// Create a new file from the compressed data
				const blob = new Blob([compressedFileDataArray], { type: 'application/octet-stream' });
				const compressedFile = new File([blob], file.name.replace('.gpx', '.gpx.gz'), {
					type: 'application/gzip'
				});

				// Update the hidden form input with the compressed file
				const formInput = document.getElementById('gpxFile') as HTMLInputElement | null;
				if (formInput && typeof DataTransfer !== 'undefined') {
					try {
						const dataTransfer = new DataTransfer();
						dataTransfer.items.add(compressedFile);
						formInput.files = dataTransfer.files;

						selectedFileName = compressedFile.name;
					} catch (error) {
						console.error('Error setting file input:', error);
					}
				}
			} catch (error) {
				console.error('Error processing file with WASM:', error);
				uploadMessage = 'Error processing GPX file';
				uploadSuccess = false;
			}
		} else {
			// If WebAssembly is not available, use the original file
			const formInput = document.getElementById('gpxFile') as HTMLInputElement | null;
			if (formInput && typeof DataTransfer !== 'undefined') {
				try {
					const dataTransfer = new DataTransfer();
					dataTransfer.items.add(file);
					formInput.files = dataTransfer.files;
				} catch (error) {
					console.error('Error setting file input:', error);
				}
			}
		}
	}

	async function readFirstBytes(file: File, bytesToRead: number): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			const blob = file.slice(0, bytesToRead);

			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = () => reject(reader.error);
			reader.readAsArrayBuffer(blob);
		});
	}

	/**
	 * Drag and drop event handlers
	 * These functions manage the visual state of the drop zone and handle file drops
	 */
	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = true;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = false;

		if (event.dataTransfer) {
			processFiles(event.dataTransfer.files);
		}
	}

	/**
	 * Reset the form to its initial state
	 * Used after a successful upload to allow for another upload
	 */
	function resetForm() {
		uploadSuccess = false;
		uploadMessage = '';
		selectedFileName = '';
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}
</script>

<!-- 
Main form container with backdrop blur effect
Uses a semi-transparent background to maintain contrast against map backgrounds
-->
<WasmLoader bind:loaded={wasmLoaded} on:load={({ detail }) => {
  if (!detail.success) {
    uploadMessage = 'WebAssembly module failed to load. Some features may be limited.';
  }
}} />
<div
	class="my-auto h-min w-full max-w-md rounded-lg border border-orange-700/30 bg-black/30 p-6 shadow-xl backdrop-blur-sm"
>
	<h2 class="mb-4 text-2xl font-light text-orange-400">Upload GPX Route</h2>

	<!-- Success state displayed after successful upload -->
	{#if uploadSuccess}
		<div class="space-y-6">
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<!-- Success icon -->
				<div class="mb-4 rounded-full bg-green-900/30 p-3">
					<svg
						class="h-12 w-12 text-green-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<!-- Success message -->
				<h3 class="mb-2 text-xl font-medium text-green-400">Upload Successful!</h3>
				<p class="text-gray-300">{uploadMessage}</p>
				<p class="mt-3 text-sm text-gray-400">Thank you for contributing to our project!</p>
			</div>

			<!-- Button to reset form and upload another file -->
			<button
				type="button"
				class="w-full rounded-md border border-orange-800 bg-orange-800/60 px-4 py-2 text-sm font-medium text-white
							shadow-md transition-all duration-200 ease-in-out hover:bg-orange-700/80 focus:ring-2
							focus:ring-orange-500/50 focus:ring-offset-1 focus:outline-none"
				onclick={resetForm}
			>
				Upload Another Route
			</button>
		</div>
		<!-- Form state for file selection and upload -->
	{:else}
		<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-4">
			<FormField {form} name="gpxFile">
				<div>
					<!-- 
										Drag and drop file upload area
										Changes appearance based on drag state and file validity
									-->
					<div
						role="button"
						tabindex="0"
						class="mt-1 flex flex-col items-center justify-center rounded-md border border-orange-700/40 p-6 transition-colors
											{isDragging ? 'border-orange-500 bg-orange-900/20' : 'hover:border-orange-500/60'} 
											{!isValid && selectedFileName ? 'border-red-500 bg-red-900/20' : ''}"
						ondragenter={handleDragEnter}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						ondrop={handleDrop}
					>
						<div class="flex flex-col items-center justify-center text-center">
							<!-- File upload icon that changes color based on drag/validity state -->
							<svg
								class="mx-auto h-12 w-12 {isDragging
									? 'text-orange-500'
									: 'text-orange-400/70'} {!isValid && selectedFileName ? 'text-red-500' : ''}"
								stroke="currentColor"
								fill="none"
								viewBox="0 0 48 48"
								aria-hidden="true"
							>
								<path
									d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>

							<!-- Dynamic text based on file selection state -->
							<div class="mt-2 flex flex-col text-sm text-gray-200">
								<p class="font-medium">
									{#if isDragging}
										Drop your GPX file here
									{:else if selectedFileName && !isValid}
										Invalid file type. Please select a .gpx file
									{:else if selectedFileName}
										{selectedFileName}
									{:else}
										<span
											>Drop your GPX file here, or <label
												for="gpxFileHelper"
												class="cursor-pointer text-orange-400 hover:text-orange-300">browse</label
											></span
										>
									{/if}
								</p>
								{#if !selectedFileName}
									<p class="mt-1 text-xs text-gray-400">GPX files only (max 10MB)</p>
								{/if}
							</div>
						</div>

						<!-- 
												Hidden file inputs:
												- gpxFile: The actual form input that gets submitted
												- gpxFileHelper: Triggers the file browser dialog
											-->
						<input
							type="file"
							id="gpxFile"
							name="gpxFile"
							accept=".gpx"
							class="hidden"
							bind:this={fileInputRef}
						/>

						<input
							type="file"
							id="gpxFileHelper"
							name="gpxFileHelper"
							accept=".gpx"
							class="hidden"
							onchange={handleFileChange}
						/>
					</div>
				</div>
			</FormField>

			<!-- Validation error messages -->
			{#if $errors.gpxFile}
				<div class="text-sm text-red-400">{$errors.gpxFile}</div>
			{/if}

			{#if $message}
				<div class="text-sm text-red-400">{$message}</div>
			{/if}

			<!-- Custom error message from file processing -->
			{#if uploadMessage && !uploadSuccess}
				<div class="rounded-md border border-red-800/30 bg-red-900/20 p-3 text-sm text-red-400">
					{uploadMessage}
				</div>
			{/if}

			<!-- Submit button with loading state -->
			<div class="mt-6 flex items-center justify-end">
				<FormButton
					class="w-full rounded-md border border-orange-800 bg-orange-800/60 px-4 py-2 text-sm font-medium text-white 
									shadow-md transition-all duration-200 ease-in-out hover:bg-orange-700/80 focus:ring-2
									focus:ring-orange-500/50 focus:ring-offset-1 focus:outline-none"
					disabled={!!(isSubmitting || (selectedFileName && !isValid))}
				>
					{#if isSubmitting}
						<div
							class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"
							aria-hidden="true"
						></div>
						Processing...
					{:else}
						Submit
					{/if}
				</FormButton>
			</div>
		</form>
	{/if}
</div>
