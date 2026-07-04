import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure Cloudinary if env vars are set
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(base64Data, folder = 'velora') {
  // Check if Cloudinary is configured
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.v2.uploader.upload(base64Data, {
        folder,
        resource_type: 'image',
      });
      return result.secure_url;
    } catch (err) {
      console.warn('[Image] Cloudinary upload failed, saving locally:', err.message);
    }
  }

  // Fallback: save to local uploads directory
  const uploadsDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    // Already a URL or invalid format, return as-is
    return base64Data;
  }

  const ext = matches[1].split('/')[1] || 'jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, matches[2], 'base64');
  return `/uploads/${filename}`;
}

export function isBase64(str) {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:') && str.includes(';base64,');
}
