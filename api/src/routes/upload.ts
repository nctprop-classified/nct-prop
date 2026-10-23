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
      
      const bucket = c.env.BUCKET;
      if (bucket) {
        try {
          // Upload to Cloudflare R2
          await bucket.put(key, await file.arrayBuffer(), {
            httpMetadata: {
              contentType: file.type || 'image/webp'
            }
          });

          // If a custom R2 public domain is configured, use it; otherwise use the direct Worker proxy
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

      // Safe fallback: Convert to data URI for direct embedding
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
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
