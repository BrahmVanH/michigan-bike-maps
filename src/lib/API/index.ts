import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_REGION_PROD, AWS_ACCESS_KEY_ID_PROD, AWS_SECRET_ACCESS_KEY_PROD, AWS_S3_BUCKET_PROD } from '$env/static/private'

const s3Client = new S3Client({
  region: AWS_REGION_PROD,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID_PROD,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_PROD,
  },
});

// Upload GPX file
interface UploadGPXFileResponse {
  // S3 PutObjectCommandOutput type properties
  $metadata: {
    httpStatusCode?: number;
    requestId?: string;
    attempts?: number;
    totalRetryDelay: number;
  };
}

export async function uploadGPXFile(fileName: string, fileBuffer: Buffer) {
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_PROD,
    Key: `gpx/${fileName}`,
    Body: fileBuffer,
    ContentType: 'application/gpx+xml',
  });

  return await s3Client.send(command);
}

// Generate presigned URL for download
export async function getGPXDownloadUrl(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `gpx/${fileName}`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}