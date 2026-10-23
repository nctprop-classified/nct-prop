import { Hono } from 'hono';
import { Env, UserSession } from '../types';

export const uploadRoute = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

uploadRoute.post('/', async (c) => {
  try {
    const contentType = c.req.header('content-type') || '';
    
    // Check if multipart form-data
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const file = body['file'];

      if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: 'No valid image file uploaded.' }, 400);
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        return c.json({ success: false, error: 'File exceeds 5MB limit. Please compress image first.' }, 400);
      }

      const extension = file.name.split('.').pop() || 'webp';
      const key = `properties/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const arrayBuffer = await file.arrayBuffer();

      // 1. Try Workers KV first (100% Free, NO credit card needed)
      if (c.env.IMAGES_KV) {
        try {
          await c.env.IMAGES_KV.put(key, arrayBuffer, {
            metadata: { contentType: file.type || 'image/webp' }
          });
          return c.json({
            success: true,
            url: `/api/images/${key}`,
            key
          });
        } catch (kvErr: any) {
          console.warn('Workers KV put failed, falling back:', kvErr);
        }
      }

      // 2. Try Cloudflare R2 if available
      if (c.env.BUCKET) {
        try {
          await c.env.BUCKET.put(key, arrayBuffer, {
            httpMetadata: {
              contentType: file.type || 'image/webp'
            }
          });
          const publicDomain = c.env.R2_PUBLIC_DOMAIN;
          const imageUrl = publicDomain ? `${publicDomain}/${key}` : `/api/images/${key}`;
          return c.json({
            success: true,
            url: imageUrl,
            key
          });
        } catch (r2Error: any) {
          console.warn('R2 put failed, falling back to data URL:', r2Error);
        }
      }

      // 3. Resilient fallback: Convert to Data URI (Stored in D1 database, 5 GB free, zero card needed)
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      return c.json({
        success: true,
        url: `data:${file.type || 'image/webp'};base64,${base64}`,
        key: `local-${Date.now()}`
      });
    }

    return c.json({ success: false, error: 'Content-Type must be multipart/form-data.' }, 400);
  } catch (err: any) {
    console.error('Upload error:', err);
    return c.json({ success: false, error: err.message || 'Image upload failed.' }, 500);
  }
});
