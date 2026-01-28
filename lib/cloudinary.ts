import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Helper function to upload image to Cloudinary
export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  folder: string = 'taskkash/avatars'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'image',
        format: 'webp', // Convert to WebP for better performance
        quality: 'auto:good',
        fetch_format: 'auto',
        transformation: [
          {
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face',
          },
          {
            quality: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Unknown error occurred during upload'));
        }
      }
    ).end(file);
  });
}

// Helper function to delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
