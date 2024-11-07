<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { FormControl, FormField, FormLabel } from '$lib/components/ui/form';
	// import backgroundImage from './assets/images/sharper-harlow-contour-bareback-slacky-gpx-nebula-and-white-on-black.jpg';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	// import { formSchema, type FormSchema } from "$lib/schema";
	// import type { SuperFormData } from 'sveltekit-superforms/client';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';
	// import { validators } from 'tailwind-merge';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<main class="bg-main bg-reapeat h-screen w-screen bg-cover bg-center">
	<!-- <img
    src={backgroundImage}
    alt="colorized gpx route transposed over black and white contour map"
    class="w-full"
  /> -->
	<!-- conditional rendering -->
	<div class=" flex h-full w-full items-center justify-center bg-transparent">
		<form method="POST" use:enhance>
			<FormField {form} name="gpxFile">
				<FormControl let:attrs>
					<FormLabel for="gpxRoute">Upload a GPX file:</FormLabel>
					<Input
						{...attrs}
						bind:value={$formData.gpxFile}
						type="file"
						id="gpxRoute"
						name="gpxRoute"
						accept=".gpx"
					/>
				</FormControl>
				<Button type="submit">Submit</Button>
			</FormField>
			<FormButton>Submit</FormButton>
		</form>
	</div>
</main>

<style>
	.bg-main {
		background-image: url('./assets/images/sharper-harlow-contour-bareback-slacky-gpx-nebula-and-white-on-black.jpg');
	}
</style>
