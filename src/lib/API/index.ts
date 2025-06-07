/**
 * AWS S3 Integration Module
 * 
 * This module provides utility functions for interacting with Amazon S3 storage,
 * specifically for uploading and retrieving GPX files. It handles authentication,
 * file operations, and pre-signed URL generation for secure access to S3 resources.
 */

// AWS SDK imports for S3 client and command operations
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, type ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

// Import for generating pre-signed URLs to provide temporary access to private S3 objects
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Environment variables for S3 authentication and configuration
import {
  AWS_REGION_PROD,
  AWS_ACCESS_KEY_ID_PROD,
  AWS_SECRET_ACCESS_KEY_PROD,
  AWS_S3_BUCKET_GPX_PROD
} from '$env/static/private';
import type { s3Obj } from "@/types";

/**
 * S3 client instance configured with production credentials.
 * 
 * This client is used for all S3 operations and is configured with
 * the production AWS region and credentials from environment variables.
 */
const s3Client = new S3Client({
  region: AWS_REGION_PROD,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID_PROD,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_PROD,
  },
});

/**
 * Response interface for S3 upload operations.
 * 
 * This interface defines the expected structure of responses from S3 PutObject operations,
 * focusing on metadata about the request that can be used for logging and error handling.
 */
interface UploadGPXFileResponse {
  $metadata: {
    httpStatusCode?: number;    // HTTP status code of the S3 response
    requestId?: string;         // AWS request identifier for tracing
    attempts?: number;          // Number of retry attempts made
    totalRetryDelay: number;    // Total time spent in retry delays
  };
}

/**
 * Uploads a GPX file to Amazon S3.
 * 
 * This function uploads a binary buffer containing GPX data to S3 with appropriate
 * content type headers. The file is stored in a 'gpx/' prefix to organize
 * content within the bucket.
 * 
 * @param fileName - The name to give the file in S3 (should include file extension)
 * @param fileBuffer - Buffer containing the GPX file content to upload
 * @returns Promise resolving to the S3 response object with metadata about the operation
 * 
 * @example
 * ```typescript
 * const fileBuffer = Buffer.from(gpxString);
 * const result = await uploadGPXFile('route_123.gpx.gz', fileBuffer);
 * console.log(`Upload successful: ${result.$metadata.httpStatusCode === 200}`);
 * ```
 */
export async function uploadGPXFile(fileName: string, fileBuffer: Buffer) {
  // Construct the full S3 key with prefix for organization
  const Key = `gpx/${fileName}`;

  // Create an S3 PutObject command with appropriate parameters
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_GPX_PROD,           // Target S3 bucket
    Key,                                  // Object key (file path)
    Body: fileBuffer,                     // File content
    ContentType: 'application/gpx+xml',   // MIME type for GPX files
  });

  // Execute the command and return the response
  return await s3Client.send(command);
}


/**
 * Generates a pre-signed URL for downloading a GPX file from S3.
 * 
 * This function creates a temporary URL that allows downloading a specific
 * GPX file from S3 without requiring AWS credentials. The URL expires after
 * a specified time period.
 * 
 * @param fileName - The name of the file to download from S3
 * @returns Promise resolving to a pre-signed URL valid for 1 hour
 * 
 * @example
 * ```typescript
 * const downloadUrl = await getGPXDownloadUrl('route_123.gpx.gz');
 * // Provide downloadUrl to the user for temporary access to the file
 * ```
 * 
 * @note There appears to be an inconsistency between the bucket used here
 * (process.env.AWS_S3_BUCKET) and the one used in uploadGPXFile
 * (AWS_S3_BUCKET_GPX_PROD). This should be reviewed to ensure consistency.
 */
export async function getGPXDownloadUrl(fileName: string): Promise<string> {
  // Create an S3 GetObject command
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_GPX_PROD,    // Target S3 bucket (note: may differ from upload bucket)
    Key: `gpx/${fileName}`,               // Object key including prefix
  });

  // Generate a pre-signed URL that expires in 1 hour (3600 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}


export async function getPresignedUrlsforDirectory(prefix: string, expiresIn = 3600) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: AWS_S3_BUCKET_GPX_PROD,
      Prefix: prefix,
      MaxKeys: 1000

    })

    const listResponse: ListObjectsV2CommandOutput = await s3Client.send(command);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return [];
    }
    const imgExtensions = ['jpg'];

    const imgObjects = listResponse.Contents.filter(obj => {
      const key = obj?.Key?.toLowerCase();
      return imgExtensions.some(ext => key && key.endsWith(ext));
    });

    const presignedUrls = await Promise.all(
      imgObjects.map(async (obj) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: AWS_S3_BUCKET_GPX_PROD,
          Key: obj.Key,
        });

        const url = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn,
        });

        return {
          key: obj.Key,
          url,
          filename: obj.Key?.split('/').pop(), // Extract filename from key
          size: obj.Size,
          lastModified: obj.LastModified,
        } as s3Obj;
      })
    );

    return presignedUrls;
  } catch (error) {
    console.error('Error getting presigned URLs:', error);
    throw error;
  }
}