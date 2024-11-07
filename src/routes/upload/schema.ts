import { z } from 'zod';

export const formSchema = z.object({
	gpxFile: z
		.instanceof(File)
		.refine((file) => file.name.endsWith('.gpx'), 'File must be a .gpx file')
});

export type FormSchema = typeof formSchema;
