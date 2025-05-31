import { z } from 'zod';

// For file uploads, we don't validate the actual File object in the schema
// Instead, we just validate if it exists
export const formSchema = z.object({
	gpxFile: z.any()
});

export type FormSchema = typeof formSchema;