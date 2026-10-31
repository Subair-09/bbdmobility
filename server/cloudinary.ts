import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log(`[Cloudinary] Configured successfully for cloud: ${cloudName}`);
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
  console.log('[Cloudinary] Configured via CLOUDINARY_URL.');
} else {
  console.warn('[Cloudinary] Warning: CLOUDINARY credentials not set in environment. Running in fallback mode.');
}

/**
 * Checks if Cloudinary is configured with valid credentials
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
  );
}

/**
 * Upload an image (base64 data URI, buffer, or remote URL) to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'bbdmobility/proofs'
): Promise<{ url: string; public_id?: string; bytes?: number; format?: string }> {
  if (!fileData) {
    throw new Error('No image data provided for upload.');
  }

  // If Cloudinary is configured, upload to Cloudinary CDN
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(fileData, {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        format: result.format,
      };
    } catch (err: any) {
      console.error('[Cloudinary Upload Error]:', err.message || err);
      throw new Error(`Cloudinary upload failed: ${err.message || 'Unknown error'}`);
    }
  }

  // Graceful fallback for local development or when credentials are not yet added
  console.warn('[Cloudinary] Missing credentials. Storing data URL fallback directly.');
  return {
    url: fileData,
    public_id: `fallback-${Date.now()}`,
  };
}

export { cloudinary };
