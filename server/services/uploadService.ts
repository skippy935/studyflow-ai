import { v2 as cloudinary } from 'cloudinary';
import pdfParse from 'pdf-parse';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('image/') ? 'image' : 'raw';
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: 'studybuild', public_id: `${Date.now()}-${filename}` },
      (err, result) => { if (err || !result) reject(err); else resolve(result.secure_url); }
    );
    stream.end(buffer);
  });
}

export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text.trim();
  }
  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8').trim();
  }
  // For images, return empty — OCR can be added later
  return '';
}
