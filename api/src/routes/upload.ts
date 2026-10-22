import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { requireAuth } from '../middleware/auth';

export const uploadRoute = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

uploadRoute.post('/', requireAuth(), async (c) => {
  try {
    const contentType = c.req.header('content-type') || '';
    
    // Check if multipart form-data
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const file = body['file'];

      if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: 'No valid image file uploaded.' }, 400);
      }

      // Max size: 2MB (remember client-side compression will keep it < 300KB)
      if (file.size > 2 * 1024 * 1024) {
        return c.json({ success: false, error: 'File exceeds 2MB limit. Please compress image first.' }, 400);
      }

      const extension = file.name.split('.').pop() || 'webp';
      const key = `properties/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
      
      const bucket = c.env.BUCKET;
      if (bucket) {
        // Upload to Cloudflare R2
        await bucket.put(key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: file.type || 'image/webp'
          }
        });

        const publicDomain = c.env.R2_PUBLIC_DOMAIN || 'https://images.nctprop.com';
        return c.json({
          success: true,
          url: `${publicDomain}/${key}`,
          key
        });
      } else {
        // Local fallback (when running wrangler dev without R2 local simulated bucket or mock)
        // Convert to data URI for local preview
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return c.json({
          success: true,
          url: `data:${file.type};base64,${base64}`,
          key: `local-${Date.now()}`
        });
      }
    }

    return c.json({ success: false, error: 'Content-Type must be multipart/form-data.' }, 400);
  } catch (err: any) {
    console.error('Upload error:', err);
    return c.json({ success: false, error: err.message || 'Image upload failed.' }, 500);
  }
});
