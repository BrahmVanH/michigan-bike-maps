import { superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/components/Form/schema';
import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { uploadGPXFile } from '@/API';
import { v4 as uuidv4 } from 'uuid';

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
    try {
      // Convert the file to an ArrayBuffer and then to a Buffer
      const arrayBuffer = await gpxFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Upload the file to S3
      const uploadResult = await uploadGPXFile(gpxFile.name, fileBuffer);

      console.log('S3 upload result:', uploadResult);

      // IMPORTANT: Remove the file from formData before validation
      // to prevent serialization errors
      formData.delete('gpxFile');

      // Now validate the form without the file
      const form = await superValidate(formData, zod(formSchema));

      // Return success with metadata
      return {
        form,
        uploadResult: {
          success: true,
          filename: uuidv4,
          size: gpxFile.size,
          type: gpxFile.type,
          message: 'File uploaded to S3 successfully',
          s3Status: uploadResult.$metadata.httpStatusCode
        }
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);

      // Remove the file from formData
      formData.delete('gpxFile');

      // Validate the form
      const form = await superValidate(formData, zod(formSchema));

      // Return the error
      return fail(500, {
        form,
        uploadResult: {
          success: false,
          message: 'Failed to upload file to S3',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
} satisfies Actions;