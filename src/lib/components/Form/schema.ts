/**
 * Form Validation Schema for GPX File Upload
 * 
 * This module defines the validation schema for the GPX file upload form
 * using Zod, a TypeScript-first schema validation library. The schema
 * is used by both client and server-side validation in the application.
 */

import { z } from 'zod'; // Import Zod validation library

/**
 * Form validation schema for GPX file uploads.
 * 
 * Currently uses a simple 'any' validator for the file input as advanced
 * file validation is handled programmatically in the component and server:
 * - Client-side: validates file extension and processes with WebAssembly
 * - Server-side: validates the file exists and is within size limits
 * 
 * @note For more robust validation, this could be enhanced to:
 * - Validate file size limits (currently handled by SvelteKit's built-in limits)
 * - Enforce file type restrictions with more specific validators
 * - Add additional form fields like route name, description, etc.
 */
export const formSchema = z.object({
	// File input field accepting GPX files
	// Using z.any() as file validation happens in component logic
	// and server-side processing rather than in the schema
	gpxFile: z.any()
});

/**
 * TypeScript type derived from the Zod schema.
 * 
 * This type is used throughout the application to ensure
 * type safety when working with form data.
 */
export type FormSchema = typeof formSchema;