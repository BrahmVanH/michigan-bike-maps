import { superValidate } from 'sveltekit-superforms';
import { formSchema } from '@/components/Form/schema';
import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { getPresignedUrlsforDirectory, uploadGPXFile } from '@/API';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit } from '@/rateLimiter';
import type { s3Obj } from '@/types';



export const load = (async () => {
  const instructionsS3Dir = 'instructions';

  let instructionsImgObjs: s3Obj[] = []
  try {

    instructionsImgObjs = await getPresignedUrlsforDirectory(instructionsS3Dir);
  } catch (err) {
    console.error("Error fetching instructions images from s3", err);
    instructionsImgObjs = []
  }

  const form = await superValidate(zod(formSchema));
  return { form, instructionsImgObjs };
}) satisfies ServerLoad;

export const actions = {
  default: async (event) => {

    await checkRateLimit(event);


    const formData = await event.request.formData();
    const gpxFile = formData.get('gpxFile') as File;

    if (!gpxFile || gpxFile.size === 0) {
      const form = await superValidate(formData, zod(formSchema));
      form.errors.gpxFile = ['Please upload a GPX file'];
      return fail(400, { form });
    }

    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (gpxFile.size > MAX_SIZE_BYTES) {
      formData.delete("gpxFile")
      const form = await superValidate(formData, zod(formSchema));
      form.errors.gpxFile = [`File exceeds maximum size of ${MAX_SIZE_MB}MB`];
      return fail(400, { form });
    }

    try {
      const arrayBuffer = await gpxFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);



      const fileName = uuidv4() + '.gpx.gz';

      const uploadResult = await uploadGPXFile(fileName, fileBuffer);

      formData.delete('gpxFile');

      const form = await superValidate(formData, zod(formSchema));

      return {
        form,
        uploadResult: {
          success: true,
          fileName,
          size: gpxFile.size,
          type: gpxFile.type,
          message: 'File uploaded to S3 successfully',
          s3Status: uploadResult.$metadata.httpStatusCode
        }
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);

      formData.delete('gpxFile');

      const form = await superValidate(formData, zod(formSchema));

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