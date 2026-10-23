import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env, UserSession } from './types';
import { authMiddleware } from './middleware/auth';
import { listingsRoute } from './routes/listings';
import { citiesRoute } from './routes/cities';
import { uploadRoute } from './routes/upload';
import { authRoute } from './routes/auth';
import { leadsRoute } from './routes/leads';
import { adminRoute } from './routes/admin';

const app = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

// Logger
app.use('*', logger());

// Dynamic CORS for Cloudflare Pages / Custom Domain / Localhost
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      // Allow localhost and production nctprop domains
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('nctprop.com') || origin.includes('.pages.dev')) {
        return origin || '*';
      }
      return 'https://nctprop.com';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Name', 'X-User-Phone', 'X-User-Role'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Auth inspection middleware
app.use('*', authMiddleware);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'nctprop-api',
    region: 'Delhi-NCR',
    timestamp: new Date().toISOString()
  });
});

// Serve images directly from Workers KV or R2 through Cloudflare edge cache
app.get('/api/images/*', async (c) => {
  const key = c.req.path.replace(/^\/api\/images\//, '');

  // 1. Check Workers KV (No credit card needed)
  if (c.env.IMAGES_KV) {
    try {
      const { value, metadata } = await c.env.IMAGES_KV.getWithMetadata<{ contentType?: string }>(key, 'arrayBuffer');
      if (value) {
        const headers = new Headers();
        headers.set('content-type', metadata?.contentType || 'image/webp');
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        return new Response(value, { headers });
      }
    } catch (kvErr) {
      console.warn('KV get error:', kvErr);
    }
  }

  // 2. Check Cloudflare R2 if available
  if (c.env.BUCKET) {
    try {
      const object = await c.env.BUCKET.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        return new Response(object.body, { headers });
      }
    } catch (err: any) {
      console.warn('R2 get error:', err);
    }
  }

  return c.text('Image not found', 404);
});

// Mount Routes
app.route('/api/cities', citiesRoute);
app.route('/api/listings', listingsRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/auth', authRoute);
app.route('/api/leads', leadsRoute);
app.route('/api/admin', adminRoute);

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found', path: c.req.path }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error('Unhandled Worker error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
