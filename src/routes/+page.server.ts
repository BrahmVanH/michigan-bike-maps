import { superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/components/Form/schema';
import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = (async () => {
  // Create an empty form for initial page load
  const form = await superValidate(zod(formSchema));
  return { form };
}) satisfies ServerLoad;

export const actions = {
  default: async ({ request }) => {
    console.log("request: ", request);
    const formData = await request.formData();
    console.log("formData: ", formData);

    // Check if a file was uploaded
    const gpxFile = formData.get('gpxFile') as File;
    if (!gpxFile || gpxFile.size === 0) {
      const form = await superValidate(formData, zod(formSchema));
      form.errors.gpxFile = ['Please upload a GPX file'];
      return fail(400, { form });
    }

    // Process the GPX file here
    console.log('Processing file:', gpxFile.name, gpxFile.size);

    // IMPORTANT: Remove the file from formData before validation
    // to prevent serialization errors
    formData.delete('gpxFile');

    // Now validate the form without the file
    const form = await superValidate(formData, zod(formSchema));

    // Return metadata about the file instead of the file itself
    return {
      form,
      uploadResult: {
        success: true,
        filename: gpxFile.name,
        size: gpxFile.size,
        type: gpxFile.type,
        message: 'File uploaded successfully'
      }
    };
  }
} satisfies Actions;