<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { FormField, FormLabel, FormDescription } from '$lib/components/ui/form/';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';

	// Svelte 5 props
	const { data }: { data: SuperValidated<Infer<FormSchema>> } = $props();

	// Form state
	let selectedFileName = $state('');
	let isSubmitting = $state(false);
	let isDragging = $state(false);
	let isValid = $state(true);
	let fileInputRef = $state<HTMLInputElement | null>(null);

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onSubmit: () => {
			isSubmitting = true;
		},
		onResult: ({ result }) => {
			console.log('form submission result: ', result);
			isSubmitting = false;

			// Clear file input on successful submission
			if (result.type === 'success') {
				selectedFileName = '';
				if (fileInputRef) {
					fileInputRef.value = '';
				}
			}
		},
		onError: (error) => {
			console.log('form submission error: ', error);
			isSubmitting = false;
		}
	});

	const { enhance, errors, message } = form;

	// Handle file selection
	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		processFiles(input.files);
	}

	function processFiles(files: FileList | null) {
		if (files && files.length > 0) {
			console.log('files: ', files);
			const file = files[0];
			selectedFileName = file.name;

			// Validate file type
			isValid = file.name.endsWith('.gpx');

			// Copy the file to the actual form input - with null checks
			const formInput = document.getElementById('gpxFile') as HTMLInputElement | null;
			if (formInput && typeof DataTransfer !== 'undefined') {
				try {
					// Create a DataTransfer object
					const dataTransfer = new DataTransfer();
					// Add the selected file
					dataTransfer.items.add(file);
					// Set the files property
					formInput.files = dataTransfer.files;
				} catch (error) {
					console.error('Error setting file input:', error);
				}
			}
		} else {
			selectedFileName = '';
			isValid = true;
		}
	}

	// Handle drag events for the drop zone
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
</script>

<div
	class="mx-auto mt-8 w-full max-w-md rounded-lg border border-orange-700/30 bg-black/30 p-6 shadow-xl backdrop-blur-sm"
>
	<h2 class="mb-4 text-2xl font-light text-orange-400">Upload GPX Route</h2>
	<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-4">
		<FormField {form} name="gpxFile">
			<div>
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

		{#if $errors.gpxFile}
			<div class="text-sm text-red-400">{$errors.gpxFile}</div>
		{/if}

		{#if $message}
			<div class="text-sm text-red-400">{$message}</div>
		{/if}

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
					></div>
					Processing...
				{:else}
					Submit
				{/if}
			</FormButton>
		</div>
	</form>
</div>
