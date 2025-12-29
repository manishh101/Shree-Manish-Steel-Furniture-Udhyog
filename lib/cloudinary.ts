import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(file: Buffer, folder: string = 'manish-steel') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

// Upload from base64 string
export async function uploadToCloudinary(base64: string, folder: string = 'manish-steel'): Promise<{
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64,
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
          });
        }
      }
    );
  });
}

// Alias for deleteImage
export async function deleteFromCloudinary(publicId: string) {
  return deleteImage(publicId);
}
